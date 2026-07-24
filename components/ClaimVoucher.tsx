"use client";
// Resgate do voucher da mentoria → Lightning (Tesouraria MutinyNet).
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import "./wallet.css";

type Props = {
  embedded?: boolean;
  onClaimed?: () => void;
};

export default function ClaimVoucher({ embedded, onClaimed }: Props) {
  const { t, locale } = useI18n();
  const [satsBalance, setSatsBalance] = useState<number | null>(null);
  const [bolt11, setBolt11] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numberLocale = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";

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
        t.auth.claimOk.replace(
          "{n}",
          Number(json.satsPaid).toLocaleString(numberLocale),
        ),
      );
      setSatsBalance(json.satsBalance ?? 0);
      onClaimed?.();
    } catch (e: any) {
      setError(e.message ?? t.auth.claimFail);
    } finally {
      setBusy(false);
    }
  }

  if (satsBalance === null) {
    return <p className="sv-wallet-loading">{t.auth.loading}</p>;
  }

  return (
    <section className="sv-wallet" aria-labelledby="sv-voucher-title">
      {!embedded && (
        <div className="sv-wallet-head">
          <h2 id="sv-voucher-title" className="sv-wallet-title">
            {t.auth.claimTitle}
          </h2>
          <span className="sv-wallet-balance">
            ⚡ {satsBalance.toLocaleString(numberLocale)} sats
          </span>
        </div>
      )}

      {embedded && (
        <h2 id="sv-voucher-title" className="sv-wallet-title">
          {t.auth.claimMentorTitle}
        </h2>
      )}

      <p className="sv-wallet-copy">
        {t.auth.claimCopyBefore}{" "}
        <strong>{satsBalance.toLocaleString(numberLocale)} sats</strong>{" "}
        {t.auth.claimCopyAfter}
      </p>

      {satsBalance <= 0 ? (
        <p className="sv-wallet-meta">{t.auth.claimEmpty}</p>
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
              {busy ? t.auth.claimBusy : t.auth.claimConfirm}
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
