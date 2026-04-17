from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class HCPBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    specialty: str | None = Field(None, max_length=100)
    hospital: str | None = Field(None, max_length=200)
    city: str | None = Field(None, max_length=100)
    email: str | None = Field(None, max_length=200)
    phone: str | None = Field(None, max_length=50)
    notes: str | None = Field(None, max_length=1000)


class HCPCreate(HCPBase):
    pass


class HCPUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    specialty: str | None = None
    hospital: str | None = None
    city: str | None = None
    email: str | None = None
    phone: str | None = None
    notes: str | None = None


class HCPRead(HCPBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
