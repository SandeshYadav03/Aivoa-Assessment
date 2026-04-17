from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

FollowUpStatus = Literal["open", "done", "cancelled"]


class FollowUpBase(BaseModel):
    hcp_id: int
    interaction_id: int | None = None
    due_at: datetime
    note: str | None = None
    status: FollowUpStatus = "open"


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hcp_id: int
    interaction_id: int | None
    due_at: datetime
    note: str | None
    status: FollowUpStatus
    created_at: datetime
    updated_at: datetime
