from __future__ import annotations

from typing import Any

from langchain_core.tools import tool

from app.agent.tools._coerce import as_int
from app.core.database import session_factory
from app.repositories import hcp_repo


@tool
async def search_hcp(
    query: str | None = None,
    specialty: str | None = None,
    city: str | None = None,
    limit: int | str = 10,
) -> list[dict[str, Any]]:
    """Search HCPs by name/hospital substring, specialty, and/or city.

    Args:
        query: Free-text substring matched against HCP name or hospital (case-insensitive).
        specialty: Exact specialty filter, e.g. "Cardiology", "Endocrinology".
        city: Exact city filter, e.g. "Bangalore".
        limit: Max rows to return (default 10).

    Returns:
        A list of matching HCPs with id, name, specialty, hospital, city.
    """
    limit_int = as_int(limit, field="limit")
    async with session_factory()() as session:
        rows = await hcp_repo.list_hcps(
            session, query=query, specialty=specialty, city=city, limit=limit_int
        )
    return [
        {
            "id": r.id,
            "name": r.name,
            "specialty": r.specialty,
            "hospital": r.hospital,
            "city": r.city,
        }
        for r in rows
    ]
