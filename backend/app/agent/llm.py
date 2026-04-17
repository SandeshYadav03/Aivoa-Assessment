from __future__ import annotations

from functools import lru_cache

from langchain_groq import ChatGroq

from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_llm():
    settings = get_settings()
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")
    return ChatGroq(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        temperature=settings.groq_temperature,
        max_tokens=settings.groq_max_tokens,
    )
