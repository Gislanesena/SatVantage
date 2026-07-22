// lib/extension-analisar.ts — análise Bitcoin/segurança para a extensão Copiloto.
// Mesmo padrão do comportamental: tenta AGENTS_API_URL com timeout curto;
// se falhar, fallback local determinístico. Sem dados de conta SatVantage.

import {
  instrucaoSiteOficial,
  isSatVantageOfficialUrl,
  respostaSiteOficial,
  resumoPaginaOficial,
} from "@/lib/extension-satvantage-site";

export type RiscoNivel = "baixo" | "medio" | "alto";
export type AnaliseTipo = "avaliacao" | "guia";

export type AnaliseCopiloto = {
  tipo: AnaliseTipo;
  risco: RiscoNivel;
  explicacao: string;
  proximosPassos: string[];
  fonte: "agente" | "fallback" | "anthropic";
};

const MAX_PAGE = 8000;
const AGENT_TIMEOUT_MS = 4000;
const ANTHROPIC_TIMEOUT_MS = 25000;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Detecta se a pergunta pede tutorial/orientação em vez de avaliação de risco. */
export function detectarTipoPergunta(pergunta: string): AnaliseTipo {
  const q = normalize(pergunta.trim());
  if (!q) return "avaliacao";

  const avaliacaoHints = [
    "golpe",
    "scam",
    "phishing",
    "seguro",
    "segura",
    "risco",
    "desconfio",
    "legitimo",
    "legítima",
    "clonagem",
    "falso",
    "falsa",
    "posso confiar",
    "e confiavel",
    "é confiavel",
    "isso e",
    "isso é",
  ];
  if (avaliacaoHints.some((h) => q.includes(h))) return "avaliacao";

  const guiaHints = [
    "como eu",
    "como faco",
    "como faço",
    "como criar",
    "como crio",
    "como abro",
    "como abrir",
    "como conectar",
    "como conectar",
    "como fazer",
    "como uso",
    "como usar",
    "onde fica",
    "onde clico",
    "onde encontro",
    "passo a passo",
    "tutorial",
    "me ensina",
    "me explica como",
    "quero criar",
    "quero abrir",
    "quero conectar",
  ];
  if (guiaHints.some((h) => q.includes(h))) return "guia";

  // "como …" genérico
  if (q.startsWith("como ") || q.includes(" como ")) return "guia";

  return "avaliacao";
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
    "conta",
    "login",
    "cadastro",
    "registrar",
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
    return "medio";
  }
  return "baixo";
}

/** Extrai rótulos úteis do texto da página para montar um guia concreto. */
function extrairSinaisUi(pagina: string): string[] {
  const lines = pagina
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 2 && l.length <= 48);
  const interesting = lines.filter((l) => {
    const n = normalize(l);
    return (
      /^(criar|create|sign up|cadastr|registrar|abrir|conectar|connect|login|entrar|continuar|next|próximo|proximo|wallet|carteira|deposit|sacar|enviar|receber)/i.test(
        n,
      ) ||
      n.includes("carteira") ||
      n.includes("wallet") ||
      n.includes("criar conta") ||
      n.includes("sign up")
    );
  });
  const uniq: string[] = [];
  for (const l of interesting) {
    if (!uniq.includes(l)) uniq.push(l);
    if (uniq.length >= 5) break;
  }
  return uniq;
}

function fallbackLocal(
  pergunta: string,
  paginaTexto: string,
  paginaUrl?: string,
): AnaliseCopiloto {
  if (isSatVantageOfficialUrl(paginaUrl)) {
    const tipo = detectarTipoPergunta(pergunta);
    const r = respostaSiteOficial(pergunta, tipo);
    return { ...r, fonte: "fallback" };
  }

  const tipo = detectarTipoPergunta(pergunta);

  if (!isOnTopic(pergunta, paginaTexto)) {
    return {
      tipo: "avaliacao",
      risco: "baixo",
      explicacao:
        "Posso ajudar só com Bitcoin, carteiras Lightning e segurança cripto. " +
        "Sua pergunta parece fora desse tema — reformule focando em Bitcoin, carteiras ou risco de golpe.",
      proximosPassos: [
        "Pergunte algo como: “isso é golpe?”, “como criar uma carteira?” ou “este site pede seed?”.",
        "Se a página fala de Bitcoin, descreva o trecho que te preocupa.",
      ],
      fonte: "fallback",
    };
  }

  if (tipo === "guia") {
    const sinais = extrairSinaisUi(paginaTexto);
    const passos: string[] = [];
    if (sinais.length) {
      passos.push(
        `Nesta página, procure e use o controle/texto que mais combina com sua dúvida — ex.: “${sinais[0]}”.`,
      );
      if (sinais[1]) {
        passos.push(`Em seguida, confira também se aparece “${sinais[1]}” e avance só se fizer sentido para você.`);
      }
      if (sinais[2]) {
        passos.push(`Outros elementos visíveis relevantes: ${sinais.slice(2).join(" · ")}.`);
      }
    } else {
      passos.push(
        "Leia os botões e links principais da página (criar conta, conectar carteira, continuar) e escolha o que corresponde à sua intenção.",
      );
      passos.push(
        "Se for cadastro, preencha só o necessário e confirme o domínio na barra de endereço antes de seguir.",
      );
    }
    passos.push(
      "Aviso de segurança: nunca digite frase secreta (seed), nsec ou chave privada em formulário de site — carteira legítima gera isso no seu aparelho.",
    );
    passos.push(
      "Se a página pedir “validar” enviando sats, ou suporte por Telegram/WhatsApp, pare e saia — é sinal clássico de golpe.",
    );

    return {
      tipo: "guia",
      risco: "baixo",
      explicacao:
        `Orientação para: “${pergunta}”. ` +
        "Use os passos abaixo com base no texto visível desta página. " +
        "O Copiloto não clica por você — confirme cada ação com calma.",
      proximosPassos: passos.slice(0, 6),
      fonte: "fallback",
    };
  }

  const risco = scoreRisk(pergunta, paginaTexto);

  if (risco === "alto") {
    return {
      tipo: "avaliacao",
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
      tipo: "avaliacao",
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
    tipo: "avaliacao",
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

function parseAgentJson(json: any, tipoHint: AnaliseTipo): AnaliseCopiloto | null {
  const tipoRaw = String(json.tipo || json.type || tipoHint || "avaliacao").toLowerCase();
  const tipo: AnaliseTipo = tipoRaw.includes("guia") || tipoRaw.includes("guide")
    ? "guia"
    : "avaliacao";

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
    tipo,
    risco: tipo === "guia" ? "baixo" : risco,
    explicacao,
    proximosPassos: Array.isArray(passos)
      ? passos.map(String).filter(Boolean).slice(0, 6)
      : [],
    fonte: "agente",
  };
}

const INSTRUCAO_MODOS =
  "Você é o Copiloto SatVantage. Responda SOMENTE sobre Bitcoin, Lightning, carteiras, exchanges e segurança cripto. " +
  "Recuse educadamente qualquer outro tema. Responda em português simples. " +
  "IDENTIFIQUE a intenção ANTES de responder: " +
  "(1) tipo=avaliacao — perguntas de golpe/segurança/risco ou análise genérica da página: " +
  "JSON { tipo:\"avaliacao\", risco:\"baixo|medio|alto\", explicacao:string, proximos_passos:string[] }. " +
  "(2) tipo=guia — perguntas de tutorial (como criar/abrir/fazer/onde fica): " +
  "use o TEXTO REAL da página para um passo a passo concreto (cite botões/campos que aparecem no texto). " +
  "Inclua 1-2 avisos de segurança (ex.: nunca compartilhe seed), mas NÃO use formato de nível de risco. " +
  "JSON { tipo:\"guia\", explicacao:string, proximos_passos:string[] }.";

function instrucaoCompleta(paginaUrl?: string): string {
  if (isSatVantageOfficialUrl(paginaUrl)) {
    return `${INSTRUCAO_MODOS}\n\n${instrucaoSiteOficial()}`;
  }
  return INSTRUCAO_MODOS;
}

async function tryAgentAnalise(payload: {
  paginaTexto: string;
  pergunta: string;
  paginaTitulo?: string;
  paginaUrl?: string;
  tipoHint: AnaliseTipo;
}): Promise<AnaliseCopiloto | null> {
  const base = process.env.AGENTS_API_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base}/extension/analisar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pagina_texto: payload.paginaTexto,
        pergunta: payload.pergunta,
        pagina_titulo: payload.paginaTitulo ?? "",
        pagina_url: payload.paginaUrl ?? "",
        idioma: "pt-BR",
        tipo_sugerido: payload.tipoHint,
        site_oficial: isSatVantageOfficialUrl(payload.paginaUrl),
        instrucao: instrucaoCompleta(payload.paginaUrl),
      }),
      signal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return parseAgentJson(json, payload.tipoHint);
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
  const paginaUrl = input.paginaUrl;
  const oficial = isSatVantageOfficialUrl(paginaUrl);

  // Site oficial: resposta local (URL + mapa). Não deixa agente genérico marcar “risco médio”.
  if (oficial) {
    if (!pergunta) {
      return { ...resumoPaginaOficial(paginaUrl, paginaTexto), fonte: "fallback" };
    }
    const tipoHint = detectarTipoPergunta(pergunta);
    return { ...respostaSiteOficial(pergunta, tipoHint), fonte: "fallback" };
  }

  const tipoHint = detectarTipoPergunta(pergunta || "resumo da pagina");

  if (!pergunta) {
    const trecho = paginaTexto.replace(/\s+/g, " ").trim().slice(0, 220);
    return {
      tipo: "guia",
      risco: scoreRisk("resumo", paginaTexto),
      explicacao:
        `Resumo desta página${input.paginaTitulo ? ` (“${input.paginaTitulo}”)` : ""}` +
        (paginaUrl ? ` · URL: ${paginaUrl}` : "") +
        ". " +
        (trecho
          ? `Trecho visível: “${trecho}${paginaTexto.length > 220 ? "…" : ""}”. `
          : "Pouco texto visível para resumir. ") +
        "Posso avaliar risco Bitcoin/segurança ou te guiar se você fizer uma pergunta.",
      proximosPassos: [
        "Confira o domínio na barra de endereço.",
        "Pergunte “isso é golpe?” ou “como crio uma carteira aqui?” se quiser análise guiada.",
        "Nunca compartilhe seed, nsec ou chave privada.",
      ],
      fonte: "fallback",
    };
  }

  const fromAgent = await tryAgentAnalise({
    paginaTexto,
    pergunta,
    paginaTitulo: input.paginaTitulo,
    paginaUrl,
    tipoHint,
  });
  if (fromAgent) {
    if (tipoHint === "guia") fromAgent.tipo = "guia";
    if (tipoHint === "avaliacao") fromAgent.tipo = "avaliacao";
    if (!fromAgent.proximosPassos.length) {
      fromAgent.proximosPassos =
        fromAgent.tipo === "guia"
          ? ["Siga só os botões que você reconhece na página e não compartilhe seed."]
          : ["Confira o domínio e não compartilhe seed nem chave privada."];
    }
    return fromAgent;
  }

  return fallbackLocal(pergunta, paginaTexto, paginaUrl);
}

/** Análise visual (screenshot) — Anthropic vision ou agente; fallback textual. */
export async function analisarImagem(input: {
  imagemBase64: string;
  mediaType?: string;
  pergunta: string;
  paginaTexto?: string;
  paginaTitulo?: string;
  paginaUrl?: string;
}): Promise<AnaliseCopiloto> {
  const pergunta =
    String(input.pergunta || "").trim().slice(0, 500) ||
    "Há sinais visuais de golpe, phishing ou clonagem nesta captura?";
  const mediaType = input.mediaType === "image/jpeg" ? "image/jpeg" : "image/png";
  const b64 = String(input.imagemBase64 || "").replace(/^data:image\/\w+;base64,/, "");
  const tipoHint = detectarTipoPergunta(pergunta);

  if (!b64 || b64.length < 32) {
    return {
      tipo: "avaliacao",
      risco: "medio",
      explicacao: "Não recebi uma imagem válida para analisar.",
      proximosPassos: ["Capture a aba de novo e selecione a área com o conteúdo suspeito."],
      fonte: "fallback",
    };
  }

  // 1) Agente da dupla (se expuser endpoint de imagem)
  const base = process.env.AGENTS_API_URL;
  if (base) {
    try {
      const res = await fetch(`${base}/extension/analisar-imagem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagem_base64: b64,
          media_type: mediaType,
          pergunta,
          pagina_texto: (input.paginaTexto || "").slice(0, MAX_PAGE),
          pagina_titulo: input.paginaTitulo ?? "",
          pagina_url: input.paginaUrl ?? "",
          idioma: "pt-BR",
          site_oficial: isSatVantageOfficialUrl(input.paginaUrl),
          instrucao:
            instrucaoCompleta(input.paginaUrl) +
            " Analise a IMAGEM em busca de QR suspeito, botões falsos, clonagem visual de sites e phishing. " +
            (isSatVantageOfficialUrl(input.paginaUrl)
              ? "Se a captura for do site oficial SatVantage, confirme que é seguro e guie com empatia usando o mapa."
              : ""),
        }),
        signal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
      });
      if (res.ok) {
        const json = await res.json();
        const parsed = parseAgentJson(json, tipoHint);
        if (parsed) {
          parsed.fonte = "agente";
          return parsed;
        }
      }
    } catch {
      /* tenta Anthropic */
    }
  }

  // 2) Anthropic Messages API (visão)
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: instrucaoCompleta(input.paginaUrl),
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: b64,
                  },
                },
                {
                  type: "text",
                  text:
                    `Pergunta do usuário: ${pergunta}\n` +
                    `URL: ${input.paginaUrl || "(desconhecida)"}\n` +
                    `Título: ${input.paginaTitulo || ""}\n` +
                    `Texto visível (recorte): ${(input.paginaTexto || "").slice(0, 3000)}\n` +
                    "Responda APENAS com JSON válido no formato pedido.",
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(ANTHROPIC_TIMEOUT_MS),
      });

      if (res.ok) {
        const json = await res.json();
        const textBlock = Array.isArray(json.content)
          ? json.content.find((c: any) => c.type === "text")
          : null;
        const raw = typeof textBlock?.text === "string" ? textBlock.text : "";
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = parseAgentJson(JSON.parse(match[0]), tipoHint);
            if (parsed) {
              parsed.fonte = "anthropic";
              if (!parsed.proximosPassos.length) {
                parsed.proximosPassos = [
                  "Confira o domínio e não compartilhe seed nem chave privada.",
                ];
              }
              return parsed;
            }
          } catch {
            /* fallback */
          }
        }
      }
    } catch {
      /* fallback */
    }
  }

  // 3) Sem visão disponível — avalia com texto da página + pergunta
  const local = fallbackLocal(pergunta, input.paginaTexto || "");
  local.explicacao =
    "Não há chave de visão configurada (ANTHROPIC_API_KEY / AGENTS_API_URL). " +
    "Segue análise com base no texto da página e na sua pergunta: " +
    local.explicacao;
  return local;
}
