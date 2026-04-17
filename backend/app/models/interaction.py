from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Use JSONB on Postgres, fall back to JSON on SQLite (tests).
JsonList = JSON().with_variant(JSONB(), "postgresql")

from app.models.base import Base, TimestampMixin


class Interaction(Base, TimestampMixin):
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    hcp_id: Mapped[int] = mapped_column(
        ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False, index=True
    )

    channel: Mapped[str] = mapped_column(String(20), nullable=False)  # visit|call|email|chat
    outcome: Mapped[str | None] = mapped_column(String(50))           # positive|neutral|negative|follow_up
    sentiment: Mapped[str | None] = mapped_column(String(20))         # positive|neutral|negative
    summary: Mapped[str | None] = mapped_column(Text)
    raw_notes: Mapped[str | None] = mapped_column(Text)
    products_discussed: Mapped[list[str] | None] = mapped_column(JsonList)
    next_step: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    hcp: Mapped["HCP"] = relationship(back_populates="interactions")  # noqa: F821
    follow_ups: Mapped[list["FollowUp"]] = relationship(  # noqa: F821
        back_populates="interaction", cascade="all, delete-orphan"
    )
