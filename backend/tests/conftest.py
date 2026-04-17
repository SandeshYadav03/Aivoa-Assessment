from __future__ import annotations

import os

# Point tests at an in-memory SQLite DB BEFORE anything imports Settings.
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("GROQ_API_KEY", "")
os.environ.setdefault("ENVIRONMENT", "test")

import asyncio
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core import config, database
from app.main import create_app
from app.models.base import Base


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def test_engine():
    # Rebuild a fresh in-memory engine per test.
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def test_session(test_engine) -> AsyncIterator[AsyncSession]:
    maker = async_sessionmaker(test_engine, expire_on_commit=False)
    async with maker() as session:
        yield session


@pytest_asyncio.fixture
async def app_client(test_engine, monkeypatch) -> AsyncIterator[AsyncClient]:
    """A FastAPI client wired to the fresh test engine."""
    maker = async_sessionmaker(test_engine, expire_on_commit=False)

    # Patch the app's global session factory & engine for the duration of the test.
    monkeypatch.setattr(database, "_engine", test_engine)
    monkeypatch.setattr(database, "_sessionmaker", maker)
    config.get_settings.cache_clear()

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
