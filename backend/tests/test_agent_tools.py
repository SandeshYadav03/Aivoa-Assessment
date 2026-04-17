from __future__ import annotations

import pytest

from app.agent.tools import (
    edit_interaction,
    log_interaction,
    schedule_followup,
    search_hcp,
    summarize_history,
)
from app.core import database
from app.models import HCP


@pytest.fixture(autouse=True)
def _wire_test_db(test_engine, monkeypatch):
    """Point tool-level session_factory at the test engine."""
    from sqlalchemy.ext.asyncio import async_sessionmaker

    maker = async_sessionmaker(test_engine, expire_on_commit=False)
    monkeypatch.setattr(database, "_engine", test_engine)
    monkeypatch.setattr(database, "_sessionmaker", maker)


@pytest.mark.asyncio
async def test_search_hcp_filters(test_session):
    test_session.add_all([
        HCP(name="Dr. Alpha", specialty="Cardiology", city="Bangalore"),
        HCP(name="Dr. Beta", specialty="Oncology", city="Mumbai"),
    ])
    await test_session.commit()

    result = await search_hcp.ainvoke({"specialty": "Cardiology"})
    names = [r["name"] for r in result]
    assert "Dr. Alpha" in names
    assert "Dr. Beta" not in names


@pytest.mark.asyncio
async def test_log_interaction_without_llm_falls_back(test_session):
    hcp = HCP(name="Dr. Fallback", specialty="Cardiology")
    test_session.add(hcp)
    await test_session.commit()
    await test_session.refresh(hcp)

    result = await log_interaction.ainvoke({
        "hcp_id": hcp.id,
        "raw_notes": "Met briefly, positive reception.",
        "channel": "visit",
    })
    assert result["hcp_id"] == hcp.id
    assert result["summary"]
    assert "id" in result


@pytest.mark.asyncio
async def test_edit_interaction_updates_fields(test_session):
    from app.repositories import interaction_repo

    hcp = HCP(name="Dr. Edit", specialty="Oncology")
    test_session.add(hcp)
    await test_session.commit()
    await test_session.refresh(hcp)

    row = await interaction_repo.create_interaction(
        test_session,
        hcp_id=hcp.id,
        channel="visit",
        outcome="neutral",
        sentiment=None,
        summary="original",
        raw_notes="original",
        products_discussed=[],
        next_step=None,
        occurred_at=None,
    )

    result = await edit_interaction.ainvoke({
        "interaction_id": row.id,
        "outcome": "positive",
        "summary": "updated",
    })
    assert result["outcome"] == "positive"
    assert result["summary"] == "updated"


@pytest.mark.asyncio
async def test_schedule_followup_parses_natural_language(test_session):
    hcp = HCP(name="Dr. Schedule")
    test_session.add(hcp)
    await test_session.commit()
    await test_session.refresh(hcp)

    result = await schedule_followup.ainvoke({
        "hcp_id": hcp.id,
        "due_at": "2026-05-01T10:00:00",
        "note": "check in",
    })
    assert "error" not in result
    assert result["hcp_id"] == hcp.id
    assert result["note"] == "check in"


@pytest.mark.asyncio
async def test_summarize_history_without_llm(test_session):
    from app.repositories import interaction_repo

    hcp = HCP(name="Dr. Summary", specialty="Endocrinology")
    test_session.add(hcp)
    await test_session.commit()
    await test_session.refresh(hcp)
    await interaction_repo.create_interaction(
        test_session, hcp_id=hcp.id, channel="visit",
        outcome="positive", sentiment="positive",
        summary="test", raw_notes="test", products_discussed=["X"],
        next_step=None, occurred_at=None,
    )

    result = await summarize_history.ainvoke({"hcp_id": hcp.id})
    assert "Dr. Summary" in result
