"""Prompts de missão educacional (lookup O(1) por missao_id)."""

from __future__ import annotations

from typing import Callable

PromptFactory = Callable[[str], str]


def _prompt_traducao(tema: str) -> str:
    return f"""
DESAFIO: Tradução de Termos.
O usuário acabou de perguntar sobre '{tema}'.
Explique o conceito de forma muito simples, direta e em no máximo 3 tópicos curtos.
Evite textos longos ou excesso de termos técnicos complexos.
Termine perguntando se ele quer entender melhor algum detalhe específico.
CRITÉRIO: A explicação deve ser rápida e mostrar a ideia central de forma leve.
""".strip()


def _prompt_riscos(tema: str) -> str:
    return f"""
DESAFIO: Simulação de Riscos sobre '{tema}'.
Explique de forma curta e direta por que promessas de 'lucros fixos e garantidos'
são um sinal claro de golpe no mercado.
Use no máximo dois parágrafos ou tópicos bem curtos.
CRITÉRIO: Focar na imprevisibilidade do mercado e na impossibilidade de garantir retornos.
""".strip()


def _prompt_backup(_tema: str) -> str:
    return """
DESAFIO: Recompensa por Backup.
Explique de forma objetiva e em poucos tópicos por que manter moedas em corretoras
envolve riscos e por que guardar a frase semente offline é essencial.
CRITÉRIO: Foco em soberania pessoal e custódia própria, sem textões.
""".strip()


def _prompt_soberania(_tema: str) -> str:
    return """
DESAFIO: Ato 1 - Soberania Financeira.
Explique de forma direta como o Bitcoin garante autonomia financeira
sem intermediários. Seja breve e vá direto ao ponto.
CRITÉRIO: Resposta curta destacando independência e controle total.
""".strip()


MISSOES: dict[str, PromptFactory] = {
    "traducao": _prompt_traducao,
    "riscos": _prompt_riscos,
    "backup": _prompt_backup,
    "soberania": _prompt_soberania,
}


def obter_prompt_missao(missao_id: str, tema_escolhido: str = "Bitcoin") -> str:
    """Retorna o prompt da missão em O(1) via dicionário de factories."""
    factory = MISSOES.get(missao_id)
    if factory is None:
        return f"Explique sobre {tema_escolhido} de forma curta e direta."
    return factory(tema_escolhido)
