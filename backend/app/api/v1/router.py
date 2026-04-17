from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import chat, hcps, health, interactions

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(hcps.router)
api_router.include_router(interactions.router)
api_router.include_router(chat.router)
