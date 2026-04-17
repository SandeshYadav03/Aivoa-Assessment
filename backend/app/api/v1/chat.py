from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.agent.graph import run_turn
from app.core.deps import DbSession
from app.repositories import hcp_repo
from app.schemas.chat import ChatRequest, ChatResponse, ToolEvent
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

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

    return ChatResponse(
        reply=result["reply"],
        tool_events=[ToolEvent(**ev) for ev in result["tool_events"]],
    )
