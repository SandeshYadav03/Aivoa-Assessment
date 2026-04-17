from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import FollowUp


async def create_follow_up(
    session: AsyncSession,
    *,
    hcp_id: int,
    due_at: datetime,
    note: str | None = None,
    interaction_id: int | None = None,
    status: str = "open",
) -> FollowUp:
    row = FollowUp(
        hcp_id=hcp_id,
        due_at=due_at,
        note=note,
        interaction_id=interaction_id,
        status=status,
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row


async def list_follow_ups(
    session: AsyncSession, *, hcp_id: int | None = None
) -> list[FollowUp]:
    stmt = select(FollowUp)
    if hcp_id is not None:
        stmt = stmt.where(FollowUp.hcp_id == hcp_id)
    stmt = stmt.order_by(FollowUp.due_at.asc())
    result = await session.execute(stmt)
    return list(result.scalars().all())
