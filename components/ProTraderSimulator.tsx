"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  evaluateExits,
  loadSimState,
  portfolioBrl,
  resetSimState,
  resultadoBruto,
  saveSimState,
  type OpenPosition,
  type SimState,
} from "@/lib/simulator";
import {
  PRO_TOUR_BODY_CLASS,
  PRO_TOUR_STEPS,
  PRO_TOUR_STORAGE_KEY,
  computeTourLayout,
  ensureTourPortalRoot,
  scrollTourTargetIntoView,
  tourLayoutsClose,
  type TourLayout,
} from "@/lib/pro-trader-tour";
import "./pro-trader.css";

type Candle = { t: number; o: number; h: number; l: number; c: number };
type Interval = "1m" | "5m" | "15m";
type AccountMode = "real" | "sim";
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit";

type Props = {
  onBack: () => void;
  onGoDashboard?: () => void;
  disabled?: boolean;
};

const INTERVAL_TO_RANGE: Record<Interval, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
};

function fmtBrl(n: number, digits = 2) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function fmtClock(d: Date) {
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function parseNum(raw: string): number | null {
  const n = Number(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function CandleChart({
  candles,
  levels,
}: {
  candles: Candle[];
  levels?: { takeProfit?: number | null; stopLoss?: number | null; entry?: number | null };
}) {
  const W = 720;
  const H = 320;
  const pad = { top: 16, right: 56, bottom: 28, left: 12 };

  const geo = useMemo(() => {
    if (candles.length < 2) return null;
    const highs = candles.map((c) => c.h);
    const lows = candles.map((c) => c.l);
    let min = Math.min(...lows);
    let max = Math.max(...highs);
    for (const v of [levels?.takeProfit, levels?.stopLoss, levels?.entry]) {
      if (v != null && v > 0) {
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
    }
    const span = max - min || 1;
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;
    const slot = innerW / candles.length;
    const bodyW = Math.max(2, slot * 0.55);

    const y = (price: number) =>
      pad.top + innerH - ((price - min) / span) * innerH;

    const items = candles.map((c, i) => {
      const x = pad.left + i * slot + slot / 2;
      const up = c.c >= c.o;
      return {
        ...c,
        x,
        up,
        yH: y(c.h),
        yL: y(c.l),
        bodyTop: y(Math.max(c.o, c.c)),
        bodyH: Math.max(1, Math.abs(y(c.o) - y(c.c))),
        yC: y(c.c),
      };
    });

    const last = items[items.length - 1];
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => {
      const price = min + span * (1 - p);
      return { y: pad.top + innerH * p, price };
    });

    const levelLines = [
      { key: "tp", price: levels?.takeProfit, cls: "sv-pro-level is-tp" },
      { key: "sl", price: levels?.stopLoss, cls: "sv-pro-level is-sl" },
      { key: "entry", price: levels?.entry, cls: "sv-pro-level is-entry" },
    ]
      .filter((l) => l.price != null && l.price > 0)
      .map((l) => ({ ...l, y: y(l.price as number), price: l.price as number }));

    return { items, bodyW, last, ticks, levelLines };
  }, [candles, levels]);

  if (!geo) {
    return <div className="sv-pro-chart-empty">Carregando candles…</div>;
  }

  return (
    <svg
      className="sv-pro-chart-svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Gráfico BTC/BRL"
    >
      {geo.ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            x2={W - pad.right}
            y1={t.y}
            y2={t.y}
            className="sv-pro-grid"
          />
          <text x={W - pad.right + 6} y={t.y + 4} className="sv-pro-axis">
            {t.price >= 1000 ? t.price.toFixed(0) : t.price.toFixed(2)}
          </text>
        </g>
      ))}

      {geo.levelLines.map((l) => (
        <g key={l.key}>
          <line
            x1={pad.left}
            x2={W - pad.right}
            y1={l.y}
            y2={l.y}
            className={l.cls}
          />
          <text x={pad.left + 4} y={l.y - 4} className={`sv-pro-level-label ${l.key}`}>
            {l.key === "tp" ? "Gain" : l.key === "sl" ? "Stop" : "Entrada"}{" "}
            {l.price.toFixed(0)}
          </text>
        </g>
      ))}

      {geo.items.map((c) => (
        <g key={c.t}>
          <line
            x1={c.x}
            x2={c.x}
            y1={c.yH}
            y2={c.yL}
            className={c.up ? "sv-pro-wick is-up" : "sv-pro-wick is-down"}
          />
          <rect
            x={c.x - geo.bodyW / 2}
            y={c.bodyTop}
            width={geo.bodyW}
            height={c.bodyH}
            className={c.up ? "sv-pro-candle is-up" : "sv-pro-candle is-down"}
          />
        </g>
      ))}

      <line
        x1={pad.left}
        x2={W - pad.right}
        y1={geo.last.yC}
        y2={geo.last.yC}
        className="sv-pro-last-line"
      />
      <rect
        x={W - pad.right + 2}
        y={geo.last.yC - 9}
        width={52}
        height={18}
        rx={3}
        className="sv-pro-last-tag"
      />
      <text x={W - pad.right + 6} y={geo.last.yC + 4} className="sv-pro-last-text">
        {geo.last.c.toFixed(0)}
      </text>
    </svg>
  );
}

export default function ProTraderSimulator({
  onBack,
  onGoDashboard,
  disabled = false,
}: Props) {
  const [mode, setMode] = useState<AccountMode>("sim");
  const [now, setNow] = useState(() => new Date());
  const [interval, setIntervalKey] = useState<Interval>("5m");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [priceBrl, setPriceBrl] = useState<number | null>(null);
  const [changePct, setChangePct] = useState(0);
  const [state, setState] = useState<SimState>(() =>
    typeof window === "undefined"
      ? {
          cashBrl: 10_000,
          btc: 0,
          trades: [],
          startingCashBrl: 10_000,
          openPosition: null,
        }
      : loadSimState(),
  );
  const [boletaOpen, setBoletaOpen] = useState(true);
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [qtyBtc, setQtyBtc] = useState("0.001");
  const [limitPrice, setLimitPrice] = useState("");
  const [gain, setGain] = useState("");
  const [gainReduce, setGainReduce] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tourStep, setTourStep] = useState<number | null>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return localStorage.getItem(PRO_TOUR_STORAGE_KEY) === "1" ? null : 0;
    } catch {
      return 0;
    }
  });
  const limitSeeded = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const persist = useCallback((next: SimState) => {
    setState(next);
    saveSimState(next);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const range = INTERVAL_TO_RANGE[interval];
      const res = await fetch(`/api/market/btc?range=${range}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "erro");
      const list: Candle[] = Array.isArray(json.candles)
        ? json.candles
        : (json.series ?? []).map((p: { t: number; price: number }) => ({
            t: p.t,
            o: p.price,
            h: p.price,
            l: p.price,
            c: p.price,
          }));
      setCandles(list);
      const px = Number(json.priceBrl) || null;
      setPriceBrl(px);
      setChangePct(Number(json.changePct) || 0);
      if (!limitSeeded.current && json.priceBrl) {
        setLimitPrice(String(Number(json.priceBrl).toFixed(2)));
        limitSeeded.current = true;
      }

      if (px && px > 0) {
        const hit = evaluateExits(stateRef.current, px);
        if (hit) {
          persist(hit.state);
          if (hit.message) setFlash(hit.message);
        }
      }
    } catch {
      setFlash("Mercado indisponível no momento.");
    } finally {
      setLoading(false);
    }
  }, [interval, persist]);

  useEffect(() => {
    setState(loadSimState());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setLoading(true);
    void refresh();
    const id = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(id);
  }, [refresh]);

  const pnl = priceBrl != null ? resultadoBruto(state, priceBrl) : 0;
  const equity = priceBrl != null ? portfolioBrl(state, priceBrl) : state.cashBrl;
  const up = changePct >= 0;
  const pos = state.openPosition;

  const assetRows = useMemo(() => {
    const btc = priceBrl ?? 0;
    return [
      { code: "BTC/BRL", price: btc, change: changePct, digits: 0 },
      {
        code: "SATS/BRL",
        price: btc > 0 ? btc / 1e8 : 0,
        change: changePct,
        digits: 6,
      },
    ];
  }, [priceBrl, changePct]);

  const chartLevels = useMemo(
    () => ({
      takeProfit: pos?.takeProfit ?? null,
      stopLoss: pos?.stopLoss ?? null,
      entry: pos?.entryPrice ?? null,
    }),
    [pos],
  );

  function executeOrder() {
    if (mode !== "sim") {
      setFlash("Ordens só no modo Simulador. Conta Real: use carteira/corretoras no dashboard.");
      return;
    }
    if (!priceBrl || priceBrl <= 0) {
      setFlash("Aguarde o preço carregar.");
      return;
    }
    const qty = parseNum(qtyBtc);
    if (qty == null || qty <= 0) {
      setFlash("Quantidade inválida.");
      return;
    }

    const px =
      orderType === "limit" ? parseNum(limitPrice) ?? 0 : priceBrl;
    if (!(px > 0)) {
      setFlash("Preço inválido.");
      return;
    }

    if (orderType === "limit") {
      if (side === "buy" && priceBrl > px) {
        setFlash("Limitada de compra: aguardando preço ≤ " + fmtBrl(px));
        return;
      }
      if (side === "sell" && priceBrl < px) {
        setFlash("Limitada de venda: aguardando preço ≥ " + fmtBrl(px));
        return;
      }
    }

    const brl = qty * px;
    const tp = parseNum(gain);
    const sl = parseNum(stopLoss);
    const gr = parseNum(gainReduce);

    if (side === "buy") {
      if (brl > state.cashBrl) {
        setFlash("Saldo fictício insuficiente.");
        return;
      }
      const newQty = state.btc + qty;
      const prev = state.openPosition;
      const entryPrice =
        prev && prev.qtyBtc > 0
          ? (prev.entryPrice * prev.qtyBtc + px * qty) / newQty
          : px;

      const openPosition: OpenPosition = {
        qtyBtc: newQty,
        entryPrice,
        takeProfit: tp && tp > 0 ? tp : null,
        stopLoss: sl && sl > 0 ? sl : null,
        gainReduce: gr && gr > 0 ? gr : null,
        breakevenArmed: false,
        openedAt: new Date().toISOString(),
      };

      const next: SimState = {
        ...state,
        cashBrl: state.cashBrl - brl,
        btc: newQty,
        openPosition,
        trades: [
          {
            id: `${Date.now()}-buy`,
            side: "buy" as const,
            brl,
            btc: qty,
            priceBrl: px,
            at: new Date().toISOString(),
            reason: "manual" as const,
          },
          ...state.trades,
        ].slice(0, 30),
      };
      persist(next);

      const notes = [
        tp ? `Gain ${fmtBrl(tp)}` : null,
        gr ? `Redução ${fmtBrl(gr)}` : null,
        sl ? `Stop ${fmtBrl(sl)}` : null,
      ].filter(Boolean);
      setFlash(
        `COMPRA ${qty} BTC @ ${fmtBrl(px)}${notes.length ? " · " + notes.join(" · ") : ""}`,
      );
      return;
    }

    if (qty > state.btc + 1e-12) {
      setFlash("BTC fictício insuficiente.");
      return;
    }
    const left = Math.max(0, state.btc - qty);
    const next: SimState = {
      ...state,
      cashBrl: state.cashBrl + brl,
      btc: left,
      openPosition:
        left <= 1e-12
          ? null
          : state.openPosition
            ? { ...state.openPosition, qtyBtc: left }
            : null,
      trades: [
        {
          id: `${Date.now()}-sell`,
          side: "sell" as const,
          brl,
          btc: qty,
          priceBrl: px,
          at: new Date().toISOString(),
          reason: "manual" as const,
        },
        ...state.trades,
      ].slice(0, 30),
    };
    persist(next);
    setFlash(`VENDA ${qty} BTC @ ${fmtBrl(px)}`);
  }

  const tourActive = tourStep != null && mode === "sim";
  const tour = tourActive ? PRO_TOUR_STEPS[tourStep] : null;
  const tourCardRef = useRef<HTMLDivElement>(null);
  const tourLayoutRef = useRef<TourLayout | null>(null);
  const [tourLayout, setTourLayout] = useState<TourLayout | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(ensureTourPortalRoot());
  }, []);

  useEffect(() => {
    if (!tourActive) {
      document.body.classList.remove(PRO_TOUR_BODY_CLASS);
      return;
    }
    document.body.classList.add(PRO_TOUR_BODY_CLASS);
    return () => {
      document.body.classList.remove(PRO_TOUR_BODY_CLASS);
    };
  }, [tourActive]);

  useEffect(() => {
    if (!tourActive || !tour?.needsBoleta) return;
    setBoletaOpen(true);
  }, [tourActive, tour?.needsBoleta, tourStep]);

  useEffect(() => {
    if (!tourActive || !tour || tourStep == null) {
      tourLayoutRef.current = null;
      setTourLayout(null);
      return;
    }

    let cancelled = false;
    let raf = 0;
    const timers: number[] = [];
    const edge = 16;
    const stepId = tour.id;
    /** Lado escolhido no sync do passo — travado no scroll para não “desafixar”. */
    let lockedPlace: "above" | "below" | undefined;

    // Limpa balão do passo anterior.
    tourLayoutRef.current = null;
    setTourLayout(null);

    function findHost(): HTMLElement | null {
      return document.querySelector(
        `.sv-pro [data-tour="${stepId}"]`,
      ) as HTMLElement | null;
    }

    function publish(next: TourLayout) {
      if (tourLayoutsClose(tourLayoutRef.current, next)) return;
      tourLayoutRef.current = next;
      setTourLayout(next);
    }

    /** Só viewport coords (getBoundingClientRect) → position: fixed. Sem scrollY. */
    function measure(lockPlace?: "above" | "below") {
      if (cancelled) return;
      const host = findHost();
      if (!host) return;

      const targetRect = host.getBoundingClientRect();
      const cardEl = tourCardRef.current;
      const cardW = Math.min(320, Math.max(260, window.innerWidth - edge * 2));
      const cardH = Math.max(cardEl?.offsetHeight || 0, 200);
      const viewport = { width: window.innerWidth, height: window.innerHeight };

      const layout = computeTourLayout(
        targetRect,
        { width: cardW, height: cardH },
        viewport,
        lockPlace,
      );
      // Hole acompanha o alvo cru (mesmo parcialmente fora da tela).
      publish(layout);
    }

    function scheduleTrack() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        measure(lockedPlace ?? tourLayoutRef.current?.place);
      });
    }

    async function syncStep() {
      for (let i = 0; i < 12 && !cancelled; i++) {
        if (findHost()) break;
        await new Promise<void>((r) => {
          timers.push(window.setTimeout(r, 40));
        });
      }
      if (cancelled) return;

      const host = findHost();
      if (!host) return;

      await scrollTourTargetIntoView(host);
      if (cancelled) return;

      // Primeira medida: escolhe above/below. Depois trava no scroll.
      measure(undefined);
      lockedPlace = tourLayoutRef.current?.place;

      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          measure(undefined);
          lockedPlace = tourLayoutRef.current?.place;
        }, 80),
      );
    }

    void syncStep();

    window.addEventListener("scroll", scheduleTrack, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", scheduleTrack, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("scroll", scheduleTrack, true);
      window.removeEventListener("resize", scheduleTrack);
    };
  }, [tourActive, tour, tourStep, boletaOpen]);
  function finishTour() {
    setTourStep(null);
    setTourLayout(null);
    try {
      localStorage.setItem(PRO_TOUR_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function advanceTour() {
    if (tourStep == null) return;
    if (tourStep >= PRO_TOUR_STEPS.length - 1) {
      finishTour();
      return;
    }
    setTourStep(tourStep + 1);
  }

  function restartTour() {
    setMode("sim");
    setBoletaOpen(true);
    setTourStep(0);
    try {
      localStorage.removeItem(PRO_TOUR_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const tourUi =
    tourActive && tour && portalRoot
      ? createPortal(
          <div className="sv-pro-tour-layer" role="presentation">
            {tourLayout ? (
              <>
                <div
                  className="sv-pro-tour-dim"
                  style={{
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: Math.max(0, tourLayout.hole.top),
                  }}
                />
                <div
                  className="sv-pro-tour-dim"
                  style={{
                    top: tourLayout.hole.top,
                    left: 0,
                    width: Math.max(0, tourLayout.hole.left),
                    height: tourLayout.hole.height,
                  }}
                />
                <div
                  className="sv-pro-tour-dim"
                  style={{
                    top: tourLayout.hole.top,
                    left: tourLayout.hole.left + tourLayout.hole.width,
                    width: Math.max(
                      0,
                      window.innerWidth -
                        (tourLayout.hole.left + tourLayout.hole.width),
                    ),
                    height: tourLayout.hole.height,
                  }}
                />
                <div
                  className="sv-pro-tour-dim"
                  style={{
                    top: tourLayout.hole.top + tourLayout.hole.height,
                    left: 0,
                    width: "100vw",
                    height: Math.max(
                      0,
                      window.innerHeight -
                        (tourLayout.hole.top + tourLayout.hole.height),
                    ),
                  }}
                />
                <div
                  className="sv-pro-tour-hole"
                  style={{
                    top: tourLayout.hole.top,
                    left: tourLayout.hole.left,
                    width: tourLayout.hole.width,
                    height: tourLayout.hole.height,
                  }}
                />
              </>
            ) : (
              <div
                className="sv-pro-tour-dim"
                style={{ top: 0, left: 0, width: "100vw", height: "100vh" }}
              />
            )}
            <div
              ref={tourCardRef}
              className={`sv-pro-tour is-${tourLayout?.place ?? "below"}`}
              role="dialog"
              aria-label="Tutorial do simulador"
              style={
                tourLayout
                  ? {
                      top: tourLayout.card.top,
                      left: tourLayout.card.left,
                      width: tourLayout.card.width,
                      ["--sv-tour-arrow" as string]: `${tourLayout.card.arrow}%`,
                      visibility: "visible",
                    }
                  : { visibility: "hidden", top: 0, left: 0 }
              }
            >
              <p className="sv-pro-tour-step">
                Passo {(tourStep ?? 0) + 1} de {PRO_TOUR_STEPS.length}
              </p>
              <h3 className="sv-pro-tour-title">{tour.title}</h3>
              <p className="sv-pro-tour-body">{tour.body}</p>
              <div className="sv-pro-tour-actions">
                <button
                  type="button"
                  className="sv-pro-tour-skip"
                  disabled={disabled}
                  onClick={finishTour}
                >
                  Pular tutorial
                </button>
                <button
                  type="button"
                  className="sv-pro-tour-next"
                  disabled={disabled}
                  onClick={advanceTour}
                >
                  {(tourStep ?? 0) >= PRO_TOUR_STEPS.length - 1
                    ? "Concluir"
                    : "Avançar"}
                </button>
              </div>
            </div>
          </div>,
          portalRoot,
        )
      : null;

  return (
    <div
      className={`sv-pro${tourActive ? " is-touring" : ""}`}
      aria-label="Simulador de trader profissional"
    >
      <header className="sv-pro-header">
        <div className="sv-pro-tour-host sv-pro-tour-host--mode">
          <div className="sv-pro-mode" data-tour="mode">
            <button
              type="button"
              className={`sv-pro-mode-btn${mode === "real" ? " is-on is-real" : ""}`}
              disabled={disabled || tourActive}
              onClick={() => setMode("real")}
            >
              Conta Real
            </button>
            <button
              type="button"
              className={`sv-pro-mode-btn${mode === "sim" ? " is-on is-sim" : ""}`}
              disabled={disabled || tourActive}
              onClick={() => setMode("sim")}
            >
              <span className="sv-pro-dot" aria-hidden />
              Simulador
            </button>
          </div>
        </div>

        <div className="sv-pro-clock" aria-live="polite">
          {fmtClock(now)}
        </div>

        <div className="sv-pro-tour-host sv-pro-stats" data-tour="stats">
          <span>
            Resultado bruto Simulador:{" "}
            <strong className={pnl >= 0 ? "is-up" : "is-down"}>{fmtBrl(pnl)}</strong>
          </span>
          <span className="sv-pro-muted">Patrimônio: {fmtBrl(equity)}</span>
        </div>

        <button
          type="button"
          className="sv-pro-zerar"
          disabled={disabled || mode !== "sim" || tourActive}
          onClick={() => {
            persist(resetSimState());
            setFlash("Simulador zerado — saldo inicial R$ 10.000.");
          }}
        >
          Zerar Tudo
        </button>
      </header>

      {mode === "real" && (
        <div className="sv-pro-banner sv-pro-banner-row">
          <p>
            Conta Real não envia ordens neste terminal. Use o dashboard para carteira,
            corretoras e saques Lightning.
          </p>
          <div className="sv-pro-banner-actions">
            <button
              type="button"
              className="sv-pro-boleta-toggle"
              disabled={disabled}
              onClick={() => setMode("sim")}
            >
              Voltar ao Simulador
            </button>
            {onGoDashboard && (
              <button
                type="button"
                className="sv-pro-boleta-toggle"
                disabled={disabled}
                onClick={onGoDashboard}
              >
                Ir ao dashboard
              </button>
            )}
          </div>
        </div>
      )}

      <div className="sv-pro-body">
        <section className="sv-pro-main">
          <div className="sv-pro-toolbar">
            <div className="sv-pro-tabs" role="tablist" aria-label="Ativo">
              <button type="button" className="sv-pro-tab is-on" role="tab" aria-selected>
                BTC/BRL
              </button>
            </div>
            <label className="sv-pro-interval" data-tour="interval">
              Tempo
              <select
                value={interval}
                disabled={disabled || tourActive}
                onChange={(e) => setIntervalKey(e.target.value as Interval)}
              >
                <option value="1m">1 minuto</option>
                <option value="5m">5 minutos</option>
                <option value="15m">15 minutos</option>
              </select>
            </label>
            <button
              type="button"
              className="sv-pro-boleta-toggle"
              disabled={disabled || mode !== "sim" || tourActive}
              onClick={() => setBoletaOpen((v) => !v)}
            >
              {boletaOpen ? "Ocultar boleta" : "Abrir boleta"}
            </button>
          </div>

          <div className="sv-pro-price-row">
            <strong>
              {loading && priceBrl == null
                ? "…"
                : priceBrl != null
                  ? fmtBrl(priceBrl, 0)
                  : "—"}
            </strong>
            <span className={up ? "is-up" : "is-down"}>
              {up ? "▲" : "▼"} {Math.abs(changePct).toFixed(2)}%
            </span>
            <span className="sv-pro-muted">
              Caixa {fmtBrl(state.cashBrl)} · BTC {state.btc.toFixed(8)}
            </span>
          </div>

          <div
            className="sv-pro-chart-wrap"
            data-tour="chart"
          >
            <CandleChart candles={candles} levels={chartLevels} />
          </div>
        </section>

        <aside className="sv-pro-side" aria-label="Ativos em destaque">
          <p className="sv-pro-side-title">Ativos</p>
          <ul className="sv-pro-assets">
            {assetRows.map((a) => (
              <li key={a.code} className={a.code === "BTC/BRL" ? "is-active" : ""}>
                <span>{a.code}</span>
                <span>
                  {a.price > 0
                    ? a.price.toLocaleString("pt-BR", {
                        minimumFractionDigits: a.digits,
                        maximumFractionDigits: a.digits,
                      })
                    : "—"}
                </span>
                <span className={a.change >= 0 ? "is-up" : "is-down"}>
                  {a.change >= 0 ? "+" : ""}
                  {a.change.toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>

          {pos && state.btc > 0 && (
            <div className="sv-pro-position">
              <p className="sv-pro-side-title">Posição aberta</p>
              <p>Qty {pos.qtyBtc.toFixed(6)} BTC</p>
              <p>Entrada {fmtBrl(pos.entryPrice)}</p>
              {pos.takeProfit != null && <p className="is-up">Gain {fmtBrl(pos.takeProfit)}</p>}
              {pos.stopLoss != null && <p className="is-down">Stop {fmtBrl(pos.stopLoss)}</p>}
              {pos.gainReduce != null && (
                <p className="sv-pro-muted">
                  Redução {fmtBrl(pos.gainReduce)}
                  {pos.breakevenArmed ? " · BE ativo" : ""}
                </p>
              )}
            </div>
          )}

          {state.trades[0] && (
            <div className="sv-pro-last-trade">
              <p className="sv-pro-side-title">Última ordem</p>
              <p>
                {state.trades[0].side === "buy" ? "Compra" : "Venda"}
                {state.trades[0].reason && state.trades[0].reason !== "manual"
                  ? ` (${state.trades[0].reason})`
                  : ""}{" "}
                · {state.trades[0].btc.toFixed(6)} BTC · {fmtBrl(state.trades[0].priceBrl)}
              </p>
            </div>
          )}
        </aside>
      </div>

      {boletaOpen && mode === "sim" && (
        <div className="sv-pro-boleta" role="dialog" aria-label="Boleta de ordens">
          <div className="sv-pro-boleta-head">
            <strong>Boleta · BTC/BRL</strong>
            <span className="sv-pro-pill">SIMULADOR</span>
            <button
              type="button"
              className="sv-pro-boleta-x"
              aria-label="Fechar boleta"
              disabled={tourActive}
              onClick={() => setBoletaOpen(false)}
            >
              ×
            </button>
          </div>

          <div
            className="sv-pro-boleta-tabs"
            data-tour="side"
          >
            <button
              type="button"
              className={`sv-pro-boleta-tab is-buy${side === "buy" ? " is-on" : ""}`}
              disabled={tourActive}
              onClick={() => setSide("buy")}
            >
              Compra
            </button>
            <button
              type="button"
              className={`sv-pro-boleta-tab is-sell${side === "sell" ? " is-on" : ""}`}
              disabled={tourActive}
              onClick={() => setSide("sell")}
            >
              Venda
            </button>
          </div>

          <div className="sv-pro-boleta-grid">
            <label data-tour="type">
              Tipo
              <select
                value={orderType}
                disabled={disabled || tourActive}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
              >
                <option value="market">Mercado</option>
                <option value="limit">Limitada</option>
              </select>
            </label>
            <label>
              Validade
              <select disabled={disabled || tourActive} defaultValue="hoje">
                <option value="hoje">Hoje</option>
                <option value="gtc">Até cancelar</option>
              </select>
            </label>
            <label data-tour="qty">
              Quantidade (BTC)
              <input
                value={qtyBtc}
                disabled={disabled || tourActive}
                onChange={(e) => setQtyBtc(e.target.value)}
              />
            </label>
            <label data-tour="price">
              Preço
              <input
                value={limitPrice}
                disabled={disabled || tourActive || orderType === "market"}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder={orderType === "market" ? "Preço de mercado" : "Preço limite"}
              />
            </label>
            <label data-tour="gain">
              Objetivo (Gain) · preço BRL
              <input
                value={gain}
                disabled={disabled || tourActive}
                onChange={(e) => setGain(e.target.value)}
                placeholder="Ex.: 350000"
              />
            </label>
            <label data-tour="gainReduce">
              Redução gain · arma BE
              <input
                value={gainReduce}
                disabled={disabled || tourActive}
                onChange={(e) => setGainReduce(e.target.value)}
                placeholder="Preço que move stop p/ entrada"
              />
            </label>
            <label
              className="sv-pro-span-2"
              data-tour="stop"
            >
              Stop Loss · preço BRL
              <input
                value={stopLoss}
                disabled={disabled || tourActive}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Ex.: 320000"
              />
            </label>
          </div>

          <div
            className="sv-pro-boleta-actions"
            data-tour="exec"
          >
            <button
              type="button"
              className="sv-pro-clear"
              disabled={disabled || tourActive}
              onClick={() => {
                setGain("");
                setGainReduce("");
                setStopLoss("");
                setQtyBtc("0.001");
              }}
            >
              Limpar
            </button>
            <button
              type="button"
              className={side === "buy" ? "sv-pro-exec is-buy" : "sv-pro-exec is-sell"}
              disabled={disabled || tourActive}
              onClick={executeOrder}
            >
              {side === "buy" ? "COMPRAR" : "VENDER"}
            </button>
          </div>
        </div>
      )}

      {tourUi}

      {flash && <p className="sv-pro-flash">{flash}</p>}

      <div className="sv-pro-footer">
        <button type="button" className="linkish" disabled={disabled} onClick={onBack}>
          Voltar ao chat
        </button>
        {!tourActive && mode === "sim" && (
          <button
            type="button"
            className="linkish"
            disabled={disabled}
            onClick={restartTour}
          >
            Ver tutorial
          </button>
        )}
      </div>
    </div>
  );
}
