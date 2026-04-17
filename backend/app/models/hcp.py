from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class HCP(Base, TimestampMixin):
    __tablename__ = "hcps"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    specialty: Mapped[str | None] = mapped_column(String(100), index=True)
    hospital: Mapped[str | None] = mapped_column(String(200))
    city: Mapped[str | None] = mapped_column(String(100), index=True)
    email: Mapped[str | None] = mapped_column(String(200))
    phone: Mapped[str | None] = mapped_column(String(50))
    notes: Mapped[str | None] = mapped_column(String(1000))

    interactions: Mapped[list["Interaction"]] = relationship(  # noqa: F821
        back_populates="hcp", cascade="all, delete-orphan"
    )
    follow_ups: Mapped[list["FollowUp"]] = relationship(  # noqa: F821
        back_populates="hcp", cascade="all, delete-orphan"
    )
