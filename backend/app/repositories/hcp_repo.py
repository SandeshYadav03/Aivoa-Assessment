from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import HCP


async def list_hcps(
    session: AsyncSession,
    *,
    query: str | None = None,
    specialty: str | None = None,
    city: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[HCP]:
    stmt = select(HCP)
    if query:
        like = f"%{query}%"
        stmt = stmt.where(or_(HCP.name.ilike(like), HCP.hospital.ilike(like)))
    if specialty:
        stmt = stmt.where(func.lower(HCP.specialty) == specialty.lower())
    if city:
        stmt = stmt.where(func.lower(HCP.city) == city.lower())
    stmt = stmt.order_by(HCP.name).limit(limit).offset(offset)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_hcp(session: AsyncSession, hcp_id: int) -> HCP | None:
    return await session.get(HCP, hcp_id)
