from __future__ import annotations

from datetime import datetime
from typing import Any

from dateutil import parser as date_parser
from langchain_core.tools import tool

from app.agent.tools._coerce import as_int, as_opt_int
from app.core.database import session_factory
from app.repositories import follow_up_repo


@tool
async def schedule_followup(
    hcp_id: int | str,
    due_at: str,
    note: str | None = None,
    interaction_id: int | str | None = None,
) -> dict[str, Any]:
    """Schedule a follow-up with an HCP.

    Args:
        hcp_id: ID of the HCP to follow up with. Required.
        due_at: When the follow-up is due. Accepts ISO-8601 ("2026-04-22T10:00:00")
               or natural language ("next Monday 10am"). Required.
        note: Short text describing the follow-up reason.
        interaction_id: Optional interaction this follow-up is tied to.

    Returns:
        The created follow-up row.
    """
    hcp_id = as_int(hcp_id, field="hcp_id")
    interaction_id = as_opt_int(interaction_id, field="interaction_id")
    try:
        when: datetime = date_parser.parse(due_at)
    except (ValueError, TypeError, OverflowError):
        return {"error": f"Could not parse due_at: {due_at!r}"}

    async with session_factory()() as session:
        row = await follow_up_repo.create_follow_up(
            session,
            hcp_id=hcp_id,
            due_at=when,
            note=note,
            interaction_id=interaction_id,
        )

    return {
        "id": row.id,
        "hcp_id": row.hcp_id,
        "interaction_id": row.interaction_id,
        "due_at": row.due_at.isoformat(),
        "note": row.note,
        "status": row.status,
    }
