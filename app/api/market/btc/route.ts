// GET /api/market/btc?range=24h|8h|4h|1m|5m
// Histórico via Binance (público, sem API key) — candles OHLC + preço atual BRL/USD.
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type BtcRange = "24h" | "8h" | "4h" | "1m" | "5m" | "15m";

type Point = { t: number; price: number };
type Candle = { t: number; o: number; h: number; l: number; c: number };

type Payload = {
  range: BtcRange;
  priceBrl: number;
  priceUsd: number;
  changePct: number;
  series: Point[];
  candles: Candle[];
  updatedAt: string;
};

const RANGES: Record<
  BtcRange,
  { interval: string; limit: number; ttlMs: number }
> = {
  "1m": { interval: "1m", limit: 60, ttlMs: 15_000 },
  "5m": { interval: "5m", limit: 72, ttlMs: 20_000 },
  "15m": { interval: "15m", limit: 64, ttlMs: 30_000 },
  "4h": { interval: "1m", limit: 240, ttlMs: 30_000 },
  "8h": { interval: "5m", limit: 96, ttlMs: 40_000 },
  "24h": { interval: "15m", limit: 96, ttlMs: 45_000 },
};

const cache = new Map<BtcRange, { at: number; payload: Payload }>();

function parseRange(raw: string | null): BtcRange {
  if (
    raw === "1m" ||
    raw === "5m" ||
    raw === "15m" ||
    raw === "4h" ||
    raw === "8h" ||
    raw === "24h"
  ) {
    return raw;
  }
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

    const candles: Candle[] = (klines as any[]).map((k) => ({
      t: Number(k[0]),
      o: Number(k[1]),
      h: Number(k[2]),
      l: Number(k[3]),
      c: Number(k[4]),
    }));

    const series: Point[] = candles.map((c) => ({
      t: c.t,
      price: c.c,
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
      changePct:
        range === "24h" && tickerBrl.priceChangePercent != null
          ? Number(tickerBrl.priceChangePercent)
          : changePct,
      series,
      candles,
      updatedAt: new Date().toISOString(),
    };

    cache.set(range, { at: Date.now(), payload });
    return NextResponse.json({ ...payload, cached: false });
  } catch {
    if (hit) return NextResponse.json({ ...hit.payload, cached: true, stale: true });
    return NextResponse.json({ error: "mercado indisponível agora" }, { status: 502 });
  }
}
