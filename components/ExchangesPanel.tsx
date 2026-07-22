"use client";
// Painel de corretoras — visual/ilustrativo, sem API.
import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import "./exchanges.css";

type Exchange = {
  id: string;
  name: string;
  initial: string;
  tone: string;
  connected?: boolean;
  balanceAmount?: string;
};

const EXCHANGES: Exchange[] = [
  {
    id: "mb",
    name: "Mercado Bitcoin",
    initial: "M",
    tone: "#f7931a",
    connected: true,
    balanceAmount: "R$ 890,40",
  },
  { id: "binance", name: "Binance", initial: "B", tone: "#f0b90b" },
  { id: "coinbase", name: "Coinbase", initial: "C", tone: "#0052ff" },
  { id: "foxbit", name: "Foxbit", initial: "F", tone: "#00c2a8" },
];

export default function ExchangesPanel() {
  const { t } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>(EXCHANGES);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Modo Emergência desconecta a corretora "conectada" (mock estático).
  useEffect(() => {
    function onEmergency() {
      setExchanges((prev) =>
        prev.map((ex) => ({ ...ex, connected: false, balanceAmount: undefined })),
      );
    }
    window.addEventListener("sv-emergency-disconnected", onEmergency);
    return () => window.removeEventListener("sv-emergency-disconnected", onEmergency);
  }, []);

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

  const active = exchanges.find((x) => x.id === openId) ?? null;

  return (
    <section className="sv-exch" aria-labelledby={titleId}>
      <div className="sv-exch-top">
        <p id={titleId} className="sv-exch-label">
          {t.exch.title}
        </p>
      </div>

      <p className="sv-exch-lead">{t.exch.lead}</p>

      <ul className="sv-exch-list">
        {exchanges.map((ex) => (
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
              {ex.connected && ex.balanceAmount ? (
                <span className="sv-exch-preview-bal">
                  {ex.balanceAmount} {t.exch.inBtc}
                </span>
              ) : (
                <span>{t.exch.notConnected}</span>
              )}
            </div>
            {ex.connected ? (
              <span className="sv-exch-status">{t.exch.connected}</span>
            ) : (
              <button
                type="button"
                className="sv-exch-connect"
                onClick={() => setOpenId(ex.id)}
              >
                {t.exch.connect}
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
              <h3 id="sv-exch-modal-title">
                {t.exch.connectTitle} {active.name}
              </h3>
              <button
                type="button"
                className="sv-exch-modal-close"
                aria-label={t.exch.close}
                onClick={() => setOpenId(null)}
              >
                ×
              </button>
            </div>
            <p className="sv-exch-modal-body">{t.exch.explain}</p>
            <button
              type="button"
              className="sv-exch-connect sv-exch-connect--solid"
              onClick={() => setOpenId(null)}
            >
              {t.exch.gotIt}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
