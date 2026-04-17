from __future__ import annotations

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import tool

from app.agent.llm import get_llm
from app.agent.tools._coerce import as_int
from app.core.database import session_factory
from app.repositories import hcp_repo, interaction_repo

SUMMARY_PROMPT = """You are briefing a pharmaceutical sales rep before their next meeting.
Summarise the following recent interactions with {hcp_name} ({specialty}) in 4-6 bullet points,
highlighting: key products, outcomes, any objections, and a single clear recommended next step.

Interactions (most recent first):
{interactions}
"""


@tool
async def summarize_history(hcp_id: int | str, limit: int | str = 5) -> str:
    """Summarise the most recent interactions for an HCP.

    Args:
        hcp_id: ID of the HCP to brief on. Required.
        limit: Number of recent interactions to include (default 5, max 20).

    Returns:
        A rep-facing briefing string.
    """
    hcp_id = as_int(hcp_id, field="hcp_id")
    limit = max(1, min(as_int(limit, field="limit"), 20))

    async with session_factory()() as session:
        hcp = await hcp_repo.get_hcp(session, hcp_id)
        if hcp is None:
            return f"No HCP found with id {hcp_id}."
        rows, _ = await interaction_repo.list_interactions(session, hcp_id=hcp_id, limit=limit)

    if not rows:
        return f"No interactions logged yet for {hcp.name}."

    bullet_list = "\n".join(
        f"- [{r.occurred_at.date()}] {r.channel} — outcome={r.outcome} — {r.summary or r.raw_notes or '(no notes)'}"
        for r in rows
    )

    try:
        llm = get_llm()
    except RuntimeError:
        return f"History for {hcp.name}:\n{bullet_list}"

    resp = await llm.ainvoke([
        SystemMessage(content="You write concise, actionable sales briefings."),
        HumanMessage(content=SUMMARY_PROMPT.format(
            hcp_name=hcp.name,
            specialty=hcp.specialty or "unknown specialty",
            interactions=bullet_list,
        )),
    ])
    return (resp.content or "").strip() or bullet_list
