from __future__ import annotations

import openai
from fastapi import APIRouter, HTTPException

from app.agent.graph import run_turn
from app.core.deps import DbSession
from app.core.logging import get_logger
from app.repositories import hcp_repo
from app.schemas.chat import ChatRequest, ChatResponse, ToolEvent
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

log = get_logger()

router = APIRouter(prefix="/chat", tags=["chat"])


def _rehydrate_history(history):
    msgs = []
    for m in history:
        if m.role == "user":
            msgs.append(HumanMessage(content=m.content))
        elif m.role == "assistant":
            msgs.append(AIMessage(content=m.content))
        elif m.role == "system":
            msgs.append(SystemMessage(content=m.content))
        elif m.role == "tool":
            msgs.append(
                ToolMessage(content=m.content, tool_call_id=m.tool_call_id or "")
            )
    return msgs


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, session: DbSession) -> ChatResponse:
    hcp_context: dict | None = None
    if payload.hcp_id is not None:
        hcp = await hcp_repo.get_hcp(session, payload.hcp_id)
        if hcp is None:
            raise HTTPException(status_code=404, detail=f"HCP {payload.hcp_id} not found")
        hcp_context = {
            "id": hcp.id,
            "name": hcp.name,
            "specialty": hcp.specialty,
            "city": hcp.city,
        }

    try:
        result = await run_turn(
            payload.message,
            history=_rehydrate_history(payload.history),
            hcp_context=hcp_context,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except openai.RateLimitError as e:
        log.warning("openrouter_rate_limit", error=str(e))
        raise HTTPException(
            status_code=429,
            detail="The chat provider (OpenRouter) is rate-limited right now. Please retry in a few minutes.",
        ) from e
    except openai.APIError as e:
        log.error("openrouter_api_error", error=str(e), status=getattr(e, "status_code", None))
        raise HTTPException(
            status_code=503,
            detail="The chat provider returned an error. Please try again shortly.",
        ) from e
    except Exception as e:
        log.error("chat_unhandled_error", error=str(e), error_type=type(e).__name__)
        raise HTTPException(
            status_code=500,
            detail="The agent failed to process this message. Please try again.",
        ) from e

    return ChatResponse(
        reply=result["reply"],
        tool_events=[ToolEvent(**ev) for ev in result["tool_events"]],
    )
