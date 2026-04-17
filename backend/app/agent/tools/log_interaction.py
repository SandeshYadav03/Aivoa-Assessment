from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import tool

from app.agent.llm import get_llm
from app.agent.tools._coerce import as_int
from app.core.database import session_factory
from app.repositories import interaction_repo

EXTRACT_PROMPT = """You are an information-extraction assistant for a pharma CRM.
From the rep's free-form notes, produce a STRICT JSON object with these keys:
  summary          : a one-sentence executive summary
  outcome          : one of [positive, neutral, negative, follow_up, no_show] or null
  sentiment        : one of [positive, neutral, negative] or null
  products_discussed : list of product names mentioned (strings) — empty list if none
  next_step        : a short next action if one is implied, else null

Return ONLY JSON. No prose, no code fences.

Notes:
\"\"\"
{notes}
\"\"\"
"""


async def _extract_structured(notes: str) -> dict[str, Any]:
    """Call the LLM to turn raw notes into structured fields."""
    try:
        llm = get_llm()
    except RuntimeError:
        # No Groq key — degrade gracefully
        return {
            "summary": notes[:280],
            "outcome": None,
            "sentiment": None,
            "products_discussed": [],
            "next_step": None,
        }

    resp = await llm.ainvoke([
        SystemMessage(content="You extract structured CRM fields from rep notes. Output JSON only."),
        HumanMessage(content=EXTRACT_PROMPT.format(notes=notes)),
    ])
    text = (resp.content or "").strip()
    # Strip accidental code fences
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        data = {}
    return {
        "summary": data.get("summary") or notes[:280],
        "outcome": data.get("outcome"),
        "sentiment": data.get("sentiment"),
        "products_discussed": data.get("products_discussed") or [],
        "next_step": data.get("next_step"),
    }


@tool
async def log_interaction(
    hcp_id: int | str,
    raw_notes: str,
    channel: str = "visit",
    occurred_at: str | None = None,
) -> dict[str, Any]:
    """Log a new HCP interaction from free-form rep notes.

    The tool uses an LLM to extract summary, outcome, sentiment, products discussed,
    and next step from `raw_notes`, then persists an interaction row.

    Args:
        hcp_id: ID of the HCP the interaction is with. Required.
        raw_notes: The rep's free-form notes about the interaction.
        channel: How the interaction happened. One of visit|call|email|chat|other. Default "visit".
        occurred_at: ISO-8601 timestamp of when the interaction occurred. Defaults to now.

    Returns:
        The created interaction as a dict.
    """
    hcp_id = as_int(hcp_id, field="hcp_id")
    extracted = await _extract_structured(raw_notes)

    when: datetime | None = None
    if occurred_at:
        try:
            when = datetime.fromisoformat(occurred_at.replace("Z", "+00:00"))
        except ValueError:
            when = None

    async with session_factory()() as session:
        row = await interaction_repo.create_interaction(
            session,
            hcp_id=hcp_id,
            channel=channel,
            outcome=extracted["outcome"],
            sentiment=extracted["sentiment"],
            summary=extracted["summary"],
            raw_notes=raw_notes,
            products_discussed=extracted["products_discussed"],
            next_step=extracted["next_step"],
            occurred_at=when,
        )

    return {
        "id": row.id,
        "hcp_id": row.hcp_id,
        "channel": row.channel,
        "outcome": row.outcome,
        "sentiment": row.sentiment,
        "summary": row.summary,
        "products_discussed": row.products_discussed,
        "next_step": row.next_step,
        "occurred_at": row.occurred_at.isoformat(),
    }
