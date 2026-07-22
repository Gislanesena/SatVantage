"use client";
// Bitcoin ao vivo: gráfico com hover, faixas 1m / 4h / 8h / 24h (Binance via API).
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import "./dash.css";

type Range = "1m" | "4h" | "8h" | "24h";

type Point = { t: number; price: number };

type Market = {
  priceBrl: number;
  priceUsd: number;
  changePct: number;
  series: Point[];
  range: Range;
};

const RANGES: { id: Range; label: string }[] = [
  { id: "1m", label: "1 min" },
  { id: "4h", label: "4 h" },
  { id: "8h", label: "8 h" },
  { id: "24h", label: "24 h" },
];

const CHART = {
  card: { w: 360, h: 148, pad: { top: 14, right: 8, bottom: 8, left: 8 } },
  wide: { w: 960, h: 280, pad: { top: 16, right: 12, bottom: 10, left: 12 } },
} as const;

function fmtBrl(n: number, digits = 0) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function fmtTime(ts: number, range: Range) {
  const d = new Date(ts);
  if (range === "1m" || range === "4h") {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Chart({
  series,
  range,
  up,
  variant = "card",
}: {
  series: Point[];
  range: Range;
  up: boolean;
  variant?: "card" | "wide";
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const gradId = useId().replace(/:/g, "");
  const { w: W, h: H, pad: PAD } = CHART[variant];

  const geo = useMemo(() => {
    if (series.length < 2) return null;
    const prices = series.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = max - min || 1;
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    const xy = series.map((p, i) => {
      const x = PAD.left + (i / (series.length - 1)) * innerW;
      const y = PAD.top + innerH - ((p.price - min) / span) * innerH;
      return { x, y, ...p };
    });

    const line = xy
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");

    const area =
      line +
      ` L${xy[xy.length - 1].x.toFixed(2)},${(H - PAD.bottom).toFixed(2)}` +
      ` L${xy[0].x.toFixed(2)},${(H - PAD.bottom).toFixed(2)} Z`;

    const ticks = [0, Math.floor((xy.length - 1) / 2), xy.length - 1].map((i) => ({
      x: xy[i].x,
      label: fmtTime(xy[i].t, range),
    }));

    return { xy, line, area, min, max, ticks };
  }, [series, range, W, H, PAD.left, PAD.right, PAD.top, PAD.bottom]);

  const onMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!geo || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
      if (clientX == null) return;
      const rel = ((clientX - rect.left) / rect.width) * W;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < geo.xy.length; i++) {
        const d = Math.abs(geo.xy[i].x - rel);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      const p = geo.xy[best];
      setHover({ i: best, x: p.x, y: p.y });
    },
    [geo, W],
  );

  if (!geo) return null;

  const stroke = up ? "var(--btc-up)" : "var(--btc-down)";
  const active = hover ? geo.xy[hover.i] : null;
  const tipLeft =
    hover == null ? 0 : Math.min(Math.max((hover.x / W) * 100, 12), 88);
  const strokeW = variant === "wide" ? 1.15 : 1.05;

  return (
    <div
      className={`sv-btc-chart${variant === "wide" ? " sv-btc-chart--wide" : ""}`}
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
      onTouchStart={onMove}
      onTouchMove={onMove}
      onTouchEnd={() => setHover(null)}
    >
      <svg
        className="sv-btc-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico do Bitcoin"
      >
        <defs>
          <linearGradient id={`btc-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => {
          const y = PAD.top + (H - PAD.top - PAD.bottom) * f;
          return (
            <line
              key={f}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              className="sv-btc-grid"
            />
          );
        })}

        <path d={geo.area} fill={`url(#btc-fill-${gradId})`} />
        <path
          d={geo.line}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {hover && active && (
          <>
            <line
              x1={hover.x}
              x2={hover.x}
              y1={PAD.top}
              y2={H - PAD.bottom}
              className="sv-btc-cross"
            />
            <circle
              cx={hover.x}
              cy={hover.y}
              r={variant === "wide" ? 3.5 : 3}
              fill={stroke}
              stroke="var(--surface)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>

      <div className="sv-btc-xlabels" aria-hidden>
        {geo.ticks.map((t, i) => (
          <span key={i}>{t.label}</span>
        ))}
      </div>

      {active && (
        <div className="sv-btc-tip" style={{ left: `${tipLeft}%` }} role="status">
          <strong>{fmtBrl(active.price, active.price >= 1000 ? 0 : 2)}</strong>
          <span>{fmtTime(active.t, range)}</span>
        </div>
      )}
    </div>
  );
}

type BtcMarketProps = {
  /** card = dashboard · wide = homepage em tela cheia */
  variant?: "card" | "wide";
};

export default function BtcMarket({ variant = "card" }: BtcMarketProps) {
  const { t, locale } = useI18n();
  const [range, setRange] = useState<Range>("24h");
  const [data, setData] = useState<Market | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function tick() {
      try {
        const res = await fetch(`/api/market/btc?range=${range}`);
        const json = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(json.error ?? "erro");
        setData({
          priceBrl: json.priceBrl,
          priceUsd: json.priceUsd,
          changePct: json.changePct,
          series: json.series ?? [],
          range: json.range ?? range,
        });
        setError(null);
      } catch (e: any) {
        if (alive) setError(e.message ?? "sem dados");
      } finally {
        if (alive) setLoading(false);
      }
    }

    setLoading(true);
    void tick();
    const poll = range === "1m" ? 20_000 : 45_000;
    const id = setInterval(tick, poll);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [range]);

  const up = (data?.changePct ?? 0) >= 0;
  const rangeLabel = RANGES.find((r) => r.id === range)?.label ?? range;

  const priceBrl = data
    ? data.priceBrl.toLocaleString(locale === "en" ? "en-US" : "pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })
    : "";
  const priceUsd = data
    ? data.priceUsd.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })
    : "";

  return (
    <section
      className={`sv-btc${variant === "wide" ? " sv-btc--wide" : ""}`}
      aria-label={t.btc.live}
    >
      <div className="sv-btc-top">
        <p className="sv-btc-label">{t.btc.live}</p>
        {data && (
          <span className={`sv-btc-chg${up ? " is-up" : " is-down"}`}>
            {up ? "▲" : "▼"} {Math.abs(data.changePct).toFixed(2)}% · {rangeLabel}
          </span>
        )}
      </div>

      {data ? (
        <>
          <div className="sv-btc-price-row">
            <p className="sv-btc-price">{priceBrl}</p>
            <p className="sv-btc-sub">{priceUsd}</p>
          </div>

          <div className="sv-btc-ranges" role="tablist" aria-label={t.btc.chartPeriod}>
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={range === r.id}
                className={`sv-btc-range${range === r.id ? " is-on" : ""}`}
                onClick={() => setRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Chart series={data.series} range={data.range} up={up} variant={variant} />
          <p className="sv-btc-hint">{t.btc.hint}</p>
        </>
      ) : (
        <p className="sv-btc-sub">
          {error ? t.btc.unavailable : loading ? t.btc.loading : t.btc.noData}
        </p>
      )}
    </section>
  );
}
