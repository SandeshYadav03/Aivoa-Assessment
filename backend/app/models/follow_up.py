from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class FollowUp(Base, TimestampMixin):
    __tablename__ = "follow_ups"

    id: Mapped[int] = mapped_column(primary_key=True)
    hcp_id: Mapped[int] = mapped_column(
        ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False, index=True
    )
    interaction_id: Mapped[int | None] = mapped_column(
        ForeignKey("interactions.id", ondelete="SET NULL"), nullable=True, index=True
    )

    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    note: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="open", nullable=False)  # open|done|cancelled

    hcp: Mapped["HCP"] = relationship(back_populates="follow_ups")  # noqa: F821
    interaction: Mapped["Interaction | None"] = relationship(back_populates="follow_ups")  # noqa: F821
