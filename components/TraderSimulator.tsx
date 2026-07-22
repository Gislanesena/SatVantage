"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadSimState,
  portfolioBrl,
  resetSimState,
  saveSimState,
  type SimState,
} from "@/lib/simulator";

type Props = {
  onBack: () => void;
  disabled?: boolean;
};

function fmtBrl(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

function fmtBtc(n: number) {
  return `${n.toFixed(8)} BTC`;
}

export default function TraderSimulator({ onBack, disabled = false }: Props) {
  const [state, setState] = useState<SimState>(() => defaultClientState());
  const [priceBrl, setPriceBrl] = useState<number | null>(null);
  const [amountBrl, setAmountBrl] = useState("100");
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  function defaultClientState(): SimState {
    if (typeof window === "undefined") {
      return { cashBrl: 10_000, btc: 0, trades: [] };
    }
    return loadSimState();
  }

  const refreshPrice = useCallback(async () => {
    try {
      const res = await fetch("/api/market/btc?range=1m");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "erro");
      setPriceBrl(Number(json.priceBrl) || null);
      setMsg(null);
    } catch {
      setMsg("Não foi possível atualizar o preço agora.");
    } finally {
      setLoadingPrice(false);
    }
  }, []);

  useEffect(() => {
    setState(loadSimState());
    void refreshPrice();
    const id = setInterval(() => void refreshPrice(), 30_000);
    return () => clearInterval(id);
  }, [refreshPrice]);

  function persist(next: SimState) {
    setState(next);
    saveSimState(next);
  }

  function trade(side: "buy" | "sell") {
    if (!priceBrl || priceBrl <= 0) {
      setMsg("Aguarde o preço do Bitcoin carregar.");
      return;
    }
    const brl = Number(String(amountBrl).replace(",", "."));
    if (!Number.isFinite(brl) || brl <= 0) {
      setMsg("Informe um valor em R$ válido.");
      return;
    }

    const btcAmount = brl / priceBrl;

    if (side === "buy") {
      if (brl > state.cashBrl) {
        setMsg("Saldo fictício em R$ insuficiente.");
        return;
      }
      const next: SimState = {
        cashBrl: state.cashBrl - brl,
        btc: state.btc + btcAmount,
        trades: [
          {
            id: `${Date.now()}-buy`,
            side,
            brl,
            btc: btcAmount,
            priceBrl,
            at: new Date().toISOString(),
          },
          ...state.trades,
        ].slice(0, 20),
      };
      persist(next);
      setMsg(`Comprou ${fmtBtc(btcAmount)} (simulado).`);
      return;
    }

    if (btcAmount > state.btc + 1e-12) {
      setMsg("Você não tem BTC fictício suficiente para vender esse valor.");
      return;
    }
    const next: SimState = {
      cashBrl: state.cashBrl + brl,
      btc: Math.max(0, state.btc - btcAmount),
      trades: [
        {
          id: `${Date.now()}-sell`,
          side,
          brl,
          btc: btcAmount,
          priceBrl,
          at: new Date().toISOString(),
        },
        ...state.trades,
      ].slice(0, 20),
    };
    persist(next);
    setMsg(`Vendeu ${fmtBtc(btcAmount)} (simulado).`);
  }

  const total =
    priceBrl != null ? portfolioBrl(state, priceBrl) : state.cashBrl;

  return (
    <div className="sv-sim" aria-label="Simulador de mercado Bitcoin">
      <div className="sv-sim-top">
        <p className="sv-sim-kicker">Prático · Simulador</p>
        <p className="sv-sim-note">Saldo fictício — não é o voucher real da mentoria</p>
      </div>

      <div className="sv-sim-price">
        <span>BTC agora</span>
        <strong>
          {loadingPrice && priceBrl == null
            ? "Carregando…"
            : priceBrl != null
              ? fmtBrl(priceBrl)
              : "—"}
        </strong>
      </div>

      <div className="sv-sim-balances">
        <div>
          <span>Caixa (R$)</span>
          <strong>{fmtBrl(state.cashBrl)}</strong>
        </div>
        <div>
          <span>BTC</span>
          <strong>{fmtBtc(state.btc)}</strong>
        </div>
        <div>
          <span>Patrimônio</span>
          <strong>{fmtBrl(total)}</strong>
        </div>
      </div>

      <label className="sv-sim-field">
        Valor da ordem (R$)
        <input
          type="number"
          min={1}
          step={10}
          value={amountBrl}
          disabled={disabled}
          onChange={(e) => setAmountBrl(e.target.value)}
        />
      </label>

      <div className="sv-sim-actions">
        <button
          type="button"
          className="sv-chat-cta"
          disabled={disabled || priceBrl == null}
          onClick={() => trade("buy")}
        >
          Comprar BTC
        </button>
        <button
          type="button"
          className="sv-chat-cta sv-chat-cta--ghost"
          disabled={disabled || priceBrl == null}
          onClick={() => trade("sell")}
        >
          Vender BTC
        </button>
      </div>

      {msg && <p className="sv-sim-msg">{msg}</p>}

      {state.trades.length > 0 && (
        <ul className="sv-sim-trades" aria-label="Últimas operações">
          {state.trades.slice(0, 5).map((t) => (
            <li key={t.id}>
              {t.side === "buy" ? "Compra" : "Venda"} · {fmtBrl(t.brl)} ·{" "}
              {fmtBtc(t.btc)}
            </li>
          ))}
        </ul>
      )}

      <div className="sv-sim-footer">
        <button
          type="button"
          className="linkish"
          disabled={disabled}
          onClick={() => {
            persist(resetSimState());
            setMsg("Simulador reiniciado com R$ 10.000.");
          }}
        >
          Reiniciar saldo
        </button>
        <button type="button" className="linkish" disabled={disabled} onClick={onBack}>
          Voltar ao chat
        </button>
      </div>
    </div>
  );
}
