from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Channel = Literal["visit", "call", "email", "chat", "other"]
Outcome = Literal["positive", "neutral", "negative", "follow_up", "no_show"]
Sentiment = Literal["positive", "neutral", "negative"]


class InteractionBase(BaseModel):
    hcp_id: int
    channel: Channel = "visit"
    outcome: Outcome | None = None
    sentiment: Sentiment | None = None
    summary: str | None = None
    raw_notes: str | None = None
    products_discussed: list[str] | None = None
    next_step: str | None = None
    occurred_at: datetime | None = None


class InteractionCreate(InteractionBase):
    pass


class InteractionUpdate(BaseModel):
    channel: Channel | None = None
    outcome: Outcome | None = None
    sentiment: Sentiment | None = None
    summary: str | None = None
    raw_notes: str | None = None
    products_discussed: list[str] | None = None
    next_step: str | None = None
    occurred_at: datetime | None = None


class InteractionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hcp_id: int
    channel: Channel
    outcome: Outcome | None
    sentiment: Sentiment | None
    summary: str | None
    raw_notes: str | None
    products_discussed: list[str] | None
    next_step: str | None
    occurred_at: datetime
    created_at: datetime
    updated_at: datetime


class InteractionList(BaseModel):
    items: list[InteractionRead]
    total: int
    limit: int
    offset: int
