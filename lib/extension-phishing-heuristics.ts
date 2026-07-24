// lib/extension-phishing-heuristics.ts
// Verificação local de URL/domínio (sem API externa).
// Combina: hosts oficiais, marcas conhecidas, typosquatting e padrões clássicos de phishing.

import { isSatVantageOfficialUrl } from "@/lib/extension-satvantage-site";

export type RiscoNivel = "baixo" | "medio" | "alto";

export type HeuristicaDominio = {
  risco: RiscoNivel;
  /** Motivos curtos para o usuário (PT). */
  sinais: string[];
  host: string | null;
};

/** Marcas legítimas e hosts oficiais associados (crypto / Bitcoin). */
const BRAND_HOSTS: Record<string, string[]> = {
  binance: ["binance.com", "binance.us", "binance.com.br"],
  coinbase: ["coinbase.com", "coinbase.com.br"],
  kraken: ["kraken.com"],
  blockchain: ["blockchain.com", "blockchain.info"],
  electrum: ["electrum.org"],
  alby: ["getalby.com", "alby.com"],
  mutiny: ["mutinywallet.com"],
  foxbit: ["foxbit.com.br", "foxbit.com"],
  mercadobitcoin: ["mercadobitcoin.com.br", "mercadobitcoin.com"],
  bitcoinde: ["bitcoin.de"],
  bitstamp: ["bitstamp.net"],
  bitfinex: ["bitfinex.com"],
  okx: ["okx.com"],
  bybit: ["bybit.com"],
  bitget: ["bitget.com"],
  river: ["river.com"],
  strike: ["strike.me"],
  walletsof: ["walletscrutiny.com"],
  mempool: ["mempool.space"],
  blockstream: ["blockstream.com", "blockstream.info"],
  lightning: ["lightning.network"],
  satvantage: [
    "sat-vantage-gislanesena.vercel.app",
    "sat-vantage-iau60jdhv-gislanesena.vercel.app",
    "localhost",
    "127.0.0.1",
  ],
};

const SUSPICIOUS_TLDS = new Set([
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "top",
  "click",
  "loan",
  "work",
  "zip",
  "mov",
  "country",
  "kim",
  "rest",
  "surf",
  "cfd",
  "xyz",
]);

const PHISH_HOST_PATTERNS: RegExp[] = [
  /secure[-.]?login/i,
  /verify[-.]?wallet/i,
  /wallet[-.]?connect[-.]?secure/i,
  /claim[-.]?airdrop/i,
  /free[-.]?btc/i,
  /support[-.]?(desk|help|ticket)/i,
  /restore[-.]?(seed|wallet|account)/i,
  /validate[-.]?(wallet|account|seed)/i,
  /auth[-.]?binance/i,
  /coinbase[-.]?(auth|secure|login)/i,
  /^www-/i, // www-binance.com
];

const RANK: Record<RiscoNivel, number> = { baixo: 0, medio: 1, alto: 2 };

export function maxRisco(a: RiscoNivel, b: RiscoNivel): RiscoNivel {
  return RANK[a] >= RANK[b] ? a : b;
}

function normalizeHost(host: string): string {
  return host
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^www\./, "");
}

function parseUrl(raw?: string | null): URL | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

/** Distância de Levenshtein (limitada) para typosquatting. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = cur;
    }
  }
  return row[b.length];
}

function registrableHint(host: string): string {
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  // br / co.uk simplificado
  if (parts.at(-1) === "br" && parts.length >= 3) {
    return parts.slice(-3).join(".");
  }
  return parts.slice(-2).join(".");
}

function labelWithoutTld(host: string): string {
  const reg = registrableHint(host);
  return reg.split(".")[0] || host;
}

function isIpHost(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

function brandMatchInHost(host: string): {
  brand: string;
  official: boolean;
  asSubdomainOnly: boolean;
} | null {
  const h = normalizeHost(host);
  for (const [brand, hosts] of Object.entries(BRAND_HOSTS)) {
    if (hosts.some((oh) => h === oh || h.endsWith(`.${oh}`))) {
      return { brand, official: true, asSubdomainOnly: false };
    }
    // marca no hostname mas fora da lista oficial
    if (h.includes(brand)) {
      const onlySub =
        h.startsWith(`${brand}.`) ||
        h.includes(`.${brand}.`) ||
        h.includes(`-${brand}.`) ||
        h.includes(`.${brand}-`) ||
        h.includes(`${brand}-`);
      return { brand, official: false, asSubdomainOnly: onlySub };
    }
  }
  return null;
}

function typosquatAgainstBrands(host: string): string | null {
  const label = labelWithoutTld(normalizeHost(host)).replace(/[^a-z0-9]/g, "");
  if (label.length < 4) return null;
  for (const brand of Object.keys(BRAND_HOSTS)) {
    if (label === brand) continue;
    const d = levenshtein(label, brand);
    // 1–2 letras trocadas / inseridas em marcas curtas/médias
    if (d > 0 && d <= 2 && Math.abs(label.length - brand.length) <= 2) {
      return brand;
    }
  }
  return null;
}

/**
 * Avalia a URL da aba com heurística local.
 * Site oficial SatVantage → sempre baixo (sem sinais).
 */
export function avaliarDominio(paginaUrl?: string | null): HeuristicaDominio {
  if (isSatVantageOfficialUrl(paginaUrl)) {
    return { risco: "baixo", sinais: [], host: null };
  }

  const u = parseUrl(paginaUrl);
  if (!u) {
    return { risco: "baixo", sinais: [], host: null };
  }

  const host = normalizeHost(u.hostname);
  const sinais: string[] = [];
  let risco: RiscoNivel = "baixo";

  const bump = (n: RiscoNivel, msg: string) => {
    risco = maxRisco(risco, n);
    if (!sinais.includes(msg)) sinais.push(msg);
  };

  // user:pass@host — clássico
  if (u.username || u.password || paginaUrl!.includes("@")) {
    bump("alto", "URL com @ ou credenciais embutidas (padrão clássico de phishing).");
  }

  if (isIpHost(host)) {
    bump("alto", "Site servido por endereço IP em vez de domínio — comum em páginas falsas.");
  }

  if (host.includes("xn--")) {
    bump("alto", "Domínio internacionalizado (punycode) — pode imitar marcas com letras parecidas.");
  }

  const tld = host.split(".").pop() || "";
  if (SUSPICIOUS_TLDS.has(tld)) {
    bump("medio", `TLD “.${tld}” é frequentemente abusado em campanhas de phishing.`);
  }

  const labels = host.split(".");
  if (labels.length >= 5) {
    bump("medio", "Muitos subdomínios encadeados — dificulta ver quem controla o site.");
  }

  const hyphenCount = (labelWithoutTld(host).match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    bump("medio", "Nome de domínio com muitos hífens — típico de páginas clonadas.");
  }

  for (const re of PHISH_HOST_PATTERNS) {
    if (re.test(host)) {
      bump("alto", "Nome de domínio com padrão de site falso (login/secure/wallet/claim).");
      break;
    }
  }

  const pathq = `${u.pathname}${u.search}`.toLowerCase();
  if (
    /seed|mnemonic|private[_\s-]?key|nsec1|recover[_\s-]?wallet|airdrop|double[_\s-]?btc/.test(
      pathq,
    )
  ) {
    bump("alto", "Caminho da URL sugere recuperação de carteira, seed ou airdrop — alto risco.");
  }

  const brandHit = brandMatchInHost(host);
  if (brandHit && !brandHit.official) {
    bump(
      "alto",
      `Nome “${brandHit.brand}” aparece no domínio, mas o host não é o oficial conhecido — possível clonagem.`,
    );
  }

  const typo = typosquatAgainstBrands(host);
  if (typo) {
    bump(
      "alto",
      `Domínio parece typosquat de “${typo}” (letras trocadas ou parecidas).`,
    );
  }

  // http em página que não é localhost
  if (u.protocol === "http:" && host !== "localhost" && host !== "127.0.0.1") {
    bump("medio", "Página em HTTP (sem cadeado) — dados podem ser interceptados.");
  }

  return { risco, sinais, host };
}

/**
 * Combina risco de conteúdo (texto) com heurística de domínio.
 * Domínio “alto” sempre vence.
 */
export function combinarRiscos(
  riscoTexto: RiscoNivel,
  dominio: HeuristicaDominio,
): { risco: RiscoNivel; sinaisDominio: string[] } {
  return {
    risco: maxRisco(riscoTexto, dominio.risco),
    sinaisDominio: dominio.sinais,
  };
}

/** Prefixa a explicação com os sinais de domínio (se houver). */
export function anexarSinaisDominio(
  explicacao: string,
  sinais: string[],
): string {
  if (!sinais.length) return explicacao;
  const bloco =
    "Sinais no domínio/URL: " + sinais.slice(0, 4).join(" ") + " ";
  return bloco + explicacao;
}
