/**
 * Mentor local (fallback) quando AGENTS_API_URL está fora do ar.
 * Respostas educativas sobre Bitcoin / autocustódia — sem LLM externo.
 * Variantes por mensagem evitam “loop” da mesma frase estática.
 */

export type NagaiLocalInput = {
  mensagem: string;
  locale?: string;
  /** Motivo do fallback (só para variar o tom / log interno). */
  degradeKind?: string;
};

const SCOPE_RE =
  /\b(bitcoin|btc|satoshi|sats?|satoshis?|lightning|ln|carteira|wallet|seed|chave|autocust[oó]dia|blockchain|criptomoeda|cripto|miner|halving|cold\s?card|sparrow|electrum|blue\s?wallet|muun|trezor|bitbox|nostr|npub|nwc|mutiny|bolt11|invoice|fatura|on[- ]?chain|mempool|utxo|taproot|segwit|node|n[oó][oó]?|cust[oó]dia|exchange|corretora|binance|kraken|dca|volatil|infla[cç][aã]o|imposto|tribut|cotac|pre[cç]o|usd|brl|d[oó]lar|real)\b/i;

const PRICE_RE =
  /\b(cota[cç][aã]o|pre[cç]o|quanto\s+vale|valor\s+(do|atual)|price|quote|usd|brl|d[oó]lar|real)\b/i;

const YEAR_RE = /\b(ano|year|estamos|hoje|data|202[0-9])\b/i;

function lang(locale?: string): "pt" | "en" | "es" {
  const l = (locale || "pt").toLowerCase();
  if (l.startsWith("en")) return "en";
  if (l.startsWith("es")) return "es";
  return "pt";
}

function fmtMoney(n: number, currency: "BRL" | "USD", loc: "pt" | "en" | "es") {
  const tag = loc === "en" ? "en-US" : loc === "es" ? "es-ES" : "pt-BR";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

async function fetchBtcPrices(): Promise<{ brl: number; usd: number } | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl,usd",
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6_000),
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const brl = Number(json?.bitcoin?.brl);
    const usd = Number(json?.bitcoin?.usd);
    if (!Number.isFinite(brl) || !Number.isFinite(usd)) return null;
    return { brl, usd };
  } catch {
    return null;
  }
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function snippetOf(msg: string, max = 72): string {
  const s = msg.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length]!;
}

function offTopic(msg: string, loc: "pt" | "en" | "es", seed: number) {
  const snip = snippetOf(msg);
  if (loc === "en") {
    return pick(
      [
        `About “${snip}”: I'm NagAI and I stay on Bitcoin, sats, Lightning, self-custody and security. Try asking what a seed phrase is, or how a Lightning invoice works.`,
        `I can't cover “${snip}” outside Bitcoin/self-custody. Ask me about wallets, sats, Lightning, or scam red flags — happy to help there.`,
        `That sounds outside my lane (“${snip}”). Narrow it to Bitcoin basics, keys/seed, Lightning payments, or custody — and I'll answer.`,
      ],
      seed,
    );
  }
  if (loc === "es") {
    return pick(
      [
        `Sobre “${snip}”: soy NagAI y me centro en Bitcoin, sats, Lightning, autocustodia y seguridad. Prueba preguntar qué es una seed phrase o cómo funciona una factura Lightning.`,
        `No cubro “${snip}” fuera de Bitcoin/autocustodia. Pregúntame por carteras, sats, Lightning o señales de estafa.`,
        `Eso queda fuera de mi foco (“${snip}”). Acótalo a lo básico de Bitcoin, llaves/seed, pagos Lightning o custodia — y te respondo.`,
      ],
      seed,
    );
  }
  return pick(
    [
      `Sobre “${snip}”: sou a NagAI e falo de Bitcoin, sats, Lightning, autocustódia e segurança. Tente perguntar o que é uma seed phrase, ou como funciona uma fatura Lightning.`,
      `Não cubro “${snip}” fora de Bitcoin/autocustódia. Pergunte sobre carteiras, sats, Lightning ou sinais de golpe — aí eu ajudo.`,
      `Isso foge do meu foco (“${snip}”). Reformule para básico de Bitcoin, chaves/seed, pagamentos Lightning ou custódia que eu respondo.`,
    ],
    seed,
  );
}

function matchFaq(msg: string, loc: "pt" | "en" | "es"): string | null {
  const m = msg.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

  if (
    /o\s+que\s+e\s+bitcoin|what\s+is\s+bitcoin|que\s+es\s+bitcoin|bitcoin\s+(e|is|es)\b/.test(
      m,
    ) ||
    (/o\s+que\s+e|what\s+is|que\s+es/.test(m) && /bitcoin/.test(m))
  ) {
    if (loc === "en") {
      return "Bitcoin is a decentralized digital money network: anyone can verify transactions without a bank. Units are BTC; smaller units are sats (100 million sats = 1 BTC). SatVantage teaches self-custody — you hold the keys.";
    }
    if (loc === "es") {
      return "Bitcoin es una red de dinero digital descentralizada: cualquiera puede verificar transacciones sin un banco. Las unidades son BTC; las más pequeñas son sats (100 millones de sats = 1 BTC). SatVantage enseña autocustodia: tú guardas las llaves.";
    }
    return "Bitcoin é uma rede de dinheiro digital descentralizada: qualquer pessoa pode verificar as transações sem um banco. A unidade é o BTC; a menor unidade prática são os sats (100 milhões de sats = 1 BTC). No SatVantage a gente ensina autocustódia — você guarda as chaves.";
  }

  if (/\b(seed|frase\s+semente|12\s+palavras|24\s+palavras|mnemonic)\b/.test(m)) {
    if (loc === "en") {
      return "A seed phrase (usually 12 or 24 words) recovers your wallet. Write it offline, never photo/cloud it, and never share it — not even with “support”. Anyone with the seed controls the funds.";
    }
    if (loc === "es") {
      return "Una seed phrase (suele ser 12 o 24 palabras) recupera tu cartera. Anótala offline, nunca en foto/nube, y nunca la compartas — ni con “soporte”. Quien tenga la seed controla los fondos.";
    }
    return "A seed phrase (geralmente 12 ou 24 palavras) recupera sua carteira. Anote offline, nunca tire foto nem guarde na nuvem, e nunca compartilhe — nem com “suporte”. Quem tem a seed controla os fundos.";
  }

  if (/\b(carteira|wallet|autocust|blue\s?wallet|sparrow|muun|electrum)\b/.test(m)) {
    if (loc === "en") {
      return "Self-custody means you control the keys. Common learning picks: BlueWallet or Muun (mobile), Sparrow or Electrum (desktop), and hardware like Coldcard, BitBox or Trezor for long-term savings. Start small and practice recovering with a test wallet.";
    }
    if (loc === "es") {
      return "Autocustodia significa que tú controlas las llaves. Opciones didácticas: BlueWallet o Muun (móvil), Sparrow o Electrum (escritorio), y hardware como Coldcard, BitBox o Trezor para ahorro a largo plazo. Empieza con poco y practica recuperar una cartera de prueba.";
    }
    return "Autocustódia significa que você controla as chaves. Opções didáticas: BlueWallet ou Muun (mobile), Sparrow ou Electrum (desktop), e hardware como Coldcard, BitBox ou Trezor para reserva de longo prazo. Comece com pouco e pratique recuperar uma carteira de teste.";
  }

  if (/\b(lightning|bolt11|invoice|fatura|ln)\b/.test(m)) {
    if (loc === "en") {
      return "Lightning is a second layer for faster, cheaper Bitcoin payments. A bolt11 invoice is a payment request your wallet can pay. On SatVantage demos we often use MutinyNet test invoices — never paste random mainnet invoices from strangers.";
    }
    if (loc === "es") {
      return "Lightning es una segunda capa para pagos Bitcoin más rápidos y baratos. Una factura bolt11 es una solicitud de pago que tu cartera puede pagar. En demos de SatVantage a menudo usamos facturas MutinyNet de prueba — nunca pegues facturas mainnet al azar de desconocidos.";
    }
    return "Lightning é uma segunda camada para pagamentos Bitcoin mais rápidos e baratos. Uma fatura bolt11 é um pedido de pagamento que sua carteira consegue pagar. Nas demos do SatVantage costumamos usar faturas MutinyNet de teste — nunca cole faturas mainnet aleatórias de desconhecidos.";
  }

  if (/\b(satoshi|sats?)\b/.test(m) && !PRICE_RE.test(msg)) {
    if (loc === "en") {
      return "A sat (satoshi) is the smallest unit of Bitcoin commonly used: 1 BTC = 100,000,000 sats. Mentorship rewards on SatVantage are credited in sats to your account balance.";
    }
    if (loc === "es") {
      return "Un sat (satoshi) es la unidad más pequeña de Bitcoin de uso común: 1 BTC = 100.000.000 sats. Las recompensas de mentoría en SatVantage se acreditan en sats a tu saldo.";
    }
    return "Um sat (satoshi) é a menor unidade prática do Bitcoin: 1 BTC = 100.000.000 sats. As recompensas de mentoria no SatVantage entram em sats no seu saldo.";
  }

  if (/\b(golpe|scam|phishing|suporte|envie.*(seed|chave))\b/.test(m)) {
    if (loc === "en") {
      return "Classic scams: fake support asking for your seed, “doubling” schemes, phishing sites, and QR codes that drain wallets. SatVantage never asks for your seed. If someone pressures you to send keys or funds urgently — stop.";
    }
    if (loc === "es") {
      return "Estafas clásicas: falso soporte pidiendo la seed, esquemas de “duplicar”, phishing y códigos QR que vacían carteras. SatVantage nunca pide tu seed. Si alguien te presiona a enviar llaves o fondos con urgencia — para.";
    }
    return "Golpes clássicos: falso suporte pedindo seed, “dobrar sats”, phishing e QR que drenam carteira. O SatVantage nunca pede sua seed. Se alguém pressionar para enviar chaves ou fundos com urgência — pare.";
  }

  return null;
}

function degradeNote(loc: "pt" | "en" | "es", kind: string | undefined, seed: number): string {
  // Só menciona degradação em falhas de infra (não em toda resposta).
  const infra =
    kind === "localhost_in_prod" ||
    kind === "not_configured" ||
    kind === "connection_refused" ||
    kind === "timeout" ||
    kind === "dns" ||
    kind === "invalid_url";
  if (!infra) return "";
  if (loc === "en") {
    return pick(
      [
        "(Mentor AI is temporarily offline — short local tip.) ",
        "(Backend agent unreachable — answering with a local guide.) ",
        "(Degraded mode: local reply while the agent API is down.) ",
      ],
      seed,
    );
  }
  if (loc === "es") {
    return pick(
      [
        "(La IA del mentor está temporalmente fuera — tip local breve.) ",
        "(Agente inaccesible — respondo con guía local.) ",
        "(Modo degradado: respuesta local mientras falla la API.) ",
      ],
      seed,
    );
  }
  return pick(
    [
      "(A IA do mentor está temporariamente fora — dica local breve.) ",
      "(Agente inacessível — respondendo com guia local.) ",
      "(Modo degradado: resposta local enquanto a API falha.) ",
    ],
    seed,
  );
}

function genericHelp(msg: string, loc: "pt" | "en" | "es", seed: number) {
  const snip = snippetOf(msg);
  if (loc === "en") {
    return pick(
      [
        `On “${snip}”: keep keys offline when you can, double-check addresses, prefer self-custody for savings, and Lightning for small everyday amounts. Want wallets, seed phrases, or invoices next?`,
        `Regarding “${snip}” — practical rule: verify before you send, never share a seed, and separate long-term cold storage from day-to-day Lightning. Ask me one of those angles in more detail.`,
        `Good angle (“${snip}”). Start small: learn recovery with a test wallet, then move savings to self-custody. Tell me if you care more about mobile wallets, hardware, or Lightning.`,
        `For “${snip}”: Bitcoin security is mostly key hygiene + patience. I can walk through seed backup, invoice safety, or exchange vs self-custody — pick one.`,
      ],
      seed,
    );
  }
  if (loc === "es") {
    return pick(
      [
        `Sobre “${snip}”: guarda llaves offline cuando puedas, verifica direcciones, prioriza autocustodia para ahorro y Lightning para montos chicos. ¿Seguimos con carteras, seed o facturas?`,
        `Respecto a “${snip}”: verifica antes de enviar, nunca compartas la seed y separa ahorro en frío de Lightning diario. Dime qué ángulo quieres profundizar.`,
        `Buen enfoque (“${snip}”). Empieza poco: practica recuperar una cartera de prueba y luego mueve ahorro a autocustodia. ¿Móvil, hardware o Lightning?`,
        `Para “${snip}”: la seguridad en Bitcoin es higiene de llaves + paciencia. Puedo detallar backup de seed, seguridad de facturas o exchange vs autocustodia.`,
      ],
      seed,
    );
  }
  return pick(
    [
      `Sobre “${snip}”: guarde chaves offline quando puder, confira endereços, prefira autocustódia para reserva e Lightning para o dia a dia. Quer seguir por carteiras, seed ou faturas?`,
      `Em relação a “${snip}”: verifique antes de enviar, nunca compartilhe a seed e separe reserva (fria) de Lightning do cotidiano. Diz qual ângulo quer aprofundar.`,
      `Bom ponto (“${snip}”). Comece pequeno: pratique recuperar uma carteira de teste e depois mova reserva para autocustódia. Prefere mobile, hardware ou Lightning?`,
      `Para “${snip}”: segurança em Bitcoin é higiene de chaves + paciência. Posso detalhar backup de seed, segurança de fatura ou exchange vs autocustódia — escolha um.`,
    ],
    seed,
  );
}

/** Gera resposta local compatível com o proxy /api/agents (mentor + interact). */
export async function replyNagaiLocal(
  input: NagaiLocalInput,
): Promise<{ resposta_ia: string; fonte: "local"; degraded?: boolean }> {
  const loc = lang(input.locale);
  const msg = (input.mensagem || "").trim();
  const seed = hashStr(`${msg}|${input.degradeKind || ""}`);
  const note = degradeNote(loc, input.degradeKind, seed);

  if (!msg) {
    return {
      resposta_ia:
        note +
        (loc === "en"
          ? "Send a Bitcoin question and I’ll help."
          : loc === "es"
            ? "Envía una pregunta sobre Bitcoin y te ayudo."
            : "Manda uma dúvida sobre Bitcoin que eu te ajudo."),
      fonte: "local",
      degraded: Boolean(input.degradeKind),
    };
  }

  const wantsPrice = PRICE_RE.test(msg);
  const wantsYear = YEAR_RE.test(msg);
  const inScope = SCOPE_RE.test(msg) || wantsPrice;

  if (!inScope) {
    return {
      resposta_ia: note + offTopic(msg, loc, seed),
      fonte: "local",
      degraded: Boolean(input.degradeKind),
    };
  }

  if (wantsPrice) {
    const prices = await fetchBtcPrices();
    const year = new Date().getFullYear();
    if (prices) {
      const brl = fmtMoney(prices.brl, "BRL", loc);
      const usd = fmtMoney(prices.usd, "USD", loc);
      if (loc === "en") {
        return {
          resposta_ia:
            note +
            (wantsYear
              ? `Rough spot price now: about ${brl} (BRL) and ${usd} (USD), via CoinGecko. We are in ${year}. Prices move fast — treat this as a snapshot, not financial advice.`
              : `Rough spot price now: about ${brl} (BRL) and ${usd} (USD), via CoinGecko. Prices move fast — treat this as a snapshot, not financial advice.`),
          fonte: "local",
          degraded: Boolean(input.degradeKind),
        };
      }
      if (loc === "es") {
        return {
          resposta_ia:
            note +
            (wantsYear
              ? `Cotización aproximada ahora: cerca de ${brl} (BRL) y ${usd} (USD), vía CoinGecko. Estamos en ${year}. El precio se mueve rápido — es una foto del momento, no consejo financiero.`
              : `Cotización aproximada ahora: cerca de ${brl} (BRL) y ${usd} (USD), vía CoinGecko. El precio se mueve rápido — es una foto del momento, no consejo financiero.`),
          fonte: "local",
          degraded: Boolean(input.degradeKind),
        };
      }
      return {
        resposta_ia:
          note +
          (wantsYear
            ? `Cotação aproximada agora: cerca de ${brl} (BRL) e ${usd} (USD), via CoinGecko. Estamos em ${year}. O preço oscila rápido — isso é um retrato do momento, não conselho financeiro.`
            : `Cotação aproximada agora: cerca de ${brl} (BRL) e ${usd} (USD), via CoinGecko. O preço oscila rápido — isso é um retrato do momento, não conselho financeiro.`),
        fonte: "local",
        degraded: Boolean(input.degradeKind),
      };
    }
    return {
      resposta_ia:
        note +
        (loc === "en"
          ? `I couldn't fetch the live quote right now. We are in ${new Date().getFullYear()}. Try again in a moment, or check the Bitcoin chart on the home page.`
          : loc === "es"
            ? `No pude obtener la cotización en vivo ahora. Estamos en ${new Date().getFullYear()}. Intenta de nuevo en un momento, o mira el gráfico de Bitcoin en la página inicial.`
            : `Não consegui buscar a cotação ao vivo agora. Estamos em ${new Date().getFullYear()}. Tente de novo em instantes, ou veja o gráfico de Bitcoin na página inicial.`),
      fonte: "local",
      degraded: Boolean(input.degradeKind),
    };
  }

  const faq = matchFaq(msg, loc);
  if (faq) {
    return {
      resposta_ia: note + faq,
      fonte: "local",
      degraded: Boolean(input.degradeKind),
    };
  }

  return {
    resposta_ia: note + genericHelp(msg, loc, seed),
    fonte: "local",
    degraded: Boolean(input.degradeKind),
  };
}
