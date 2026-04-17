from __future__ import annotations

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import tool

from app.agent.llm import get_llm
from app.agent.tools._coerce import as_int
from app.core.database import session_factory
from app.repositories import hcp_repo, interaction_repo

RECOMMEND_PROMPT = """You are a sales strategist advising a pharmaceutical rep.
Given the HCP profile and their recent interaction history, recommend the SINGLE next best action.

Output format (plain text, no markdown headers):
  Goal: <one-line objective for next touchpoint>
  Channel: <visit | call | email>
  Product: <primary product to lead with, or "None" if rapport-building>
  Angle: <2 sentences on how to open — reference a recent signal from history>

HCP profile:
  name       : {name}
  specialty  : {specialty}
  city       : {city}

Recent interactions (most recent first):
{interactions}
"""


@tool
async def recommend_next_action(hcp_id: int | str) -> str:
    """Recommend the next best action to take with an HCP.

    Uses the HCP profile and recent interaction history to suggest a goal,
    channel, product, and opening angle.

    Args:
        hcp_id: ID of the HCP.

    Returns:
        A short recommendation text.
    """
    hcp_id = as_int(hcp_id, field="hcp_id")
    async with session_factory()() as session:
        hcp = await hcp_repo.get_hcp(session, hcp_id)
        if hcp is None:
            return f"No HCP found with id {hcp_id}."
        rows, _ = await interaction_repo.list_interactions(session, hcp_id=hcp_id, limit=8)

    bullets = "\n".join(
        f"- [{r.occurred_at.date()}] {r.channel} — outcome={r.outcome} — {r.summary or '(no notes)'} — products={r.products_discussed}"
        for r in rows
    ) or "(no interactions yet)"

    try:
        llm = get_llm()
    except RuntimeError:
        return "LLM unavailable. Review recent history manually."

    resp = await llm.ainvoke([
        SystemMessage(content="You give crisp, specific sales recommendations."),
        HumanMessage(content=RECOMMEND_PROMPT.format(
            name=hcp.name,
            specialty=hcp.specialty or "unknown",
            city=hcp.city or "unknown",
            interactions=bullets,
        )),
    ])
    return (resp.content or "").strip() or "No recommendation available."
