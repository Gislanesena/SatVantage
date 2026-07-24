// GET /api/market/btc?range=24h|8h|4h|1m
// Histórico via CoinGecko (público, sem API key) — a Binance bloqueia IPs
// dos EUA e a função roda em servidor americano na Vercel, então passou a
// devolver 502 em produção mesmo funcionando localmente (IP do Brasil).
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// HACKATHON: CORS amplo (*) para a extensão (origem chrome-extension://…).
// Depois do hackathon: restringir a chrome-extension://[ids] + domínio oficial.
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export type BtcRange = "24h" | "8h" | "4h" | "1m";

type Point = { t: number; price: number };

type Payload = {
  range: BtcRange;
  priceBrl: number;
  priceUsd: number;
  changePct: number;
  series: Point[];
  updatedAt: string;
};

// CoinGecko devolve granularidade ~5min para days=1 (fixo no plano público),
// então cada faixa recorta essa mesma série pela janela de tempo desejada.
const RANGES: Record<BtcRange, { windowMs: number }> = {
  "1m": { windowMs: 60 * 60 * 1000 },
  "4h": { windowMs: 4 * 60 * 60 * 1000 },
  "8h": { windowMs: 8 * 60 * 60 * 1000 },
  "24h": { windowMs: 24 * 60 * 60 * 1000 },
};

const CACHE_TTL_MS = 60_000;
const POINT_INTERVAL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8_000;

const cache = new Map<BtcRange, { at: number; payload: Payload }>();

function parseRange(raw: string | null): BtcRange {
  if (raw === "1m" || raw === "4h" || raw === "8h" || raw === "24h") return raw;
  return "24h";
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`coingecko ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const range = parseRange(req.nextUrl.searchParams.get("range"));
  const cfg = RANGES[range];
  const hit = cache.get(range);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(
      { ...hit.payload, cached: true },
      { headers: corsHeaders },
    );
  }

  try {
    const [chart, price] = await Promise.all([
      fetchJson(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=1",
      ),
      fetchJson(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl,usd&include_24hr_change=true",
      ),
    ]);

    const rawPrices = (chart?.prices as [number, number][]) ?? [];
    if (!rawPrices.length) {
      throw new Error("série vazia");
    }

    const cutoff = Date.now() - cfg.windowMs;
    let windowed = rawPrices.filter(([t]) => t >= cutoff);
    if (windowed.length < 2) {
      const fallbackCount = Math.max(2, Math.ceil(cfg.windowMs / POINT_INTERVAL_MS));
      windowed = rawPrices.slice(-fallbackCount);
    }

    const series: Point[] = windowed.map(([t, p]) => ({ t, price: p }));

    const bitcoin = price?.bitcoin ?? {};
    const priceBrl = Number(bitcoin.brl ?? series[series.length - 1].price);
    const priceUsd = Number(bitcoin.usd ?? 0);
    const first = series[0].price;
    const last = series[series.length - 1].price;
    const seriesChangePct = first > 0 ? ((last - first) / first) * 100 : 0;

    const payload: Payload = {
      range,
      priceBrl,
      priceUsd,
      // no range 24h, preferir variação oficial 24h do CoinGecko
      changePct:
        range === "24h" && bitcoin.brl_24h_change != null
          ? Number(bitcoin.brl_24h_change)
          : seriesChangePct,
      series,
      updatedAt: new Date().toISOString(),
    };

    cache.set(range, { at: Date.now(), payload });
    return NextResponse.json(
      { ...payload, cached: false },
      { headers: corsHeaders },
    );
  } catch {
    if (hit) {
      return NextResponse.json(
        { ...hit.payload, cached: true, stale: true },
        { headers: corsHeaders },
      );
    }
    return NextResponse.json(
      { error: "mercado indisponível agora" },
      { status: 502, headers: corsHeaders },
    );
  }
}
