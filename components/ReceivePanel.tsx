"use client";
// Receber Lightning (qualquer origem via NWC) + resgate opcional do voucher.
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import QrScanButton from "@/components/QrScanButton";
import InvoiceQr from "@/components/InvoiceQr";
import { isMutinyNetBolt11, MUTINYNET_ONLY_MSG, normalizeBolt11 } from "@/lib/mutinynet";
import "./wallet.css";

type Props = {
  connected: boolean;
  /** Só saque do voucher (sem gerar cobrança de recebimento). */
  mode?: "full" | "sacar";
  onChanged?: () => void;
};

export default function ReceivePanel({ connected, mode = "full", onChanged }: Props) {
  const { t } = useI18n();
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
  /** Resgate manual — abre ao clicar em "Sacar Sat recebidos". */
  const [showManualSaque, setShowManualSaque] = useState(mode === "sacar");

  const sacarOnly = mode === "sacar";

  const load = useCallback(async () => {
    const [w, b] = await Promise.all([
      fetch("/api/wallet/balance"),
      fetch("/api/rewards/balance"),
    ]);
    if (w.ok || w.status === 200) {
      const j = await w.json();
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
        setError(json.error ?? "carteira não respondeu");
        return;
      }
      setReachable(true);
      setWalletErr(null);
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
      setNotice(null);
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

  async function resgatarVoucher(boltOverride?: string) {
    setError(null);
    setNotice(null);

    const bolt = normalizeBolt11(boltOverride ?? claimBolt);
    const lower = bolt.toLowerCase();
    if (lower.startsWith("lnbc")) {
      setError(MUTINYNET_ONLY_MSG);
      return;
    }
    if (!isMutinyNetBolt11(bolt)) {
      setError(MUTINYNET_ONLY_MSG);
      return;
    }

    setBusy("claim");
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bolt11: bolt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (!boltOverride) setClaimBolt("");
      setNotice(`Voucher resgatado: ⚡ ${Number(json.satsPaid).toLocaleString("pt-BR")} sats.`);
      await load();
      onChanged?.();
    } catch (e: any) {
      setError(e.message ?? "falha no resgate");
    } finally {
      setBusy(null);
    }
  }

  async function resgatarAutomatico() {
    setError(null);
    setNotice(null);
    setBusy("auto");

    let invoiceGerado: string;
    try {
      const res = await fetch("/api/wallet/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountSats: voucher,
          description: "Resgate voucher SatVantage",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.invoice) {
        throw new Error(json.error ?? "sem detalhes");
      }
      invoiceGerado = json.invoice;
    } catch (e: any) {
      setError(
        `Não foi possível gerar cobrança na sua carteira (${e.message ?? "erro desconhecido"}). Tente o resgate manual abaixo.`,
      );
      setBusy(null);
      return;
    }

    await resgatarVoucher(invoiceGerado);
  }

  return (
    <section className="sv-wallet" aria-labelledby="sv-receive-title">
      <h2 id="sv-receive-title" className="sv-wallet-title">
        {sacarOnly ? t.dash.withdrawSats : t.dash.receive}
      </h2>
      <p className="sv-wallet-copy">
        {sacarOnly
          ? "Cole ou escaneie uma cobrança Lightning MutinyNet (lntbs) do valor exato do crédito para sacar."
          : t.dash.receiveBody}
      </p>

      {!sacarOnly &&
        (!connected ? null : !reachable ? (
          <div className="sv-wallet-reconnect">
            <p className="sv-wallet-meta">
              Credencial salva, mas a carteira não respondeu agora.
              {walletErr ? ` (${walletErr})` : ""}
            </p>
            <button
              type="button"
              className="sv-wallet-btn"
              disabled={busy === "test"}
              onClick={() => void testarCarteira()}
            >
              {busy === "test" ? "…" : "Testar de novo"}
            </button>
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
                {busy === "inv" ? "…" : t.dash.generateInvoice}
              </button>
              {invoice && (
                <button type="button" className="sv-wallet-btn sv-wallet-btn--ghost" onClick={() => void copiar()}>
                  Copiar
                </button>
              )}
            </div>
            {invoice && (
              <>
                <InvoiceQr value={invoice} label={t.auth.scanToPay} />
                <textarea
                  className="sv-wallet-input sv-wallet-textarea"
                  readOnly
                  value={invoice}
                  rows={4}
                  onFocus={(e) => e.target.select()}
                />
              </>
            )}
          </>
        ))}

      {voucher > 0 && (
        <div className="sv-wallet-voucher">
          {!sacarOnly && (
            <button
              type="button"
              className="linkish"
              onClick={() => setShowVoucher((v) => !v)}
            >
              {showVoucher ? "▾" : "▸"} Crédito SatVantage: ⚡{" "}
              {voucher.toLocaleString("pt-BR")} sats disponíveis
            </button>
          )}
          {(sacarOnly || showVoucher) && (
            <>
              <p className="sv-wallet-meta">
                {sacarOnly ? (
                  <>
                    Crédito disponível: ⚡ {voucher.toLocaleString("pt-BR")} sats
                    {npubShort ? ` (${npubShort})` : ""}
                    {claimRef ? (
                      <>
                        {" "}
                        · ref. <code>{claimRef}</code>
                      </>
                    ) : null}
                    .
                  </>
                ) : (
                  <>
                    Voucher na conta
                    {npubShort ? ` (${npubShort})` : ""}
                    {claimRef ? (
                      <>
                        {" "}
                        · ref. <code>{claimRef}</code>
                      </>
                    ) : null}
                    . Rede de teste: cobrança <code>lntbs</code>.
                  </>
                )}
              </p>

              <div className="sv-wallet-actions">
                {connected && reachable ? (
                  <button
                    type="button"
                    className="sv-wallet-btn"
                    disabled={busy === "auto" || busy === "claim"}
                    onClick={() => void resgatarAutomatico()}
                  >
                    {busy === "auto" || busy === "claim"
                      ? "…"
                      : "Resgatar automaticamente"}
                  </button>
                ) : null}
                {!sacarOnly && (
                  <button
                    type="button"
                    className="sv-wallet-btn"
                    aria-expanded={showManualSaque}
                    onClick={() => setShowManualSaque((v) => !v)}
                  >
                    {t.dash.withdrawSats}
                  </button>
                )}
              </div>

              {(sacarOnly || showManualSaque) && (
                <div className="sv-wallet-saque-manual">
                  {!sacarOnly && (
                    <p className="sv-wallet-copy">
                      Este método <strong>não exige carteira conectada</strong>: o saldo já está
                      disponível na plataforma e pode ser retirado para a carteira de sua
                      preferência. Você também pode conectar uma carteira e usar o{" "}
                      <strong>repasse automático</strong>.
                    </p>
                  )}
                  <QrScanButton
                    onScan={(value) => {
                      const bolt = normalizeBolt11(value);
                      setClaimBolt(bolt);
                      setError(null);
                      setNotice(null);
                      if (bolt && !isMutinyNetBolt11(bolt)) {
                        setError(MUTINYNET_ONLY_MSG);
                      }
                    }}
                  />
                  <input
                    className="sv-wallet-input"
                    placeholder="lntbs1… (MutinyNet)"
                    value={claimBolt}
                    onChange={(e) => {
                      setClaimBolt(e.target.value);
                      setError(null);
                    }}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className="sv-wallet-btn"
                    disabled={!claimBolt || busy === "claim" || busy === "auto"}
                    onClick={() => void resgatarVoucher()}
                  >
                    {busy === "claim" ? "…" : t.dash.withdrawSats}
                  </button>
                </div>
              )}
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
