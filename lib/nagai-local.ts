/**
 * Mentor local (fallback) quando AGENTS_API_URL está fora do ar.
 * Respostas educativas sobre Bitcoin / autocustódia — sem LLM externo.
 */

export type NagaiLocalInput = {
  mensagem: string;
  locale?: string;
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

function offTopic(loc: "pt" | "en" | "es") {
  if (loc === "en") {
    return "I'm NagAI, focused only on Bitcoin, sats, Lightning, self-custody wallets, and related security. Ask me something in that scope — for example: what is a seed phrase, or how Lightning invoices work.";
  }
  if (loc === "es") {
    return "Soy NagAI, enfocada solo en Bitcoin, sats, Lightning, carteras de autocustodia y seguridad relacionada. Pregúntame algo en ese ámbito — por ejemplo: qué es una seed phrase, o cómo funcionan las facturas Lightning.";
  }
  return "Sou a NagAI e falo só de Bitcoin, sats, Lightning, carteiras de autocustódia e segurança relacionada. Pergunte algo nesse escopo — por exemplo: o que é uma seed phrase, ou como funciona uma fatura Lightning.";
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

function genericHelp(loc: "pt" | "en" | "es") {
  if (loc === "en") {
    return "Good question. In short: keep keys offline when you can, verify addresses carefully, prefer self-custody for savings, and use Lightning for small everyday amounts. Ask me specifically about wallets, seed phrases, Lightning invoices, or Bitcoin basics.";
  }
  if (loc === "es") {
    return "Buena pregunta. En resumen: guarda las llaves offline cuando puedas, verifica bien las direcciones, prioriza autocustodia para ahorro y usa Lightning para montos pequeños del día a día. Pregúntame en concreto sobre carteras, seed phrases, facturas Lightning o lo básico de Bitcoin.";
  }
  return "Boa pergunta. Em resumo: guarde chaves offline quando puder, confira bem endereços, prefira autocustódia para reserva e use Lightning para valores pequenos do dia a dia. Pergunte de forma específica sobre carteiras, seed phrase, faturas Lightning ou o básico do Bitcoin.";
}

/** Gera resposta local compatível com o proxy /api/agents (mentor + interact). */
export async function replyNagaiLocal(
  input: NagaiLocalInput,
): Promise<{ resposta_ia: string; fonte: "local" }> {
  const loc = lang(input.locale);
  const msg = (input.mensagem || "").trim();
  if (!msg) {
    return {
      resposta_ia:
        loc === "en"
          ? "Send a Bitcoin question and I’ll help."
          : loc === "es"
            ? "Envía una pregunta sobre Bitcoin y te ayudo."
            : "Manda uma dúvida sobre Bitcoin que eu te ajudo.",
      fonte: "local",
    };
  }

  const wantsPrice = PRICE_RE.test(msg);
  const wantsYear = YEAR_RE.test(msg);
  const inScope = SCOPE_RE.test(msg) || wantsPrice;

  if (!inScope) {
    return { resposta_ia: offTopic(loc), fonte: "local" };
  }

  if (wantsPrice) {
    const prices = await fetchBtcPrices();
    const year = new Date().getFullYear();
    if (prices) {
      const brl = fmtMoney(prices.brl, "BRL", loc);
      const usd = fmtMoney(prices.usd, "USD", loc);
      if (loc === "en") {
        return {
          resposta_ia: wantsYear
            ? `Rough spot price now: about ${brl} (BRL) and ${usd} (USD), via CoinGecko. We are in ${year}. Prices move fast — treat this as a snapshot, not financial advice.`
            : `Rough spot price now: about ${brl} (BRL) and ${usd} (USD), via CoinGecko. Prices move fast — treat this as a snapshot, not financial advice.`,
          fonte: "local",
        };
      }
      if (loc === "es") {
        return {
          resposta_ia: wantsYear
            ? `Cotización aproximada ahora: cerca de ${brl} (BRL) y ${usd} (USD), vía CoinGecko. Estamos en ${year}. El precio se mueve rápido — es una foto del momento, no consejo financiero.`
            : `Cotización aproximada ahora: cerca de ${brl} (BRL) y ${usd} (USD), vía CoinGecko. El precio se mueve rápido — es una foto del momento, no consejo financiero.`,
          fonte: "local",
        };
      }
      return {
        resposta_ia: wantsYear
          ? `Cotação aproximada agora: cerca de ${brl} (BRL) e ${usd} (USD), via CoinGecko. Estamos em ${year}. O preço oscila rápido — isso é um retrato do momento, não conselho financeiro.`
          : `Cotação aproximada agora: cerca de ${brl} (BRL) e ${usd} (USD), via CoinGecko. O preço oscila rápido — isso é um retrato do momento, não conselho financeiro.`,
        fonte: "local",
      };
    }
    return {
      resposta_ia:
        loc === "en"
          ? `I couldn't fetch the live quote right now. We are in ${new Date().getFullYear()}. Try again in a moment, or check the Bitcoin chart on the home page.`
          : loc === "es"
            ? `No pude obtener la cotización en vivo ahora. Estamos en ${new Date().getFullYear()}. Intenta de nuevo en un momento, o mira el gráfico de Bitcoin en la página inicial.`
            : `Não consegui buscar a cotação ao vivo agora. Estamos em ${new Date().getFullYear()}. Tente de novo em instantes, ou veja o gráfico de Bitcoin na página inicial.`,
      fonte: "local",
    };
  }

  const faq = matchFaq(msg, loc);
  if (faq) return { resposta_ia: faq, fonte: "local" };

  return { resposta_ia: genericHelp(loc), fonte: "local" };
}
