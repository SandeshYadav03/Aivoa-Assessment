from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import DbSession
from app.repositories import interaction_repo
from app.schemas.interaction import (
    InteractionCreate,
    InteractionList,
    InteractionRead,
    InteractionUpdate,
)

router = APIRouter(prefix="/interactions", tags=["interactions"])


@router.get("", response_model=InteractionList)
async def list_interactions(
    session: DbSession,
    hcp_id: int | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> InteractionList:
    rows, total = await interaction_repo.list_interactions(
        session, hcp_id=hcp_id, limit=limit, offset=offset
    )
    return InteractionList(
        items=[InteractionRead.model_validate(r) for r in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=InteractionRead, status_code=status.HTTP_201_CREATED)
async def create_interaction(payload: InteractionCreate, session: DbSession) -> InteractionRead:
    row = await interaction_repo.create_interaction(
        session,
        hcp_id=payload.hcp_id,
        channel=payload.channel,
        outcome=payload.outcome,
        sentiment=payload.sentiment,
        summary=payload.summary,
        raw_notes=payload.raw_notes,
        products_discussed=payload.products_discussed,
        next_step=payload.next_step,
        occurred_at=payload.occurred_at,
    )
    return InteractionRead.model_validate(row)


@router.get("/{interaction_id}", response_model=InteractionRead)
async def get_interaction(interaction_id: int, session: DbSession) -> InteractionRead:
    row = await interaction_repo.get_interaction(session, interaction_id)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Interaction {interaction_id} not found")
    return InteractionRead.model_validate(row)


@router.patch("/{interaction_id}", response_model=InteractionRead)
async def update_interaction(
    interaction_id: int, payload: InteractionUpdate, session: DbSession
) -> InteractionRead:
    fields = payload.model_dump(exclude_unset=True)
    row = await interaction_repo.update_interaction(session, interaction_id, **fields)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Interaction {interaction_id} not found")
    return InteractionRead.model_validate(row)


@router.delete("/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interaction(interaction_id: int, session: DbSession) -> None:
    deleted = await interaction_repo.delete_interaction(session, interaction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Interaction {interaction_id} not found")
