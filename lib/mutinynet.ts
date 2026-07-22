// lib/mutinynet.ts — SatVantage demo: só MutinyNet (testnet Lightning), nunca mainnet.

/** bolt11 MutinyNet começa com lntbs (não lnbc de mainnet). */
export function isMutinyNetBolt11(bolt11: string): boolean {
  const s = bolt11.trim().toLowerCase();
  const raw = s.startsWith("lightning:") ? s.slice("lightning:".length) : s;
  return raw.startsWith("lntbs");
}

export function normalizeBolt11(bolt11: string): string {
  let s = bolt11.trim();
  if (s.toLowerCase().startsWith("lightning:")) {
    s = s.slice("lightning:".length).trim();
  }
  const q = s.indexOf("?");
  if (q > 0) s = s.slice(0, q);
  return s;
}

export const MUTINYNET_ONLY_MSG =
  "Use só cobrança MutinyNet (rede de teste), que começa com lntbs… — cobranças reais (lnbc) não são aceitas nesta demo.";

export const MUTINYNET_WALLET_MSG =
  "Conecte uma carteira MutinyNet (rede de teste) via NWC. Cobranças e pagamentos reais (mainnet) não são usados nesta demo.";
