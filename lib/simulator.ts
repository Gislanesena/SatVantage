// Paper trading local — saldo fictício, separado do sats_balance real da mentoria.

export const SIM_STORAGE_KEY = "sv_paper_trader_v1";
export const SIM_INITIAL_BRL = 10_000;

export type SimTrade = {
  id: string;
  side: "buy" | "sell";
  brl: number;
  btc: number;
  priceBrl: number;
  at: string;
  reason?: "manual" | "take_profit" | "stop_loss" | "breakeven_stop";
};

/** Posição long aberta com alvos opcionais (preços em BRL). */
export type OpenPosition = {
  qtyBtc: number;
  entryPrice: number;
  takeProfit?: number | null;
  stopLoss?: number | null;
  /** Se o preço atingir este nível, move o stop para o preço de entrada. */
  gainReduce?: number | null;
  breakevenArmed?: boolean;
  openedAt: string;
};

export type SimState = {
  cashBrl: number;
  btc: number;
  trades: SimTrade[];
  startingCashBrl?: number;
  openPosition?: OpenPosition | null;
};

export function defaultSimState(): SimState {
  return {
    cashBrl: SIM_INITIAL_BRL,
    btc: 0,
    trades: [],
    startingCashBrl: SIM_INITIAL_BRL,
    openPosition: null,
  };
}

export function loadSimState(): SimState {
  if (typeof window === "undefined") return defaultSimState();
  try {
    const raw = localStorage.getItem(SIM_STORAGE_KEY);
    if (!raw) return defaultSimState();
    const parsed = JSON.parse(raw) as SimState;
    if (
      typeof parsed.cashBrl !== "number" ||
      typeof parsed.btc !== "number" ||
      !Array.isArray(parsed.trades)
    ) {
      return defaultSimState();
    }
    return {
      ...parsed,
      startingCashBrl:
        typeof parsed.startingCashBrl === "number"
          ? parsed.startingCashBrl
          : SIM_INITIAL_BRL,
      openPosition: parsed.openPosition ?? null,
    };
  } catch {
    return defaultSimState();
  }
}

export function saveSimState(state: SimState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function resetSimState(): SimState {
  const next = defaultSimState();
  saveSimState(next);
  return next;
}

export function portfolioBrl(state: SimState, priceBrl: number): number {
  return state.cashBrl + state.btc * priceBrl;
}

export function resultadoBruto(state: SimState, priceBrl: number): number {
  const start = state.startingCashBrl ?? SIM_INITIAL_BRL;
  return portfolioBrl(state, priceBrl) - start;
}

function closeLong(
  state: SimState,
  priceBrl: number,
  reason: NonNullable<SimTrade["reason"]>,
): SimState {
  const qty = state.btc;
  if (qty <= 0) {
    return { ...state, openPosition: null };
  }
  const brl = qty * priceBrl;
  return {
    ...state,
    cashBrl: state.cashBrl + brl,
    btc: 0,
    openPosition: null,
    trades: [
      {
        id: `${Date.now()}-${reason}`,
        side: "sell",
        brl,
        btc: qty,
        priceBrl,
        at: new Date().toISOString(),
        reason,
      },
      ...state.trades,
    ].slice(0, 30),
  };
}

/**
 * Avalia Gain / Stop / redução de gain na posição aberta.
 * Retorna novo estado + mensagem, ou null se nada mudou.
 */
export function evaluateExits(
  state: SimState,
  priceBrl: number,
): { state: SimState; message: string } | null {
  const pos = state.openPosition;
  if (!pos || state.btc <= 0 || !(priceBrl > 0)) return null;

  let nextPos = { ...pos };

  if (
    nextPos.gainReduce != null &&
    nextPos.gainReduce > 0 &&
    !nextPos.breakevenArmed &&
    priceBrl >= nextPos.gainReduce
  ) {
    nextPos = {
      ...nextPos,
      stopLoss: nextPos.entryPrice,
      breakevenArmed: true,
    };
    const armed: SimState = { ...state, openPosition: nextPos };
    // Continua checando TP/SL no mesmo tick
    const after = evaluateExits(armed, priceBrl);
    if (after) return after;
    return {
      state: armed,
      message: `Redução de gain: stop movido para break-even (${nextPos.entryPrice.toFixed(2)}).`,
    };
  }

  if (nextPos.takeProfit != null && nextPos.takeProfit > 0 && priceBrl >= nextPos.takeProfit) {
    const closed = closeLong(state, priceBrl, "take_profit");
    return {
      state: closed,
      message: `Take profit atingido @ ${priceBrl.toFixed(2)} — posição encerrada.`,
    };
  }

  if (nextPos.stopLoss != null && nextPos.stopLoss > 0 && priceBrl <= nextPos.stopLoss) {
    const reason = nextPos.breakevenArmed ? "breakeven_stop" : "stop_loss";
    const closed = closeLong(state, priceBrl, reason);
    return {
      state: closed,
      message:
        reason === "breakeven_stop"
          ? `Stop no break-even @ ${priceBrl.toFixed(2)} — posição encerrada.`
          : `Stop loss atingido @ ${priceBrl.toFixed(2)} — posição encerrada.`,
    };
  }

  if (nextPos !== pos) {
    return { state: { ...state, openPosition: nextPos }, message: "" };
  }

  return null;
}
