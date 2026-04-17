from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Interaction


async def list_interactions(
    session: AsyncSession,
    *,
    hcp_id: int | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Interaction], int]:
    base = select(Interaction)
    if hcp_id is not None:
        base = base.where(Interaction.hcp_id == hcp_id)

    total = (await session.execute(
        select(func.count()).select_from(base.subquery())
    )).scalar_one()

    stmt = base.order_by(Interaction.occurred_at.desc()).limit(limit).offset(offset)
    result = await session.execute(stmt)
    return list(result.scalars().all()), int(total)


async def get_interaction(session: AsyncSession, interaction_id: int) -> Interaction | None:
    return await session.get(Interaction, interaction_id)


async def create_interaction(
    session: AsyncSession,
    *,
    hcp_id: int,
    channel: str,
    outcome: str | None,
    sentiment: str | None,
    summary: str | None,
    raw_notes: str | None,
    products_discussed: list[str] | None,
    next_step: str | None,
    occurred_at: datetime | None,
) -> Interaction:
    row = Interaction(
        hcp_id=hcp_id,
        channel=channel,
        outcome=outcome,
        sentiment=sentiment,
        summary=summary,
        raw_notes=raw_notes,
        products_discussed=products_discussed,
        next_step=next_step,
        occurred_at=occurred_at or datetime.now(timezone.utc),
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row


async def update_interaction(
    session: AsyncSession,
    interaction_id: int,
    **fields,
) -> Interaction | None:
    row = await session.get(Interaction, interaction_id)
    if row is None:
        return None
    for key, value in fields.items():
        if value is not None and hasattr(row, key):
            setattr(row, key, value)
    await session.commit()
    await session.refresh(row)
    return row


async def delete_interaction(session: AsyncSession, interaction_id: int) -> bool:
    row = await session.get(Interaction, interaction_id)
    if row is None:
        return False
    await session.delete(row)
    await session.commit()
    return True
