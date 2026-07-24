"""Dependências compartilhadas (singleton do LLMService)."""

from __future__ import annotations

from functools import lru_cache

from app.services.llm_service import LLMService


@lru_cache(maxsize=1)
def get_llm_service() -> LLMService:
    """Uma instância por processo — evita recriar cliente Groq/HTTP a cada request."""
    return LLMService()
