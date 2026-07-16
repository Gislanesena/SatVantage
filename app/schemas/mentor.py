from pydantic import BaseModel, Field
from typing import Literal

class MentorRequest(BaseModel):
    mensagem_usuario: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="A pergunta do usuário sobre Bitcoin",
        json_schema_extra={"example": "Como funciona o processo de mineração do Bitcoin?"})
    nivel_conhecimento: Literal["iniciante", "intermediario", "avancado"] = Field(
        ...,
        description="O nível de conhecimento do usuário sobre Bitcoin",
        json_schema_extra={"example": "iniciante"})

class MentorResponse(BaseModel):
    resposta_ia: str
    nivel_aplicado: str