"use client";
// Painel de corretoras — visual/ilustrativo, sem API.
import { useEffect, useId, useRef, useState } from "react";
import "./exchanges.css";

type Exchange = {
  id: string;
  name: string;
  initial: string;
  tone: string;
  connected?: boolean;
  balanceLabel?: string;
};

const EXCHANGES: Exchange[] = [
  {
    id: "binance",
    name: "Binance",
    initial: "B",
    tone: "#f0b90b",
    connected: true,
    balanceLabel: "R$ 1.250,00 em BTC",
  },
  { id: "mb", name: "Mercado Bitcoin", initial: "M", tone: "#f7931a" },
  { id: "coinbase", name: "Coinbase", initial: "C", tone: "#0052ff" },
  { id: "foxbit", name: "Foxbit", initial: "F", tone: "#00c2a8" },
];

const EXPLAIN =
  "A conexão com corretoras usa chaves de API somente-leitura, geradas por você na sua conta da corretora. O SatVantage nunca pode mover seus fundos — apenas enxergar saldos e histórico para te acompanhar. Disponível na próxima versão.";

export default function ExchangesPanel() {
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!openId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    function onPointer(e: MouseEvent) {
      const el = dialogRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setOpenId(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [openId]);

  const active = EXCHANGES.find((x) => x.id === openId) ?? null;

  return (
    <section className="sv-exch" aria-labelledby={titleId}>
      <div className="sv-exch-top">
        <p id={titleId} className="sv-exch-label">
          Corretoras
        </p>
      </div>

      <p className="sv-exch-lead">Acompanhe saldos e histórico das suas exchanges</p>

      <ul className="sv-exch-list">
        {EXCHANGES.map((ex) => (
          <li
            key={ex.id}
            className={`sv-exch-row${ex.connected ? " is-connected" : ""}`}
          >
            <span
              className="sv-exch-logo"
              style={{ "--exch-tone": ex.tone } as React.CSSProperties}
              aria-hidden
            >
              {ex.initial}
            </span>
            <div className="sv-exch-meta">
              <strong>{ex.name}</strong>
              {ex.connected && ex.balanceLabel ? (
                <span className="sv-exch-preview-bal">{ex.balanceLabel}</span>
              ) : (
                <span>Não conectada</span>
              )}
            </div>
            {ex.connected ? (
              <span className="sv-exch-status">Conectada</span>
            ) : (
              <button
                type="button"
                className="sv-exch-connect"
                onClick={() => setOpenId(ex.id)}
              >
                Conectar
              </button>
            )}
          </li>
        ))}
      </ul>

      {active && (
        <div className="sv-exch-backdrop" role="presentation">
          <div
            ref={dialogRef}
            className="sv-exch-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sv-exch-modal-title"
          >
            <div className="sv-exch-modal-head">
              <h3 id="sv-exch-modal-title">Conectar {active.name}</h3>
              <button
                type="button"
                className="sv-exch-modal-close"
                aria-label="Fechar"
                onClick={() => setOpenId(null)}
              >
                ×
              </button>
            </div>
            <p className="sv-exch-modal-body">{EXPLAIN}</p>
            <button
              type="button"
              className="sv-exch-connect sv-exch-connect--solid"
              onClick={() => setOpenId(null)}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
