"""Rotas HTTP do Mentor SatVantage."""

from __future__ import annotations

import logging
from enum import Enum, auto
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.mentor.mentor_logic import obter_prompt_missao
from app.deps import get_llm_service
from app.schemas.mentor import (
    InteractionRequest,
    MensagemHistorico,
    MentorRequest,
    MentorResponse,
    TaskValidation,
)
from app.services.llm_service import LLMService

logger = logging.getLogger("SatVantage.MentorRouter")
router = APIRouter()

QUIZ_SATS = 5
DESAFIO_TAG = "[DESAFIO]"
ROLES_OK = frozenset({"user", "assistant", "system"})
INICIAR_TRIGGERS = frozenset(
    {
        "iniciar",
        "iniciando a missão",
        "start",
        "starting the mission",
        "empezar",
        "iniciando la misión",
    }
)
QUIZ_HINTS = (
    "testar meus conhecimentos",
    "ganhar satoshis",
    "test my knowledge",
    "earn satoshis",
    "probar mis conocimientos",
    "ganar satoshis",
)

_SAUDACAO = {
    "pt": (
        "Oi! Eu sou a NagAI, sua mentora de Bitcoin. Para negociar com facilidade, "
        "contamos com as corretoras conectadas para você comprar seus ativos. "
        "Qual sua dúvida sobre Bitcoin hoje?"
    ),
    "en": (
        "Hi! I'm NagAI, your Bitcoin mentor. To trade easily, we connect to "
        "exchanges so you can buy your assets. What's your Bitcoin question today?"
    ),
    "es": (
        "¡Hola! Soy NagAI, tu mentora de Bitcoin. Para operar con facilidad, "
        "conectamos exchanges para que compres tus activos. "
        "¿Cuál es tu duda sobre Bitcoin hoy?"
    ),
}

_ACERTO_FALLBACK = {
    "pt": f"⚡ Parabéns! Resposta correta! Você ganhou {QUIZ_SATS} Satoshis!",
    "en": f"⚡ Congrats! Correct answer! You earned {QUIZ_SATS} Satoshis!",
    "es": f"⚡ ¡Felicidades! ¡Respuesta correcta! Ganaste {QUIZ_SATS} Satoshis!",
}

# Classificação de resultado de missão → resposta HTTP (acesso O(1)).
_RESULTADO_MISSAO: dict[str, dict[str, str]] = {
    "APROVADO": {"status": "success", "message": "Parabéns, missão concluída!"},
    "ERRO_ESCOPO": {
        "status": "try_again",
        "feedback": "Este assunto não faz parte da nossa trilha de Bitcoin.",
    },
    "REPROVADO": {
        "status": "try_again",
        "feedback": (
            "Resposta incorreta. Tente explicar de forma mais simples e direta sobre o tema."
        ),
    },
}


class Intent(Enum):
    INICIAR = auto()
    QUIZ = auto()
    DESAFIO = auto()
    LIVRE = auto()


def _classificar_intent(
    mensagem_lower: str,
    historico: list[MensagemHistorico] | None,
) -> Intent:
    if mensagem_lower in INICIAR_TRIGGERS:
        return Intent.INICIAR
    if any(hint in mensagem_lower for hint in QUIZ_HINTS):
        return Intent.QUIZ
    if _esta_em_desafio(historico):
        return Intent.DESAFIO
    return Intent.LIVRE


def _lang(idioma: str | None) -> str:
    return idioma if idioma in ("pt", "en", "es") else "pt"


def _montar_historico_para_llm(
    mensagem_usuario: str,
    historico: list[MensagemHistorico] | None,
) -> list[dict[str, str]]:
    """Histórico completo: mensagens anteriores + mensagem atual se ainda não estiver no fim."""
    mensagens: list[dict[str, str]] = []
    if historico:
        for h in historico:
            role = h.role if h.role in ROLES_OK else "user"
            mensagens.append({"role": role, "content": h.content})

    precisa_anexar = True
    if mensagens:
        ultima = mensagens[-1]
        if ultima.get("role") == "user" and ultima.get("content") == mensagem_usuario:
            precisa_anexar = False

    if precisa_anexar and mensagem_usuario.strip():
        mensagens.append({"role": "user", "content": mensagem_usuario})

    return mensagens


def _ultima_msg_assistant(historico: list[MensagemHistorico] | None) -> str:
    if not historico:
        return ""
    for h in reversed(historico):
        if h.role == "assistant":
            return h.content or ""
    return ""


def _esta_em_desafio(historico: list[MensagemHistorico] | None) -> bool:
    return DESAFIO_TAG in _ultima_msg_assistant(historico)


def _classificar_resultado_missao(texto: str) -> str:
    """Mapeia saída do LLM para chave APROVADO | ERRO_ESCOPO | REPROVADO."""
    res = (texto or "").strip().upper()
    if "APROVADO" in res:
        return "APROVADO"
    if "ERRO_ESCOPO" in res:
        return "ERRO_ESCOPO"
    return "REPROVADO"


async def _avaliar_resposta_desafio(
    service: LLMService,
    pergunta: str,
    resposta_usuario: str,
    nivel: str,
    idioma: str,
) -> bool:
    prompt = (
        "Você é um avaliador de quiz educacional sobre Bitcoin.\n"
        f"Pergunta do desafio: {pergunta.replace(DESAFIO_TAG, '').strip()}\n"
        f"Resposta do usuário: {resposta_usuario}\n\n"
        "Se a resposta estiver correta ou substancialmente correta, responda APENAS: APROVADO\n"
        "Caso contrário, responda APENAS: REPROVADO\n"
        "Não explique."
    )
    bruto = await service.generate_mentorship(
        [{"role": "user", "content": prompt}],
        level=nivel,
        idioma=idioma,
    )
    return "APROVADO" in (bruto or "").strip().upper()


async def _handle_iniciar(idioma: str) -> tuple[str, bool, int]:
    return _SAUDACAO[_lang(idioma)], False, 0


async def _handle_quiz(
    service: LLMService,
    nivel: str,
    idioma: str,
) -> tuple[str, bool, int]:
    lang = _lang(idioma)
    prompt_desafio = (
        f"Faça UMA ÚNICA pergunta prática de Bitcoin, nível {nivel}, "
        f"para valer {QUIZ_SATS} satoshis. "
        f"Comece a mensagem exatamente com {DESAFIO_TAG} e em seguida só a pergunta. "
        "Sem intro longa. NÃO faça mais de uma pergunta. NÃO peça para o usuário "
        "responder várias questões — apenas esta. "
        f"Escreva a pergunta no idioma do usuário (código: {lang})."
    )
    resposta_bruta = await service.generate_mentorship(
        [{"role": "user", "content": prompt_desafio}],
        nivel,
        idioma=lang,
    )
    resposta = (
        resposta_bruta
        if DESAFIO_TAG in (resposta_bruta or "")
        else f"{DESAFIO_TAG} {resposta_bruta}"
    )
    return resposta, False, 0


async def _handle_desafio(
    service: LLMService,
    dados: MentorRequest,
) -> tuple[str, bool, int]:
    lang = _lang(dados.idioma)
    pergunta = _ultima_msg_assistant(dados.historico)
    historico_llm = _montar_historico_para_llm(dados.mensagem_usuario, dados.historico)
    acertou = await _avaliar_resposta_desafio(
        service,
        pergunta,
        dados.mensagem_usuario,
        dados.nivel_conhecimento,
        lang,
    )

    if acertou:
        mensagens = [
            {
                "role": "system",
                "content": (
                    "O usuário ACERTOU o desafio de Bitcoin. "
                    "Em 2-3 frases curtas: diga que acertou, reforce o conceito e "
                    f"informe que ganhou {QUIZ_SATS} satoshis. "
                    "NÃO faça outra pergunta. NÃO inicie um novo desafio. "
                    "NÃO use tags como [DESAFIO] ou [ACERTOU]."
                ),
            }
        ] + historico_llm
        explicacao = await service.generate_mentorship(
            mensagens,
            dados.nivel_conhecimento,
            idioma=lang,
        )
        texto = (explicacao or "").strip()
        if f"{QUIZ_SATS} satoshi" not in texto.lower():
            texto = f"{texto}\n\n{_ACERTO_FALLBACK[lang]}".strip()
        return texto, True, QUIZ_SATS

    mensagens = [
        {
            "role": "system",
            "content": (
                "O usuário ERROU ou ficou incompleto no desafio de Bitcoin. "
                "Diga com clareza que a resposta não está correta, explique a resposta certa "
                "de forma acolhedora e breve. "
                "NÃO diga que ganhou satoshis. "
                "NÃO faça outra pergunta. NÃO inicie um novo desafio. "
                "NÃO use tags."
            ),
        }
    ] + historico_llm
    resposta = await service.generate_mentorship(
        mensagens,
        dados.nivel_conhecimento,
        idioma=lang,
    )
    return resposta, False, 0


async def _handle_livre(service: LLMService, dados: MentorRequest) -> tuple[str, bool, int]:
    mensagens_prompt = _montar_historico_para_llm(dados.mensagem_usuario, dados.historico)
    resposta = await service.generate_mentorship(
        mensagens_prompt,
        dados.nivel_conhecimento,
        idioma=_lang(dados.idioma),
    )
    return resposta, False, 0


@router.post("/mentor", response_model=MentorResponse)
async def get_mentorship(
    dados: MentorRequest,
    service: LLMService = Depends(get_llm_service),
) -> dict[str, Any]:
    logger.info(
        "Nova requisição: nível=%s idioma=%s",
        dados.nivel_conhecimento,
        dados.idioma,
    )
    try:
        intent = _classificar_intent(dados.mensagem_usuario.lower(), dados.historico)

        match intent:
            case Intent.INICIAR:
                resposta, ganhou_sats, sats_ganhos = await _handle_iniciar(dados.idioma)
            case Intent.QUIZ:
                resposta, ganhou_sats, sats_ganhos = await _handle_quiz(
                    service,
                    dados.nivel_conhecimento,
                    dados.idioma,
                )
            case Intent.DESAFIO:
                resposta, ganhou_sats, sats_ganhos = await _handle_desafio(service, dados)
            case Intent.LIVRE:
                resposta, ganhou_sats, sats_ganhos = await _handle_livre(service, dados)

        return {
            "resposta_ia": resposta,
            "nivel_aplicado": dados.nivel_conhecimento,
            "ganhou_sats": ganhou_sats,
            "sats_ganhos": sats_ganhos,
        }
    except Exception as exc:
        logger.exception("Erro ao gerar mentoria: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/interact")
async def interact(
    data: InteractionRequest,
    service: LLMService = Depends(get_llm_service),
) -> dict[str, str]:
    try:
        msgs = data.resolved_messages()
        if not msgs:
            raise HTTPException(
                status_code=422,
                detail="Envie messages[] ou mensagem_usuario",
            )

        historico = [{"role": m.role, "content": m.content} for m in msgs]
        lang = _lang(data.resolved_idioma())

        if data.missao_id and historico:
            ultima_mensagem = historico[-1]["content"]
            prompt_missao = obter_prompt_missao(data.missao_id, data.tema_atual or "Bitcoin")

            instrucao = f"""
            Você é um classificador de respostas. Analise o desafio: {prompt_missao}

            Siga estritamente estes exemplos de saída:
            Resposta: "o bitcoin é um bolo" -> Saída: ERRO_ESCOPO
            Resposta: "é uma carteira digital para guardar chaves" -> Saída: APROVADO
            Resposta: "é um computador potente" -> Saída: REPROVADO

            Apenas classifique a seguinte resposta do usuário, sem explicações:
            Resposta do usuário: "{ultima_mensagem}"
            Saída:
            """
            resultado_bruto = await service.generate_mentorship(
                [{"role": "user", "content": instrucao}],
                level="iniciante",
                idioma=lang,
            )
            chave = _classificar_resultado_missao(resultado_bruto)
            return _RESULTADO_MISSAO[chave]

        resultado = await service.generate_mentorship(
            historico,
            level="iniciante",
            idioma=lang,
        )
        # Next lê resposta_ia; Streamlit/legado lê resposta
        return {
            "status": "chat",
            "resposta": resultado,
            "resposta_ia": resultado,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Erro na rota /interact: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/validate-task/{missao_id}")
async def validate_task(
    missao_id: str,
    data: TaskValidation,
    service: LLMService = Depends(get_llm_service),
) -> dict[str, str]:
    prompt_missao = obter_prompt_missao(missao_id)
    evaluation_prompt = f"""
    Contexto: Você é um mentor rígido de Bitcoin.
    {prompt_missao}

    Resposta do usuário: '{data.user_response}'

    INSTRUÇÕES DE AVALIAÇÃO:
    Você é um validador de trilha educacional de Bitcoin.

    PASSO 1: Verifique se a resposta do usuário é sobre o tema 'Bitcoin' e se tenta responder ao desafio.
    - Se a resposta for sobre outro assunto (receitas, esportes, etc), responda APENAS: "REPROVADO: Este assunto não faz parte da nossa trilha de Bitcoin."

    PASSO 2: Se for sobre Bitcoin, verifique se a resposta cumpre o desafio.
    - Se cumprir, responda APENAS: "APROVADO".
    - Se falhar ou estiver incorreto, responda APENAS: "REPROVADO" seguido de uma dica curta e motivadora.
    """
    try:
        resultado = await service.generate_mentorship(
            [{"role": "user", "content": evaluation_prompt}],
            level="iniciante",
        )
        if "APROVADO" in resultado.strip().upper():
            return {
                "status": "success",
                "message": f"Parabéns! Missão {missao_id} concluída!",
            }
        return {"status": "try_again", "feedback": resultado}
    except Exception as exc:
        logger.exception("Erro em validate-task: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
