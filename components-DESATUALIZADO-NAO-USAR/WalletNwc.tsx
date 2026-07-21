"use client";
// Carteira NWC: conectar → testar → saldo → enviar COM FRICÇÃO.
// Credencial salva ≠ “sempre online no relay”. UI mantém envio mesmo com relay lento.
import { useEffect, useState } from "react";
import "./wallet.css";

type Props = {
  embedded?: boolean;
  onChanged?: () => void;
};

type WalletState = {
  connected: boolean;
  reachable?: boolean;
  stale?: boolean;
  label?: string;
  balanceSats?: number;
  error?: string;
};

const COOLDOWN_KEY = "sv_nwc_cooldown_until";

function readCooldown(): number {
  try {
    return Number(localStorage.getItem(COOLDOWN_KEY) || 0);
  } catch {
    return 0;
  }
}

function setCooldown(ms = 90_000) {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + ms));
  } catch {
    /* ignore */
  }
}

function looksLikeBan(msg: string) {
  const m = msg.toLowerCase();
  return m.includes("bloqueou temporariamente") || m.includes("temp-banned") || m.includes("2 minutos");
}

export default function WalletNwc({ embedded, onChanged }: Props) {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [connStr, setConnStr] = useState("");
  const [bolt11, setBolt11] = useState("");
  const [friction, setFriction] = useState<{ message: string; stats?: any } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReplace, setShowReplace] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  async function load() {
    const res = await fetch("/api/wallet/balance");
    if (res.status === 401) return;
    const json = (await res.json().catch(() => ({ connected: false }))) as WalletState;
    setWallet(json);
    onChanged?.();
  }

  useEffect(() => {
    setCooldownUntil(readCooldown());
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const cooling = cooldownLeft > 0;

  function applyBanCooldown(msg: string) {
    if (!looksLikeBan(msg)) return;
    setCooldown(90_000);
    setCooldownUntil(Date.now() + 90_000);
  }

  async function conectar() {
    if (cooling) {
      setError(`Espere ${cooldownLeft}s — o relay ainda pode estar bloqueando tentativas.`);
      return;
    }
    setError(null);
    setNotice(null);
    setBusy("connect");
    try {
      const res = await fetch("/api/wallet/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString: connStr }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setConnStr("");
      setShowReplace(false);
      setNotice("Carteira salva. A credencial fica aqui — o relay que às vezes oscila.");
      await load();
    } catch (e: any) {
      const msg = e.message ?? "falha ao conectar";
      setError(msg);
      applyBanCooldown(msg);
    } finally {
      setBusy(null);
    }
  }

  async function testar() {
    if (cooling) {
      setError(`Espere ${cooldownLeft}s antes de testar de novo.`);
      return;
    }
    setError(null);
    setNotice(null);
    setBusy("test");
    try {
      const res = await fetch("/api/wallet/test", { method: "POST" });
      const json = await res.json();
      if (!json.ok) {
        const msg = json.error ?? "sem resposta";
        setWallet((w) =>
          w
            ? { ...w, reachable: false, error: msg }
            : { connected: true, reachable: false, error: msg },
        );
        setError(msg);
        applyBanCooldown(msg);
        return;
      }
      setWallet({
        connected: true,
        reachable: true,
        label: json.label,
        balanceSats: json.balanceSats,
      });
      setNotice(
        `Relay ok · saldo ⚡ ${Number(json.balanceSats ?? 0).toLocaleString("pt-BR")} sats`,
      );
      onChanged?.();
    } catch (e: any) {
      const msg = e.message ?? "falha ao testar";
      setError(msg);
      applyBanCooldown(msg);
    } finally {
      setBusy(null);
    }
  }

  async function enviar(confirm: boolean) {
    setError(null);
    setBusy("pay");
    try {
      const res = await fetch("/api/wallet/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bolt11, confirm }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      if (json.friction) {
        setFriction({ message: json.message, stats: json.stats });
        return;
      }

      setFriction(null);
      setBolt11("");
      setNotice(`Enviado: ${json.amountSats.toLocaleString("pt-BR")} sats.`);
      await load();
    } catch (e: any) {
      const msg = e.message ?? "falha no envio";
      setError(msg);
      applyBanCooldown(msg);
    } finally {
      setBusy(null);
    }
  }

  async function desconectar() {
    setBusy("disc");
    setError(null);
    await fetch("/api/wallet/disconnect", { method: "POST" });
    setBusy(null);
    setShowReplace(false);
    setNotice("Conexão revogada.");
    await load();
  }

  if (!wallet) {
    return <p className="sv-wallet-loading">Carregando carteira…</p>;
  }

  if (friction) {
    return (
      <section className="sv-wallet sv-wallet--friction" aria-labelledby="sv-friction-title">
        <h2 id="sv-friction-title" className="sv-wallet-title">
          Um momento antes de enviar
        </h2>
        <p className="sv-wallet-copy">{friction.message}</p>
        {friction.stats?.mediaSats != null && (
          <p className="sv-wallet-meta">
            Sua média: {friction.stats.mediaSats.toLocaleString("pt-BR")} sats · Este envio:{" "}
            {friction.stats.valorSats.toLocaleString("pt-BR")} sats
          </p>
        )}
        <div className="sv-wallet-actions">
          <button
            type="button"
            className="sv-wallet-btn"
            onClick={() => void enviar(true)}
            disabled={busy === "pay"}
          >
            {busy === "pay" ? "Enviando…" : "Entendo, quero enviar"}
          </button>
          <button
            type="button"
            className="sv-wallet-btn sv-wallet-btn--ghost"
            onClick={() => {
              setFriction(null);
              setNotice("Envio cancelado. Decidir com calma é proteção.");
            }}
          >
            Cancelar envio
          </button>
        </div>
        <p className="sv-wallet-footnote">A decisão é sua — nós nunca bloqueamos.</p>
      </section>
    );
  }

  if (!wallet.connected) {
    return (
      <section className="sv-wallet" aria-labelledby="sv-wallet-connect-title">
        <h2 id="sv-wallet-connect-title" className="sv-wallet-title">
          {embedded ? "Conectar para enviar" : "Conectar minha carteira"}
        </h2>
        <p className="sv-wallet-copy">
          Cole a credencial <strong>Nostr Wallet Connect</strong>. Ela fica salva cifrada.
        </p>
        <input
          className="sv-wallet-input"
          placeholder="nostr+walletconnect://…"
          value={connStr}
          onChange={(e) => setConnStr(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="sv-wallet-actions">
          <button
            type="button"
            className="sv-wallet-btn"
            onClick={() => void conectar()}
            disabled={!connStr || busy === "connect" || cooling}
          >
            {busy === "connect"
              ? "Testando…"
              : cooling
                ? `Aguarde ${cooldownLeft}s`
                : "Conectar e testar"}
          </button>
        </div>
        {notice && <p className="sv-wallet-notice">{notice}</p>}
        {error && (
          <p role="alert" className="sv-wallet-error">
            {error}
          </p>
        )}
      </section>
    );
  }

  const relaySlow = wallet.reachable === false;

  return (
    <section className="sv-wallet" aria-labelledby="sv-wallet-label">
      <div className="sv-wallet-head">
        <h2 id="sv-wallet-label" className="sv-wallet-title">
          {embedded ? "Enviar pagamento" : wallet.label || "Minha carteira"}
        </h2>
        <span className={`sv-wallet-status${relaySlow ? " is-warn" : " is-on"}`}>
          {relaySlow ? "Salva · relay lento" : "Conectada"}
        </span>
      </div>

      {wallet.balanceSats != null && (
        <p className="sv-wallet-balance">
          ⚡ {wallet.balanceSats.toLocaleString("pt-BR")} sats
          {wallet.stale || relaySlow ? (
            <span className="sv-wallet-meta"> · último saldo conhecido</span>
          ) : null}
        </p>
      )}

      {relaySlow && (
        <div className="sv-wallet-reconnect">
          <p className="sv-wallet-copy">
            Sua carteira continua vinculada. O relay só não respondeu agora — comum e
            temporário. Pode tentar enviar mesmo assim, ou testar de novo daqui a pouco.
          </p>
          {(wallet.error || error) && (
            <p className="sv-wallet-error" role="status">
              {error || wallet.error}
            </p>
          )}
          <div className="sv-wallet-actions">
            <button
              type="button"
              className="sv-wallet-btn sv-wallet-btn--ghost"
              onClick={() => void testar()}
              disabled={busy === "test" || cooling}
            >
              {busy === "test"
                ? "Testando…"
                : cooling
                  ? `Aguarde ${cooldownLeft}s`
                  : "Testar relay"}
            </button>
            <button
              type="button"
              className="sv-wallet-btn sv-wallet-btn--ghost"
              onClick={() => {
                setShowReplace((v) => !v);
                setError(null);
              }}
            >
              {showReplace ? "Cancelar" : "Trocar credencial"}
            </button>
          </div>
          {showReplace && (
            <>
              <input
                className="sv-wallet-input"
                placeholder="nostr+walletconnect://…"
                value={connStr}
                onChange={(e) => setConnStr(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className="sv-wallet-btn"
                onClick={() => void conectar()}
                disabled={!connStr || busy === "connect" || cooling}
              >
                {busy === "connect" ? "Salvando…" : "Salvar nova credencial"}
              </button>
            </>
          )}
        </div>
      )}

      <p className="sv-wallet-copy">Cole a cobrança Lightning de quem vai receber:</p>
      <input
        className="sv-wallet-input"
        placeholder="lnbc… / lntbs…"
        value={bolt11}
        onChange={(e) => setBolt11(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <div className="sv-wallet-actions">
        <button
          type="button"
          className="sv-wallet-btn"
          onClick={() => void enviar(false)}
          disabled={!bolt11 || busy === "pay"}
        >
          {busy === "pay" ? "Verificando…" : "Enviar"}
        </button>
        {!relaySlow && (
          <button
            type="button"
            className="sv-wallet-btn sv-wallet-btn--ghost"
            onClick={() => void testar()}
            disabled={busy === "test" || cooling}
          >
            {busy === "test" ? "Testando…" : "Atualizar saldo"}
          </button>
        )}
        <button
          type="button"
          className="sv-wallet-btn sv-wallet-btn--ghost"
          onClick={() => void desconectar()}
          disabled={busy === "disc"}
        >
          Revogar
        </button>
      </div>

      {notice && <p className="sv-wallet-notice">{notice}</p>}
      {error && !relaySlow && (
        <p role="alert" className="sv-wallet-error">
          {error}
        </p>
      )}
    </section>
  );
}
