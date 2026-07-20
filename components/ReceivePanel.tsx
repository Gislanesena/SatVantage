"use client";
// Receber Lightning (qualquer origem via NWC) + resgate opcional do voucher.
import { useCallback, useEffect, useState } from "react";
import "./wallet.css";

type Props = {
  onChanged?: () => void;
};

export default function ReceivePanel({ onChanged }: Props) {
  const [connected, setConnected] = useState(false);
  const [reachable, setReachable] = useState(false);
  const [walletErr, setWalletErr] = useState<string | null>(null);
  const [voucher, setVoucher] = useState(0);
  const [claimRef, setClaimRef] = useState<string | null>(null);
  const [npubShort, setNpubShort] = useState<string | null>(null);
  const [amount, setAmount] = useState("1000");
  const [invoice, setInvoice] = useState<string | null>(null);
  const [claimBolt, setClaimBolt] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVoucher, setShowVoucher] = useState(true);

  const load = useCallback(async () => {
    const [w, b] = await Promise.all([
      fetch("/api/wallet/balance"),
      fetch("/api/rewards/balance"),
    ]);
    if (w.ok || w.status === 200) {
      const j = await w.json();
      setConnected(!!j.connected);
      setReachable(j.reachable !== false && !j.error);
      setWalletErr(j.error ?? null);
    }
    if (b.ok) {
      const j = await b.json();
      const bal = j.satsBalance ?? 0;
      setVoucher(bal);
      setClaimRef(j.claimRef ?? null);
      setNpubShort(j.npubShort ?? null);
      if (bal > 0) setShowVoucher(true);
    }
  }, []);

  async function testarCarteira() {
    setError(null);
    setNotice(null);
    setBusy("test");
    try {
      const res = await fetch("/api/wallet/test", { method: "POST" });
      const json = await res.json();
      if (!json.ok) {
        setReachable(false);
        setWalletErr(json.error ?? "sem resposta");
        setError(json.error ?? "carteira não respondeu — abra Enviar e reconecte");
        return;
      }
      setConnected(true);
      setReachable(true);
      setWalletErr(null);
      setNotice("Carteira respondeu — pode gerar cobrança.");
      onChanged?.();
    } catch (e: any) {
      setError(e.message ?? "falha ao testar");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  async function gerar() {
    setError(null);
    setNotice(null);
    setBusy("inv");
    try {
      const res = await fetch("/api/wallet/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountSats: Number(amount) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setInvoice(json.invoice);
      setNotice("Cobrança pronta — copie e cole em qualquer carteira/app Lightning que for te pagar.");
      onChanged?.();
    } catch (e: any) {
      setError(e.message ?? "falha ao gerar cobrança");
    } finally {
      setBusy(null);
    }
  }

  async function copiar() {
    if (!invoice) return;
    try {
      await navigator.clipboard.writeText(invoice);
      setNotice("Cobrança copiada.");
    } catch {
      setNotice("Selecione o texto e copie manualmente.");
    }
  }

  async function resgatarVoucher() {
    setError(null);
    setNotice(null);
    setBusy("claim");
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bolt11: claimBolt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setClaimBolt("");
      setNotice(`Voucher resgatado: ⚡ ${Number(json.satsPaid).toLocaleString("pt-BR")} sats.`);
      await load();
      onChanged?.();
    } catch (e: any) {
      setError(e.message ?? "falha no resgate");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="sv-wallet" aria-labelledby="sv-receive-title">
      <h2 id="sv-receive-title" className="sv-wallet-title">
        Receber
      </h2>
      <p className="sv-wallet-copy">
        Gere uma cobrança Lightning na sua carteira conectada. Qualquer pessoa ou plataforma
        pode pagar — Coinos, Alby, corretora, etc.
      </p>

      {!connected ? (
        <p className="sv-wallet-meta">
          Conecte a carteira em <strong>Enviar</strong> (NWC) para poder gerar cobranças aqui.
        </p>
      ) : !reachable ? (
        <div className="sv-wallet-reconnect">
          <p className="sv-wallet-copy">
            Credencial salva, mas a carteira não respondeu agora.
            {walletErr ? ` (${walletErr})` : ""}
          </p>
          <button
            type="button"
            className="sv-wallet-btn"
            disabled={busy === "test"}
            onClick={() => void testarCarteira()}
          >
            {busy === "test" ? "Testando…" : "Testar conexão de novo"}
          </button>
          <p className="sv-wallet-meta">
            Se continuar falhando, abra <strong>Enviar</strong> e cole uma credencial nova.
          </p>
        </div>
      ) : (
        <>
          <label className="sv-wallet-meta" htmlFor="sv-recv-amt">
            Valor (sats)
          </label>
          <input
            id="sv-recv-amt"
            className="sv-wallet-input"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="sv-wallet-actions">
            <button
              type="button"
              className="sv-wallet-btn"
              disabled={busy === "inv" || !amount}
              onClick={() => void gerar()}
            >
              {busy === "inv" ? "Gerando…" : "Gerar cobrança"}
            </button>
            {invoice && (
              <button type="button" className="sv-wallet-btn sv-wallet-btn--ghost" onClick={() => void copiar()}>
                Copiar
              </button>
            )}
          </div>
          {invoice && (
            <textarea
              className="sv-wallet-input sv-wallet-textarea"
              readOnly
              value={invoice}
              rows={4}
              onFocus={(e) => e.target.select()}
            />
          )}
        </>
      )}

      {voucher > 0 && (
        <div className="sv-wallet-voucher">
          <button
            type="button"
            className="linkish"
            onClick={() => setShowVoucher((v) => !v)}
          >
            {showVoucher ? "▾" : "▸"} Sacar ⚡ {voucher.toLocaleString("pt-BR")} sats da
            mentoria (crédito SatVantage)
          </button>
          {showVoucher && (
            <>
              <p className="sv-wallet-copy">
                Isso <strong>não</strong> caiu sozinho na carteira Lightning — ficou como
                voucher na sua conta. A plataforma paga quando você cola a cobrança MutinyNet.
              </p>
              {(claimRef || npubShort) && (
                <p className="sv-wallet-meta">
                  Garantia · conta {npubShort ?? "—"}
                  {claimRef ? (
                    <>
                      {" "}
                      · ref. <code>{claimRef}</code>
                    </>
                  ) : null}
                </p>
              )}
              <p className="sv-wallet-copy">
                Gere cobrança de exatamente{" "}
                <strong>{voucher.toLocaleString("pt-BR")} sats</strong> (<code>lntbs</code>) e
                cole abaixo.
              </p>
              <input
                className="sv-wallet-input"
                placeholder="lntbs1…"
                value={claimBolt}
                onChange={(e) => setClaimBolt(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className="sv-wallet-btn"
                disabled={!claimBolt || busy === "claim"}
                onClick={() => void resgatarVoucher()}
              >
                {busy === "claim" ? "Resgatando…" : "Sacar voucher da mentoria"}
              </button>
            </>
          )}
        </div>
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
