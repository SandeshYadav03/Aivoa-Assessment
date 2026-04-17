from __future__ import annotations

from typing import Any

from langchain_core.tools import tool

from app.agent.tools._coerce import as_int
from app.core.database import session_factory
from app.repositories import interaction_repo


@tool
async def edit_interaction(
    interaction_id: int | str,
    summary: str | None = None,
    outcome: str | None = None,
    sentiment: str | None = None,
    channel: str | None = None,
    next_step: str | None = None,
    products_discussed: list[str] | None = None,
) -> dict[str, Any]:
    """Edit an existing interaction. Only supplied fields are updated.

    Args:
        interaction_id: ID of the interaction to modify. Required.
        summary: New summary text.
        outcome: One of positive|neutral|negative|follow_up|no_show.
        sentiment: One of positive|neutral|negative.
        channel: One of visit|call|email|chat|other.
        next_step: Updated next-step note.
        products_discussed: Replacement list of product names.

    Returns:
        The updated interaction, or an error dict if not found.
    """
    interaction_id = as_int(interaction_id, field="interaction_id")
    fields = {
        "summary": summary,
        "outcome": outcome,
        "sentiment": sentiment,
        "channel": channel,
        "next_step": next_step,
        "products_discussed": products_discussed,
    }
    fields = {k: v for k, v in fields.items() if v is not None}

    async with session_factory()() as session:
        row = await interaction_repo.update_interaction(session, interaction_id, **fields)

    if row is None:
        return {"error": f"Interaction {interaction_id} not found"}

    return {
        "id": row.id,
        "hcp_id": row.hcp_id,
        "channel": row.channel,
        "outcome": row.outcome,
        "sentiment": row.sentiment,
        "summary": row.summary,
        "next_step": row.next_step,
        "products_discussed": row.products_discussed,
    }
