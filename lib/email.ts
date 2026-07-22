// lib/email.ts — envio via Resend (fetch). Falha nunca trava o chamador.

export async function enviarEmailResend(opts: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY ausente — e-mail não enviado:", opts.subject);
    return { ok: false, error: "RESEND_API_KEY ausente" };
  }

  const from =
    opts.from?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "SatVantage <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] Resend falhou:", res.status, body.slice(0, 400));
      return { ok: false, error: `Resend ${res.status}` };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("[email] erro ao enviar:", e?.message || e);
    return { ok: false, error: e?.message || "falha no envio" };
  }
}
