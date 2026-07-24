"""Serviço de LLM (Groq) com escopo Bitcoin, histórico e texto puro."""

from __future__ import annotations

import asyncio
import logging
import os
import re
from datetime import datetime
from typing import Any

import httpx
from groq import Groq

logger = logging.getLogger("SatVantage.LLMService")

TEMAS_PERMITIDOS: tuple[str, ...] = (
    "bitcoin",
    "btc",
    "sats",
    "satoshi",
    "altcoin",
    "stablecoin",
    "cripto",
    "crypto",
    "blockchain",
    "cotação",
    "cotacao",
    "converter",
    "conversão",
    "conversao",
    "moeda",
    "moedas",
    "criptoativo",
    "criptoativos",
    "transação",
    "transacao",
    "bloco",
    "mempool",
    "mineração",
    "mineracao",
    "halving",
    "lightning",
    "canal",
    "node",
    "nó",
    "fundamentos",
    "corretora",
    "corretoras",
    "exchange",
    "exchanges",
    "binance",
    "mercado bitcoin",
    "blink",
    "comprar",
    "compra",
    "compro",
    "vender",
    "venda",
    "vendo",
    "preço",
    "preco",
    "valor",
    "taxa",
    "p2p",
    "carteira",
    "wallet",
    "hardware",
    "cold",
    "hot",
    "chave",
    "backup",
    "seed",
    "frase",
    "custódia",
    "custodia",
    "soberania",
    "autonomia",
    "segurança",
    "seguranca",
    "multisig",
    "rede",
    "data",
    "hoje",
    "quanto vale",
)

# Uma única regex (alternation) evita varrer dezenas de substrings a cada request.
_TEMAS_RE = re.compile(
    "|".join(re.escape(t) for t in sorted(TEMAS_PERMITIDOS, key=len, reverse=True)),
    re.IGNORECASE,
)

_MARKDOWN_PIPE: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"```[\s\S]*?```"), ""),
    (re.compile(r"`([^`]+)`"), r"\1"),
    (re.compile(r"\*\*([^*]+)\*\*"), r"\1"),
    (re.compile(r"__([^_]+)__"), r"\1"),
    (re.compile(r"(?<!\w)\*([^*]+)\*(?!\w)"), r"\1"),
    (re.compile(r"(?<!\w)_([^_]+)_(?!\w)"), r"\1"),
    (re.compile(r"^#{1,6}\s*", re.MULTILINE), ""),
    (re.compile(r"^\s*[-*•]\s+", re.MULTILINE), ""),
)

ROLES_PERMITIDOS = frozenset({"user", "assistant", "system"})


class LLMService:
    def __init__(self) -> None:
        token = os.getenv("GROQ_API_KEY")
        if not token:
            raise ValueError("Erro de configuração: GROQ_API_KEY não encontrado no .env")

        self.client = Groq(api_key=token)
        self.model = "llama-3.3-70b-versatile"
        self._http = httpx.AsyncClient(timeout=3.0)

    async def aclose(self) -> None:
        await self._http.aclose()

    async def _obter_preco_bitcoin_atual(self) -> str:
        """Busca preço BTC em BRL/USD (CoinGecko)."""
        url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl,usd"
        try:
            response = await self._http.get(url)
            if response.status_code != 200:
                return "Indisponível no momento"
            data = response.json()
            preco_brl = data["bitcoin"]["brl"]
            preco_usd = data["bitcoin"]["usd"]
            return f"US$ {preco_usd:,.2f} / R$ {preco_brl:,.2f}"
        except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
            logger.debug("Falha ao obter preço BTC: %s", exc)
            return "Indisponível no momento"

    @staticmethod
    def _eh_assunto_permitido(prompt: str) -> bool:
        return bool(_TEMAS_RE.search(prompt))

    @staticmethod
    def _para_texto_puro(texto: str) -> str:
        """Remove Markdown comum para exibição em chat de texto puro."""
        if not texto:
            return texto

        limpo = texto
        for pattern, repl in _MARKDOWN_PIPE:
            limpo = pattern.sub(repl, limpo)
        return limpo.replace("**", "").replace("__", "").strip()

    async def generate_mentorship(
        self,
        messages_history: list[dict[str, Any]],
        level: str,
        idioma: str = "pt",
    ) -> str:
        """Gera resposta de mentoria a partir do histórico de mensagens."""
        lang = idioma if idioma in ("pt", "en", "es") else "pt"
        lang_label = {
            "pt": "português do Brasil (PT-BR)",
            "en": "English",
            "es": "español",
        }[lang]

        fora_de_escopo = {
            "pt": (
                "Desculpe, sou um mentor especializado exclusivamente em Bitcoin. "
                "Posso ajudar com conceitos, segurança, carteiras, Lightning, corretoras e mercado. "
                "Qual sua dúvida sobre Bitcoin?"
            ),
            "en": (
                "Sorry — I'm a mentor specialized exclusively in Bitcoin. "
                "I can help with concepts, security, wallets, Lightning, exchanges and the market. "
                "What is your Bitcoin question?"
            ),
            "es": (
                "Lo siento, soy un mentor especializado exclusivamente en Bitcoin. "
                "Puedo ayudar con conceptos, seguridad, billeteras, Lightning, exchanges y el mercado. "
                "¿Cuál es tu duda sobre Bitcoin?"
            ),
        }

        ultima_mensagem = next(
            (
                msg.get("content", "")
                for msg in reversed(messages_history)
                if msg.get("role") == "user"
            ),
            "",
        )

        user_turns = sum(1 for m in messages_history if m.get("role") == "user")

        if (
            ultima_mensagem
            and user_turns <= 1
            and not self._eh_assunto_permitido(ultima_mensagem)
        ):
            logger.warning("Assunto fora do escopo bloqueado: %s", ultima_mensagem)
            return fora_de_escopo[lang]

        data_atual = datetime.now().strftime("%d/%m/%Y")
        preco_bitcoin = await self._obter_preco_bitcoin_atual()

        system_prompt = {
            "role": "system",
            "content": (
                "Você é a NagAI, mentora especializada EXCLUSIVAMENTE em Bitcoin e seu ecossistema "
                "(blockchain do Bitcoin, satoshis, Lightning Network, carteiras, custódia, mineração, "
                "halving, corretoras para comprar/vender Bitcoin, segurança e soberania financeira).\n\n"
                f"CONTEXTO EM TEMPO REAL: Hoje é {data_atual}. Preço atual do Bitcoin: {preco_bitcoin}. "
                "Use esses dados quando o usuário perguntar data/cotação.\n\n"
                "REGRAS DE ESCOPO (obrigatórias):\n"
                "1. Responda APENAS sobre Bitcoin e temas diretamente relacionados listados acima.\n"
                "2. Se o usuário perguntar sobre outro assunto (esportes, receitas, política geral, "
                "outras criptomoedas sem relação com Bitcoin, etc.), recuse de forma educada e breve, "
                "diga que só pode falar de Bitcoin, e convide a fazer uma pergunta sobre o tema.\n"
                "3. Em seguimentos da conversa (ex.: 'explique melhor', 'e depois?', 'o que você falou antes?'), "
                "mantenha o contexto do histórico e continue no tema Bitcoin já iniciado.\n"
                "4. Não invente que pode ajudar em temas fora de escopo.\n\n"
                "FORMATO DA RESPOSTA (obrigatório):\n"
                "- Escreva em texto puro, sem Markdown.\n"
                "- Não use **, __, #, ``` nem listas com * ou -.\n"
                "- Use frases curtas e, se precisar listar, use números (1. 2. 3.) ou quebras de linha.\n\n"
                f"IDIOMA OBRIGATÓRIO: responda SEMPRE em {lang_label}. "
                "Não misture idiomas, a menos que o usuário peça explicitamente uma tradução.\n"
                f"Nível do usuário: {level}. Seja clara, direta e use poucos tópicos."
            ),
        }

        messages_payload = [system_prompt] + [
            m for m in messages_history if m.get("role") in ROLES_PERMITIDOS
        ]

        last_error: Exception | None = None
        for attempt in range(3):
            try:
                chat_completion = await asyncio.to_thread(
                    self.client.chat.completions.create,
                    messages=messages_payload,
                    model=self.model,
                )
                content = chat_completion.choices[0].message.content or ""
                return self._para_texto_puro(content)
            except Exception as exc:
                last_error = exc
                logger.warning("Tentativa %s do Groq falhou: %s", attempt + 1, exc)
                if attempt < 2:
                    await asyncio.sleep(2)

        assert last_error is not None
        raise last_error
