from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.core.deps import DbSession
from app.repositories import hcp_repo
from app.schemas.hcp import HCPRead

router = APIRouter(prefix="/hcps", tags=["hcps"])


@router.get("", response_model=list[HCPRead])
async def list_hcps(
    session: DbSession,
    query: str | None = Query(None, description="Search name or hospital"),
    specialty: str | None = Query(None),
    city: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> list[HCPRead]:
    rows = await hcp_repo.list_hcps(
        session, query=query, specialty=specialty, city=city, limit=limit, offset=offset
    )
    return [HCPRead.model_validate(r) for r in rows]


@router.get("/{hcp_id}", response_model=HCPRead)
async def get_hcp(hcp_id: int, session: DbSession) -> HCPRead:
    row = await hcp_repo.get_hcp(session, hcp_id)
    if row is None:
        raise HTTPException(status_code=404, detail=f"HCP {hcp_id} not found")
    return HCPRead.model_validate(row)
