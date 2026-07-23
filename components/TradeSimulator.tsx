"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import "./trade-sim.css";

type Side = "compra" | "venda";
type OrderType = "limitada" | "mercado";
type Timeframe = "1m" | "5m" | "15m" | "1h";

type Candle = { o: number; h: number; l: number; c: number; t: number };

type Asset = {
  id: string;
  label: string;
  price: number;
  changePct: number;
};

type TradeSimulatorProps = {
  onExit: () => void;
};

type TourTarget =
  | "mode"
  | "stats"
  | "chart"
  | "timeframe"
  | "ativos"
  | "side"
  | "tipo"
  | "qty"
  | "price"
  | "risk"
  | "order";

const TOUR_TARGETS: TourTarget[] = [
  "mode",
  "stats",
  "chart",
  "timeframe",
  "ativos",
  "side",
  "tipo",
  "qty",
  "price",
  "risk",
  "order",
];

const INITIAL_CASH = 10_000;
const MAX_CANDLES = 48;

function localeTag(locale: Locale) {
  return locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
}

function fmtBrl(n: number, locale: Locale, digits = 2) {
  return n.toLocaleString(localeTag(locale), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtClock(d: Date, locale: Locale) {
  return d.toLocaleTimeString(localeTag(locale), { hour12: false });
}

function fill(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    template,
  );
}

function seedCandles(base: number, count = MAX_CANDLES): Candle[] {
  const out: Candle[] = [];
  let price = base;
  const now = Date.now();
  for (let i = count; i > 0; i--) {
    const drift = (Math.random() - 0.48) * base * 0.004;
    const o = price;
    const c = Math.max(1000, o + drift);
    const h = Math.max(o, c) * (1 + Math.random() * 0.0018);
    const l = Math.min(o, c) * (1 - Math.random() * 0.0018);
    out.push({ o, h, l, c, t: now - i * 60_000 });
    price = c;
  }
  return out;
}

function nextCandle(prev: Candle, volatility = 0.0022): Candle {
  const drift = (Math.random() - 0.49) * prev.c * volatility;
  const o = prev.c;
  const c = Math.max(1000, o + drift);
  const h = Math.max(o, c) * (1 + Math.random() * 0.0012);
  const l = Math.min(o, c) * (1 - Math.random() * 0.0012);
  return { o, h, l, c, t: Date.now() };
}

export default function TradeSimulator({ onExit }: TradeSimulatorProps) {
  const { t, locale } = useI18n();
  const ts = t.tsim;

  const [cash, setCash] = useState(INITIAL_CASH);
  const [btc, setBtc] = useState(0);
  const [side, setSide] = useState<Side>("compra");
  const [orderType, setOrderType] = useState<OrderType>("mercado");
  const [qty, setQty] = useState("0.01");
  const [limitPrice, setLimitPrice] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("5m");
  const [candles, setCandles] = useState<Candle[]>(() => seedCandles(350_000));
  const [clock, setClock] = useState(() => new Date());
  const [flash, setFlash] = useState<string | null>(null);
  const [activeAsset, setActiveAsset] = useState("BTC/BRL");
  const [assetQuery, setAssetQuery] = useState("");
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [spot, setSpot] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<SVGSVGElement | null>(null);

  const last = candles[candles.length - 1]?.c ?? 350_000;
  const openDay = candles[0]?.o ?? last;
  const changePct = openDay ? ((last - openDay) / openDay) * 100 : 0;
  const equity = cash + btc * last;
  const pnl = equity - INITIAL_CASH;
  const tourTarget = TOUR_TARGETS[tourIndex];
  const step = tourTarget ? ts.tour[tourTarget] : null;

  const assets: Asset[] = useMemo(
    () => [
      { id: "BTC/BRL", label: "BTC/BRL", price: last, changePct },
      {
        id: "BTC/USD",
        label: "BTC/USD",
        price: last / 5.4,
        changePct: changePct * 0.92,
      },
      {
        id: "sats/BRL",
        label: "sats/BRL",
        price: last / 100_000_000,
        changePct: changePct,
      },
      {
        id: "ETH/BRL",
        label: "ETH/BRL",
        price: last * 0.048,
        changePct: changePct * 1.1,
      },
      {
        id: "USDT/BRL",
        label: "USDT/BRL",
        price: 5.42 + Math.sin(clock.getSeconds()) * 0.01,
        changePct: 0.12,
      },
    ],
    [last, changePct, clock],
  );

  const measureSpot = useCallback(() => {
    if (!tourOpen || !tourTarget) {
      setSpot(null);
      return;
    }
    const el = rootRef.current?.querySelector(
      `[data-tour-target="${tourTarget}"]`,
    ) as HTMLElement | null;
    if (!el) {
      setSpot(null);
      return;
    }
    el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    const r = el.getBoundingClientRect();
    const pad = 8;
    setSpot({
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [tourOpen, tourTarget]);

  useEffect(() => {
    setFlash(null);
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/market/btc?range=4h");
        if (!res.ok) return;
        const data = await res.json();
        const series: { t: number; price: number }[] = data.series ?? [];
        const priceBrl = typeof data.priceBrl === "number" ? data.priceBrl : null;
        if (cancelled) return;
        if (series.length >= 8) {
          const stepN = Math.max(1, Math.floor(series.length / MAX_CANDLES));
          const built: Candle[] = [];
          for (let i = 0; i < series.length; i += stepN) {
            const chunk = series.slice(i, i + stepN);
            if (!chunk.length) continue;
            const o = chunk[0].price;
            const c = chunk[chunk.length - 1].price;
            const h = Math.max(...chunk.map((p) => p.price));
            const l = Math.min(...chunk.map((p) => p.price));
            built.push({ o, h, l, c, t: chunk[0].t });
          }
          if (built.length) {
            setCandles(built.slice(-MAX_CANDLES));
            setLimitPrice(String(Math.round(built[built.length - 1].c)));
            return;
          }
        }
        if (priceBrl) {
          const seeded = seedCandles(priceBrl);
          setCandles(seeded);
          setLimitPrice(String(Math.round(priceBrl)));
        }
      } catch {
        /* keep seeded candles */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const ms =
      timeframe === "1m" ? 2200 : timeframe === "5m" ? 3200 : timeframe === "15m" ? 4500 : 6000;
    const id = window.setInterval(() => {
      setCandles((prev) => {
        const next = nextCandle(
          prev[prev.length - 1] ?? { o: last, h: last, l: last, c: last, t: Date.now() },
        );
        return [...prev.slice(-(MAX_CANDLES - 1)), next];
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [timeframe, last]);

  useEffect(() => {
    if (!tourOpen) return;
    const tmr = window.setTimeout(measureSpot, 50);
    window.addEventListener("resize", measureSpot);
    window.addEventListener("scroll", measureSpot, true);
    return () => {
      window.clearTimeout(tmr);
      window.removeEventListener("resize", measureSpot);
      window.removeEventListener("scroll", measureSpot, true);
    };
  }, [tourOpen, tourIndex, measureSpot]);

  useEffect(() => {
    if (!tourOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTourOpen(false);
        setTourIndex(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourOpen]);

  const clearTicket = useCallback(() => {
    setQty("0.01");
    setLimitPrice(String(Math.round(last)));
    setTakeProfit("");
    setStopLoss("");
    setOrderType("mercado");
  }, [last]);

  const resetAll = useCallback(() => {
    setCash(INITIAL_CASH);
    setBtc(0);
    setFlash(ts.flashReset);
    clearTicket();
  }, [clearTicket, ts.flashReset]);

  function startTour() {
    setTourIndex(0);
    setTourOpen(true);
  }

  function skipTour() {
    setTourOpen(false);
    setTourIndex(0);
    setSpot(null);
  }

  function nextTour() {
    if (tourIndex >= TOUR_TARGETS.length - 1) {
      skipTour();
      setFlash(ts.flashTourDone);
      return;
    }
    setTourIndex((i) => i + 1);
  }

  function execute() {
    const quantity = Number(String(qty).replace(",", "."));
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFlash(ts.flashBadQty);
      return;
    }
    const price =
      orderType === "mercado"
        ? last
        : Number(String(limitPrice).replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) {
      setFlash(ts.flashBadPrice);
      return;
    }

    const notional = quantity * price;
    if (side === "compra") {
      if (notional > cash + 0.01) {
        setFlash(ts.flashNoCash);
        return;
      }
      const cashAfter = cash - notional;
      const btcAfter = btc + quantity;
      setCash(cashAfter);
      setBtc(btcAfter);
      setFlash(
        fill(ts.flashBuy, {
          qty: quantity,
          price: fmtBrl(price, locale),
          notional: fmtBrl(notional, locale),
          cashAfter: fmtBrl(cashAfter, locale),
          btcAfter: btcAfter.toFixed(6),
        }),
      );
    } else {
      if (quantity > btc + 1e-12) {
        setFlash(ts.flashNoBtc);
        return;
      }
      const cashAfter = cash + notional;
      const btcAfter = btc - quantity;
      setBtc(btcAfter);
      setCash(cashAfter);
      setFlash(
        fill(ts.flashSell, {
          qty: quantity,
          price: fmtBrl(price, locale),
          notional: fmtBrl(notional, locale),
          cashAfter: fmtBrl(cashAfter, locale),
          btcAfter: btcAfter.toFixed(6),
        }),
      );
    }
  }

  const chart = useMemo(() => {
    const w = 640;
    const h = 280;
    const pad = { t: 16, r: 56, b: 24, l: 12 };
    const innerW = w - pad.l - pad.r;
    const innerH = h - pad.t - pad.b;
    const highs = candles.map((c) => c.h);
    const lows = candles.map((c) => c.l);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const span = Math.max(max - min, 1);
    const y = (v: number) => pad.t + ((max - v) / span) * innerH;
    const gap = innerW / Math.max(candles.length, 1);
    const bodyW = Math.max(3, gap * 0.55);

    const nodes = candles.map((c, i) => {
      const x = pad.l + i * gap + gap / 2;
      const bull = c.c >= c.o;
      const yO = y(c.o);
      const yC = y(c.c);
      const top = Math.min(yO, yC);
      const bodyH = Math.max(2, Math.abs(yC - yO));
      return (
        <g key={c.t + "-" + i}>
          <line
            x1={x}
            x2={x}
            y1={y(c.h)}
            y2={y(c.l)}
            stroke={bull ? "#38bdf8" : "#fb923c"}
            strokeWidth={1.2}
          />
          <rect
            x={x - bodyW / 2}
            y={top}
            width={bodyW}
            height={bodyH}
            rx={1}
            fill={bull ? "#0ea5e9" : "#f97316"}
          />
        </g>
      );
    });

    const priceY = y(last);
    return { w, h, nodes, priceY, pad, lastLabel: fmtBrl(last, locale, 0) };
  }, [candles, last, locale]);

  const tipStyle = useMemo(() => {
    if (!spot) return { top: "30%", left: "50%", transform: "translate(-50%, 0)" } as const;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const tipW = Math.min(320, vw - 24);
    let left = spot.left + spot.width / 2 - tipW / 2;
    left = Math.max(12, Math.min(left, vw - tipW - 12));
    const below = spot.top + spot.height + 14;
    const above = spot.top - 14;
    const placeBelow = below + 200 < vh || spot.top < 160;
    return {
      top: placeBelow ? below : undefined,
      bottom: placeBelow ? undefined : vh - above,
      left,
      width: tipW,
    } as const;
  }, [spot]);

  return (
    <div
      ref={rootRef}
      className={`sv-tsim${tourOpen ? " is-touring" : ""}`}
      role="region"
      aria-label={ts.regionLabel}
    >
      <header className="sv-tsim-top">
        <div className="sv-tsim-mode" data-tour-target="mode">
          <span className="sv-tsim-mode-off">{ts.realAccount}</span>
          <span className="sv-tsim-toggle" aria-hidden />
          <span className="sv-tsim-mode-on">{ts.simulator}</span>
        </div>

        <div className="sv-tsim-clock" aria-live="polite">
          {fmtClock(clock, locale)}
        </div>

        <div className="sv-tsim-stats-wrap">
          <div className="sv-tsim-stats" data-tour-target="stats">
            <div className="sv-tsim-stat" tabIndex={0} title={ts.equityTip}>
              <span className="sv-tsim-stat-label">
                {ts.equity}
                <span className="sv-tsim-tip-mark" aria-hidden>
                  ?
                </span>
              </span>
              <strong>R$ {fmtBrl(equity, locale)}</strong>
              <span className="sv-tsim-stat-tip" role="tooltip">
                {ts.equityTip}
              </span>
            </div>
            <div className="sv-tsim-stat" tabIndex={0} title={ts.grossResultTip}>
              <span className="sv-tsim-stat-label">
                {ts.grossResult}
                <span className="sv-tsim-tip-mark" aria-hidden>
                  ?
                </span>
              </span>
              <strong className={pnl >= 0 ? "sv-tsim-pos" : "sv-tsim-neg"}>
                {pnl >= 0 ? "+" : ""}
                {fmtBrl(pnl, locale)}
              </strong>
              <span className="sv-tsim-stat-tip" role="tooltip">
                {ts.grossResultTip}
              </span>
            </div>
            <div className="sv-tsim-stat" tabIndex={0} title={ts.cashTip}>
              <span className="sv-tsim-stat-label">
                {ts.cash}
                <span className="sv-tsim-tip-mark" aria-hidden>
                  ?
                </span>
              </span>
              <strong>R$ {fmtBrl(cash, locale)}</strong>
              <span className="sv-tsim-stat-tip" role="tooltip">
                {ts.cashTip}
              </span>
            </div>
            <div className="sv-tsim-stat" tabIndex={0} title={ts.btcTip}>
              <span className="sv-tsim-stat-label">
                {ts.btcLabel}
                <span className="sv-tsim-tip-mark" aria-hidden>
                  ?
                </span>
              </span>
              <strong>{btc.toFixed(6)}</strong>
              <span className="sv-tsim-stat-tip" role="tooltip">
                {ts.btcTip}
              </span>
            </div>
          </div>
          <p className="sv-tsim-stats-hint">{ts.statsHoverHint}</p>
        </div>

        <div className="sv-tsim-top-actions">
          <button type="button" className="sv-tsim-btn sv-tsim-btn--ghost" onClick={resetAll}>
            {ts.resetAll}
          </button>
          <button type="button" className="sv-tsim-btn" onClick={onExit}>
            {ts.backToChat}
          </button>
        </div>
      </header>

      {!tourOpen ? (
        <div className="sv-tsim-tour-cta" role="status">
          <p>{ts.tourCta}</p>
          <button type="button" className="sv-tsim-btn sv-tsim-btn--tour" onClick={startTour}>
            {ts.requestTour}
          </button>
        </div>
      ) : null}

      {flash ? (
        <p
          className={`sv-tsim-flash${
            flash === ts.flashNoCash ||
            flash === ts.flashNoBtc ||
            flash === ts.flashBadQty ||
            flash === ts.flashBadPrice
              ? " sv-tsim-flash--warn"
              : " sv-tsim-flash--ok"
          }`}
          role="status"
        >
          {flash}
          <button type="button" onClick={() => setFlash(null)} aria-label={ts.closeFlash}>
            ×
          </button>
        </p>
      ) : null}

      <div className="sv-tsim-grid">
        <section className="sv-tsim-chart-wrap" data-tour-target="chart">
          <div className="sv-tsim-chart-head">
            <div className="sv-tsim-tabs" role="tablist">
              {["BTC/BRL", "BTC/USD", "sats/BRL"].map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeAsset === id}
                  className={activeAsset === id ? "is-active" : undefined}
                  onClick={() => setActiveAsset(id)}
                >
                  {id}
                </button>
              ))}
            </div>
            <div className="sv-tsim-tf" data-tour-target="timeframe">
              <label>
                {ts.time}
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                >
                  <option value="1m">{ts.tf1m}</option>
                  <option value="5m">{ts.tf5m}</option>
                  <option value="15m">{ts.tf15m}</option>
                  <option value="1h">{ts.tf1h}</option>
                </select>
              </label>
              <span className={`sv-tsim-chg${changePct >= 0 ? " is-up" : " is-down"}`}>
                {changePct >= 0 ? "+" : ""}
                {changePct.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="sv-tsim-chart">
            <svg
              ref={chartRef}
              viewBox={`0 0 ${chart.w} ${chart.h}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={fill(ts.chartAria, { asset: activeAsset })}
            >
              <defs>
                <linearGradient id="svTsimBg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#121826" />
                  <stop offset="100%" stopColor="#0b1020" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width={chart.w} height={chart.h} fill="url(#svTsimBg)" />
              {[0.25, 0.5, 0.75].map((p) => (
                <line
                  key={p}
                  x1={chart.pad.l}
                  x2={chart.w - chart.pad.r}
                  y1={chart.h * p}
                  y2={chart.h * p}
                  stroke="rgba(148,163,184,0.12)"
                />
              ))}
              {chart.nodes}
              <line
                x1={chart.pad.l}
                x2={chart.w - chart.pad.r}
                y1={chart.priceY}
                y2={chart.priceY}
                stroke="#38bdf8"
                strokeDasharray="4 4"
                strokeWidth={1.2}
              />
              <rect
                x={chart.w - chart.pad.r + 4}
                y={chart.priceY - 10}
                width={48}
                height={18}
                rx={3}
                fill="#0284c7"
              />
              <text
                x={chart.w - chart.pad.r + 28}
                y={chart.priceY + 3}
                textAnchor="middle"
                fill="#fff"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
              >
                {chart.lastLabel}
              </text>
            </svg>
          </div>
        </section>

        <aside className="sv-tsim-boleta" aria-label={ts.orderTicketAria}>
          <div className="sv-tsim-boleta-head">
            <strong>{ts.orderTicket}</strong>
            <span className="sv-tsim-badge">{ts.simulator}</span>
          </div>
          <p className="sv-tsim-req-legend">{ts.requiredLegend}</p>

          <label className="sv-tsim-field">
            <span>
              {ts.asset}
              <span className="sv-tsim-req" aria-hidden>
                {ts.requiredMark}
              </span>
            </span>
            <select value={activeAsset} onChange={(e) => setActiveAsset(e.target.value)}>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>

          <div className="sv-tsim-side-block" data-tour-target="side">
            <span className="sv-tsim-field-caption">
              {ts.buy} / {ts.sell}
              <span className="sv-tsim-req" aria-hidden>
                {ts.requiredMark}
              </span>
            </span>
            <div className="sv-tsim-side-tabs">
              <button
                type="button"
                className={side === "compra" ? "is-active is-buy" : undefined}
                onClick={() => setSide("compra")}
              >
                {ts.buy}
              </button>
              <button
                type="button"
                className={side === "venda" ? "is-active is-sell" : undefined}
                onClick={() => setSide("venda")}
              >
                {ts.sell}
              </button>
            </div>
          </div>

          <div className="sv-tsim-row2" data-tour-target="tipo">
            <label className="sv-tsim-field">
              <span>
                {ts.type}
                <span className="sv-tsim-req" aria-hidden>
                  {ts.requiredMark}
                </span>
              </span>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
              >
                <option value="mercado">{ts.market}</option>
                <option value="limitada">{ts.limit}</option>
              </select>
            </label>
            <label className="sv-tsim-field">
              <span>
                {ts.validity}{" "}
                <em className="sv-tsim-optional">({ts.optionalNote})</em>
              </span>
              <select defaultValue="hoje">
                <option value="hoje">{ts.today}</option>
                <option value="gte">{ts.gtc}</option>
              </select>
            </label>
          </div>

          <label className="sv-tsim-field" data-tour-target="qty">
            <span>
              {ts.qtyBtc}
              <span className="sv-tsim-req" aria-hidden>
                {ts.requiredMark}
              </span>
            </span>
            <input
              inputMode="decimal"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
              aria-required="true"
            />
          </label>

          <label className="sv-tsim-field" data-tour-target="price">
            <span>
              {ts.priceBrl}
              <span className="sv-tsim-req" aria-hidden>
                {ts.requiredMark}
              </span>
            </span>
            <input
              inputMode="decimal"
              value={orderType === "mercado" ? fmtBrl(last, locale) : limitPrice}
              disabled={orderType === "mercado"}
              onChange={(e) => setLimitPrice(e.target.value)}
              required={orderType === "limitada"}
              aria-required={orderType === "limitada"}
            />
          </label>

          <div className="sv-tsim-row2" data-tour-target="risk">
            <label className="sv-tsim-field">
              <span>
                {ts.takeProfit}{" "}
                <em className="sv-tsim-optional">({ts.optionalNote})</em>
              </span>
              <input
                inputMode="decimal"
                placeholder={ts.takeProfitPh}
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
              />
            </label>
            <label className="sv-tsim-field">
              <span>
                {ts.stopLoss}{" "}
                <em className="sv-tsim-optional">({ts.optionalNote})</em>
              </span>
              <input
                inputMode="decimal"
                placeholder={ts.stopLossPh}
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
            </label>
          </div>

          <div className="sv-tsim-boleta-actions" data-tour-target="order">
            <button type="button" className="sv-tsim-btn sv-tsim-btn--ghost" onClick={clearTicket}>
              {ts.clear}
            </button>
            <button
              type="button"
              className={`sv-tsim-btn sv-tsim-btn--order${side === "venda" ? " is-sell" : ""}`}
              onClick={execute}
            >
              {side === "compra" ? ts.buyAction : ts.sellAction}
            </button>
          </div>
        </aside>

        <aside className="sv-tsim-ativos" aria-label={ts.assetsAria} data-tour-target="ativos">
          <label className="sv-tsim-search">
            <span className="sv-sr-only">{ts.assetCodePh}</span>
            <input
              placeholder={ts.assetCodePh}
              value={assetQuery}
              onChange={(e) => setAssetQuery(e.target.value)}
            />
          </label>
          <h3>{ts.featuredAssets}</h3>
          <ul>
            {assets
              .filter((a) => a.label.toLowerCase().includes(assetQuery.trim().toLowerCase()))
              .map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className={activeAsset === a.id ? "is-active" : undefined}
                    onClick={() => setActiveAsset(a.id)}
                  >
                    <span className="sv-tsim-asset-code">{a.label}</span>
                    <span className="sv-tsim-asset-px">
                      {a.id.includes("sats")
                        ? a.price.toFixed(6)
                        : fmtBrl(a.price, locale, a.id === "USDT/BRL" ? 2 : 0)}
                    </span>
                    <span className={a.changePct >= 0 ? "sv-tsim-pos" : "sv-tsim-neg"}>
                      {a.changePct >= 0 ? "+" : ""}
                      {a.changePct.toFixed(2)}%
                    </span>
                  </button>
                </li>
              ))}
          </ul>
          <p className="sv-tsim-hint">
            {fill(ts.hint, { cash: fmtBrl(INITIAL_CASH, locale) })}
          </p>
        </aside>
      </div>

      {tourOpen && step ? (
        <div className="sv-tsim-tour" role="dialog" aria-modal="true" aria-labelledby="sv-tsim-tour-title">
          {!spot ? <div className="sv-tsim-tour-backdrop" aria-hidden /> : null}
          {spot ? (
            <div
              className="sv-tsim-tour-spot"
              style={{
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
              }}
            />
          ) : null}
          <div className="sv-tsim-tour-catcher" aria-hidden />
          <div className="sv-tsim-tour-tip" style={tipStyle}>
            <p className="sv-tsim-tour-step">
              {fill(ts.stepOf, {
                current: tourIndex + 1,
                total: TOUR_TARGETS.length,
              })}
            </p>
            <h3 id="sv-tsim-tour-title">{step.title}</h3>
            <p>{step.body}</p>
            <div className="sv-tsim-tour-actions">
              <button type="button" className="sv-tsim-tour-skip" onClick={skipTour}>
                {ts.skipTour}
              </button>
              <button type="button" className="sv-tsim-tour-next" onClick={nextTour}>
                {tourIndex >= TOUR_TARGETS.length - 1 ? ts.finish : ts.next}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
