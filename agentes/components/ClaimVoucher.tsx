"use client";
// Resgate do voucher da mentoria → Lightning (Tesouraria MutinyNet).
import { useCallback, useEffect, useState } from "react";
import "./wallet.css";

type Props = {
  embedded?: boolean;
  onClaimed?: () => void;
};

export default function ClaimVoucher({ embedded, onClaimed }: Props) {
  const [satsBalance, setSatsBalance] = useState<number | null>(null);
  const [bolt11, setBolt11] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/rewards/balance");
    if (res.status === 401) return;
    const json = await res.json().catch(() => ({ satsBalance: 0 }));
    setSatsBalance(json.satsBalance ?? 0);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function resgatar() {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bolt11 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBolt11("");
      setNotice(
        `Pronto: ⚡ ${Number(json.satsPaid).toLocaleString("pt-BR")} sats foram para a sua carteira.`,
      );
      setSatsBalance(json.satsBalance ?? 0);
      onClaimed?.();
    } catch (e: any) {
      setError(e.message ?? "falha no resgate");
    } finally {
      setBusy(false);
    }
  }

  if (satsBalance === null) {
    return <p className="sv-wallet-loading">Carregando…</p>;
  }

  return (
    <section className="sv-wallet" aria-labelledby="sv-voucher-title">
      {!embedded && (
        <div className="sv-wallet-head">
          <h2 id="sv-voucher-title" className="sv-wallet-title">
            Saldo SatVantage
          </h2>
          <span className="sv-wallet-balance">
            ⚡ {satsBalance.toLocaleString("pt-BR")} sats
          </span>
        </div>
      )}

      {embedded && (
        <h2 id="sv-voucher-title" className="sv-wallet-title">
          Receber sats da mentoria
        </h2>
      )}

      <p className="sv-wallet-copy">
        Gere na carteira <strong>MutinyNet</strong> uma cobrança de exatamente{" "}
        <strong>{satsBalance.toLocaleString("pt-BR")} sats</strong> (começa com{" "}
        <code>lntbs</code>) e cole abaixo.
      </p>

      {satsBalance <= 0 ? (
        <p className="sv-wallet-meta">Sem saldo para receber agora.</p>
      ) : (
        <>
          <input
            className="sv-wallet-input"
            placeholder="lntbs1…"
            value={bolt11}
            onChange={(e) => setBolt11(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <div className="sv-wallet-actions">
            <button
              type="button"
              className="sv-wallet-btn"
              disabled={!bolt11 || busy}
              onClick={() => void resgatar()}
            >
              {busy ? "Recebendo…" : "Confirmar recebimento"}
            </button>
          </div>
        </>
      )}

      {notice && <p className="sv-wallet-notice">{notice}</p>}
      {error && (
        <p role="alert" className="sv-wallet-error">
          {error}
        </p>
      )}
    </section>
  );
}
