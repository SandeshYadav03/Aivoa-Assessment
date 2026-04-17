from __future__ import annotations

from datetime import datetime, timezone

import pytest

from app.models import HCP


@pytest.mark.asyncio
async def test_health(app_client):
    resp = await app_client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_list_hcps_empty(app_client):
    resp = await app_client.get("/api/v1/hcps")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_and_list_interaction(app_client, test_session):
    # Seed an HCP directly
    hcp = HCP(name="Dr. Test", specialty="Cardiology", city="Bangalore")
    test_session.add(hcp)
    await test_session.commit()
    await test_session.refresh(hcp)

    payload = {
        "hcp_id": hcp.id,
        "channel": "visit",
        "summary": "Discussed Atorvastatin.",
        "raw_notes": "Met Dr. Test. Discussed Atorvastatin 10mg.",
        "outcome": "positive",
        "sentiment": "positive",
        "products_discussed": ["Atorvastatin 10mg"],
        "occurred_at": datetime.now(timezone.utc).isoformat(),
    }
    resp = await app_client.post("/api/v1/interactions", json=payload)
    assert resp.status_code == 201, resp.text
    created = resp.json()
    assert created["hcp_id"] == hcp.id
    assert created["outcome"] == "positive"

    list_resp = await app_client.get(f"/api/v1/interactions?hcp_id={hcp.id}")
    assert list_resp.status_code == 200
    body = list_resp.json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == created["id"]


@pytest.mark.asyncio
async def test_patch_interaction(app_client, test_session):
    hcp = HCP(name="Dr. Patch", specialty="Oncology")
    test_session.add(hcp)
    await test_session.commit()
    await test_session.refresh(hcp)

    create = await app_client.post("/api/v1/interactions", json={
        "hcp_id": hcp.id,
        "channel": "call",
        "outcome": "neutral",
        "summary": "initial",
    })
    iid = create.json()["id"]

    patched = await app_client.patch(f"/api/v1/interactions/{iid}", json={"outcome": "positive"})
    assert patched.status_code == 200
    assert patched.json()["outcome"] == "positive"


@pytest.mark.asyncio
async def test_delete_interaction_missing(app_client):
    resp = await app_client.delete("/api/v1/interactions/999999")
    assert resp.status_code == 404
