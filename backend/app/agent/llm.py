from __future__ import annotations

from functools import lru_cache

from langchain_openai import ChatOpenAI

from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_llm():
    settings = get_settings()
    if not settings.openrouter_api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")
    return ChatOpenAI(
        api_key=settings.openrouter_api_key,
        model=settings.openrouter_model,
        base_url=settings.openrouter_base_url,
        temperature=settings.openrouter_temperature,
        max_tokens=settings.openrouter_max_tokens,
        default_headers={
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "Aivoa CRM",
        },
    )
