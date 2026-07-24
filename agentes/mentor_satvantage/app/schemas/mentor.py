"""Schemas Pydantic da API do Mentor."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Idioma = Literal["pt", "en", "es"]


class MensagemHistorico(BaseModel):
    role: str
    content: str


class MentorRequest(BaseModel):
    mensagem_usuario: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="A pergunta do usuário sobre Bitcoin",
        json_schema_extra={
            "example": "Como funciona o processo de mineração do Bitcoin?"
        },
    )
    nivel_conhecimento: Literal["iniciante", "intermediario", "avancado"] = Field(
        default="iniciante",
        description="O nível de conhecimento do usuário sobre Bitcoin",
        json_schema_extra={"example": "iniciante"},
    )
    historico: list[MensagemHistorico] | None = Field(
        default=None,
        description="Histórico completo da conversa (user/assistant) para manter contexto",
    )
    idioma: Idioma = Field(
        default="pt",
        description="Idioma da resposta da NagAI (pt, en, es)",
        json_schema_extra={"example": "pt"},
    )


class MentorResponse(BaseModel):
    resposta_ia: str
    nivel_aplicado: str
    ganhou_sats: bool = False
    sats_ganhos: int = 0


class MensagemChat(BaseModel):
    role: str
    content: str


class InteractionRequest(BaseModel):
    messages: list[MensagemChat]
    missao_id: str | None = None
    tema_atual: str | None = "Bitcoin"
    idioma: Idioma = "pt"


class TaskValidation(BaseModel):
    user_id: str
    user_response: str
