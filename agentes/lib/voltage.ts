// lib/voltage.ts — o "caixa" do SatVantage: fala com a API da Voltage Payments.
// SÓ roda no servidor (usa a API key). Nunca importar em componente de cliente.
//
// Referência da API: https://voltageapi.com/v1/docs
// Se alguma chamada retornar 404/422, conferir o formato exato lá — a API é
// nova e pode ajustar campos. Os erros são logados por inteiro no terminal
// para facilitar o diagnóstico.

const BASE = "https://voltageapi.com/v1";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variável de ambiente ausente: ${name}`);
  return v;
}

function headers() {
  return {
    "x-api-key": env("VOLTAGE_API_KEY"),
    "Content-Type": "application/json",
  };
}

export interface PaymentResult {
  ok: boolean;
  paymentId?: string;
  status?: string;
  error?: string;
}

/**
 * Paga um invoice Lightning (bolt11) usando a carteira Tesouraria.
 * O envio é assíncrono na Voltage: criamos o pagamento e consultamos o
 * status algumas vezes até concluir (ou estourar o tempo).
 */
export async function payInvoiceFromTreasury(
  bolt11: string,
  amountMsats: number
): Promise<PaymentResult> {
  const org = env("VOLTAGE_ORG_ID");
  const environment = env("VOLTAGE_ENV_ID");
  const walletId = env("VOLTAGE_TREASURY_WALLET_ID");
  const paymentId = crypto.randomUUID();

  const createRes = await fetch(
    `${BASE}/organizations/${org}/environments/${environment}/payments`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        id: paymentId,
        wallet_id: walletId,
        currency: "btc",
        type: "bolt11",
        data: {
          payment_request: bolt11,
          amount_msats: amountMsats,
        },
      }),
    }
  );

  if (!createRes.ok) {
    const text = await createRes.text();
    console.error("VOLTAGE payment create error:", createRes.status, text);
    return { ok: false, error: `Voltage recusou o pagamento (${createRes.status})` };
  }

  // Consulta o status até concluir (máx ~15s)
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const statusRes = await fetch(
      `${BASE}/organizations/${org}/environments/${environment}/payments/${paymentId}`,
      { headers: headers() }
    );
    if (!statusRes.ok) continue;
    const payment = await statusRes.json();
    const status: string = payment.status ?? payment.data?.status ?? "";
    if (["completed", "succeeded", "success"].includes(status)) {
      return { ok: true, paymentId, status };
    }
    if (["failed", "error", "expired"].includes(status)) {
      console.error("VOLTAGE payment failed:", JSON.stringify(payment));
      return {
        ok: false,
        paymentId,
        status,
        error: payment.error ?? "pagamento falhou na rede Lightning",
      };
    }
  }

  return {
    ok: false,
    paymentId,
    status: "timeout",
    error: "o pagamento não confirmou a tempo — confira o painel da Voltage",
  };
}
