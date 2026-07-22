// lib/extension-analisar.ts — análise Bitcoin/segurança para a extensão Copiloto.
// Mesmo padrão do comportamental: tenta AGENTS_API_URL com timeout curto;
// se falhar, fallback local determinístico. Sem dados de conta SatVantage.

export type RiscoNivel = "baixo" | "medio" | "alto";

export type AnaliseCopiloto = {
  risco: RiscoNivel;
  explicacao: string;
  proximosPassos: string[];
  fonte: "agente" | "fallback";
};

const MAX_PAGE = 8000;
const AGENT_TIMEOUT_MS = 4000;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Tema permitido: Bitcoin, carteiras, Lightning, golpes/segurança cripto. */
function isOnTopic(pergunta: string, pagina: string): boolean {
  const blob = normalize(`${pergunta}\n${pagina.slice(0, 2000)}`);
  const keys = [
    "bitcoin",
    "btc",
    "satoshi",
    "sats",
    "carteira",
    "wallet",
    "lightning",
    "lnurl",
    "invoice",
    "bolt11",
    "nostr",
    "nwc",
    "seed",
    "mnemonic",
    "frase secreta",
    "chave privada",
    "private key",
    "nsec",
    "npub",
    "cripto",
    "crypto",
    "exchange",
    "corretora",
    "golpe",
    "scam",
    "phishing",
    "autocustodia",
    "self-custody",
    "mutiny",
    "alby",
    "coinos",
    "pix bitcoin",
    "satvantage",
  ];
  return keys.some((k) => blob.includes(normalize(k)));
}

function scoreRisk(pergunta: string, pagina: string): RiscoNivel {
  const blob = normalize(`${pergunta}\n${pagina}`);
  const high = [
    "envie sua seed",
    "digite sua seed",
    "frase secreta",
    "12 palavras",
    "24 palavras",
    "chave privada",
    "private key",
    "cole sua nsec",
    "nsec1",
    "envie agora",
    "urgente",
    "suporte telegram",
    "suporte whatsapp",
    "dobrar bitcoin",
    "dobrar btc",
    "airdrop gratis",
    "validar carteira",
    "conectar seed",
    "recuperar fundos enviando",
  ];
  const mid = [
    "conecte sua carteira",
    "aprovar permiss",
    "assine esta mensagem",
    "claim reward",
    "verifique sua conta",
    "atualize sua carteira",
    "baixe este app",
    "investimento garantido",
    "lucro garantido",
    "mineracao na nuvem",
  ];

  if (high.some((k) => blob.includes(normalize(k)))) return "alto";
  if (mid.some((k) => blob.includes(normalize(k)))) return "medio";

  const q = normalize(pergunta);
  if (q.includes("golpe") || q.includes("scam") || q.includes("seguro")) {
    // Pergunta de cautela sem sinais fortes na página → médio preventivo
    return "medio";
  }
  return "baixo";
}

function fallbackLocal(pergunta: string, paginaTexto: string): AnaliseCopiloto {
  if (!isOnTopic(pergunta, paginaTexto)) {
    return {
      risco: "baixo",
      explicacao:
        "Posso ajudar só com Bitcoin, carteiras Lightning e segurança cripto. " +
        "Sua pergunta parece fora desse tema — reformule focando em Bitcoin ou risco de golpe, se for o caso.",
      proximosPassos: [
        "Pergunte algo como: “isso é golpe?”, “como criar uma carteira?” ou “este site pede seed?”.",
        "Se a página fala de Bitcoin, descreva o trecho que te preocupa.",
      ],
      fonte: "fallback",
    };
  }

  const risco = scoreRisk(pergunta, paginaTexto);
  const q = normalize(pergunta);

  if (q.includes("carteira") || q.includes("wallet") || q.includes("criar")) {
    return {
      risco: risco === "alto" ? "alto" : "baixo",
      explicacao:
        risco === "alto"
          ? "Há sinais de risco nesta página. Criar carteira nunca deve pedir sua frase secreta (seed) nem chave privada. Sites legítimos ensinam a gerar a carteira no seu aparelho, sob seu controle."
          : "Para criar uma carteira com segurança: use um app ou extensão conhecida (ex.: Alby, carteira Lightning de confiança), anote a frase secreta offline e nunca a digite em sites. O SatVantage, no caminho iniciante, gera a identidade Nostr no navegador e cifra o cofre com a sua senha — a chave não fica em texto claro no servidor.",
      proximosPassos:
        risco === "alto"
          ? [
              "Feche a página se ela pedir seed, nsec ou “validar carteira” enviando fundos.",
              "Crie a carteira só em app/extensão oficial, não em formulário de site desconhecido.",
              "Se alguém te apressa, pare — urgência é tática clássica de golpe.",
            ]
          : [
              "Prefira carteiras com boa reputação e código auditável quando possível.",
              "Faça backup da frase secreta em papel, fora da internet.",
              "Teste com valores pequenos na rede de teste antes de usar dinheiro real.",
            ],
      fonte: "fallback",
    };
  }

  if (risco === "alto") {
    return {
      risco: "alto",
      explicacao:
        "Esta página (ou o pedido que você descreveu) tem sinais fortes de golpe: urgência, pedido de seed/chave, “suporte” por chat ou promessa de retorno fácil. Em Bitcoin, quem pede sua frase secreta quer roubar seus fundos — suporte legítimo nunca pede isso.",
      proximosPassos: [
        "Não digite seed, nsec, senha de exchange nem códigos 2FA nesta página.",
        "Feche a aba e confirme o endereço oficial por um canal que você já confia.",
        "Se já compartilhou algo sensível, mova fundos para uma carteira nova que só você controla.",
      ],
      fonte: "fallback",
    };
  }

  if (risco === "medio") {
    return {
      risco: "medio",
      explicacao:
        "Não dá para cravar golpe só pelo texto, mas há motivos para cautela (conexões de carteira, assinaturas, promessas de lucro ou downloads). Em cripto, revise sempre a URL, as permissões pedidas e se alguém está te apressando.",
      proximosPassos: [
        "Confira se o domínio é o oficial (desconfie de letras trocadas).",
        "Não aprove permissões amplas sem entender o que a página pode fazer.",
        "Em dúvida, saia e pergunte em uma comunidade confiável antes de enviar sats.",
      ],
      fonte: "fallback",
    };
  }

  return {
    risco: "baixo",
    explicacao:
      "Pelo texto visível analisado, não saltam sinais clássicos de golpe (pedido de seed, urgência extrema, suporte falso). Mesmo assim, em Bitcoin a responsabilidade é sua: confira destino, valores e se a ação faz sentido para você.",
    proximosPassos: [
      "Leia com calma o que a página pede antes de conectar carteira ou pagar.",
      "Comece com valores pequenos se for a primeira vez naquele serviço.",
      "Nunca compartilhe frase secreta ou chave privada — nem com “suporte”.",
    ],
    fonte: "fallback",
  };
}

async function tryAgentAnalise(payload: {
  paginaTexto: string;
  pergunta: string;
  paginaTitulo?: string;
  paginaUrl?: string;
}): Promise<AnaliseCopiloto | null> {
  const base = process.env.AGENTS_API_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base}/extension/analisar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Só texto anônimo da página + pergunta — sem npub, user id, saldo
        pagina_texto: payload.paginaTexto,
        pergunta: payload.pergunta,
        pagina_titulo: payload.paginaTitulo ?? "",
        pagina_url: payload.paginaUrl ?? "",
        idioma: "pt-BR",
        instrucao:
          "Você é o Copiloto SatVantage. Responda SOMENTE sobre Bitcoin, Lightning, carteiras e segurança cripto. " +
          "Recuse educadamente qualquer outro tema. Responda em português simples. " +
          "JSON: { risco: baixo|medio|alto, explicacao: string, proximos_passos: string[] }.",
      }),
      signal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();

    const riscoRaw = json.risco ?? json.risk ?? json.nivel;
    const explicacao =
      (typeof json.explicacao === "string" && json.explicacao) ||
      (typeof json.message === "string" && json.message) ||
      (typeof json.mensagem === "string" && json.mensagem) ||
      "";
    const passos =
      json.proximosPassos ??
      json.proximos_passos ??
      json.passos ??
      json.next_steps;

    if (!explicacao) return null;

    const riscoNorm = normalize(String(riscoRaw || "baixo"));
    const risco: RiscoNivel = riscoNorm.includes("alto")
      ? "alto"
      : riscoNorm.includes("medio")
        ? "medio"
        : "baixo";

    return {
      risco,
      explicacao,
      proximosPassos: Array.isArray(passos)
        ? passos.map(String).filter(Boolean).slice(0, 6)
        : [],
      fonte: "agente",
    };
  } catch {
    return null;
  }
}

export async function analisarPagina(input: {
  paginaTexto: string;
  pergunta: string;
  paginaTitulo?: string;
  paginaUrl?: string;
}): Promise<AnaliseCopiloto> {
  const paginaTexto = String(input.paginaTexto || "").slice(0, MAX_PAGE);
  const pergunta = String(input.pergunta || "").trim().slice(0, 500);

  if (!pergunta) {
    return {
      risco: "baixo",
      explicacao: "Envie uma pergunta sobre Bitcoin ou segurança nesta página.",
      proximosPassos: ["Use as sugestões do popup ou escreva sua dúvida."],
      fonte: "fallback",
    };
  }

  const fromAgent = await tryAgentAnalise({
    paginaTexto,
    pergunta,
    paginaTitulo: input.paginaTitulo,
    paginaUrl: input.paginaUrl,
  });
  if (fromAgent) {
    if (!fromAgent.proximosPassos.length) {
      fromAgent.proximosPassos = [
        "Confira o domínio e não compartilhe seed nem chave privada.",
      ];
    }
    return fromAgent;
  }

  return fallbackLocal(pergunta, paginaTexto);
}
