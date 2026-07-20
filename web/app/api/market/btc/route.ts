// GET /api/market/btc?range=24h|8h|4h|1m
// Histórico via Binance (público, sem API key) — candles reais + preço atual BRL/USD.
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

const RANGES: Record<
  BtcRange,
  { interval: string; limit: number; ttlMs: number }
> = {
  "1m": { interval: "1m", limit: 60, ttlMs: 15_000 },
  "4h": { interval: "1m", limit: 240, ttlMs: 30_000 },
  "8h": { interval: "5m", limit: 96, ttlMs: 40_000 },
  "24h": { interval: "15m", limit: 96, ttlMs: 45_000 },
};

const cache = new Map<BtcRange, { at: number; payload: Payload }>();

function parseRange(raw: string | null): BtcRange {
  if (raw === "1m" || raw === "4h" || raw === "8h" || raw === "24h") return raw;
  return "24h";
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`binance ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const range = parseRange(req.nextUrl.searchParams.get("range"));
  const cfg = RANGES[range];
  const hit = cache.get(range);
  if (hit && Date.now() - hit.at < cfg.ttlMs) {
    return NextResponse.json({ ...hit.payload, cached: true });
  }

  try {
    const [klines, tickerBrl, priceUsd] = await Promise.all([
      fetchJson(
        `https://api.binance.com/api/v3/klines?symbol=BTCBRL&interval=${cfg.interval}&limit=${cfg.limit}`,
      ),
      fetchJson("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCBRL"),
      fetchJson("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"),
    ]);

    const series: Point[] = (klines as any[]).map((k) => ({
      t: Number(k[0]),
      price: Number(k[4]), // close
    }));

    if (!series.length) {
      throw new Error("série vazia");
    }

    const priceBrl = Number(tickerBrl.lastPrice ?? series[series.length - 1].price);
    const usd = Number(priceUsd.price ?? 0);
    const first = series[0].price;
    const last = series[series.length - 1].price;
    const changePct = first > 0 ? ((last - first) / first) * 100 : 0;

    const payload: Payload = {
      range,
      priceBrl,
      priceUsd: usd,
      // no range 24h, preferir variação oficial 24h da Binance
      changePct:
        range === "24h" && tickerBrl.priceChangePercent != null
          ? Number(tickerBrl.priceChangePercent)
          : changePct,
      series,
      updatedAt: new Date().toISOString(),
    };

    cache.set(range, { at: Date.now(), payload });
    return NextResponse.json({ ...payload, cached: false });
  } catch {
    if (hit) return NextResponse.json({ ...hit.payload, cached: true, stale: true });
    return NextResponse.json({ error: "mercado indisponível agora" }, { status: 502 });
  }
}
