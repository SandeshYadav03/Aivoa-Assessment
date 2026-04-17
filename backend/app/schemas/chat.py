from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system", "tool"]
    content: str
    tool_name: str | None = None
    tool_call_id: str | None = None


class ChatRequest(BaseModel):
    hcp_id: int | None = Field(
        None,
        description="Currently-focused HCP. Passed to the agent as context so tools can default to this id.",
    )
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list)


class ToolEvent(BaseModel):
    tool: str
    args: dict[str, Any]
    result: Any | None = None
    error: str | None = None


class ChatResponse(BaseModel):
    reply: str
    tool_events: list[ToolEvent] = Field(default_factory=list)
