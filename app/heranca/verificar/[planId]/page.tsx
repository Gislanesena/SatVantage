import { supabaseAdmin } from "@/lib/supabase";
import { verificarCarimbo } from "@/lib/heranca";
import "./verificar.css";

export const dynamic = "force-dynamic";

type Props = { params: { planId: string } };

export default async function HerancaVerificarPage({ params }: Props) {
  const planId = params.planId;

  const { data: plan } = await supabaseAdmin
    .from("inheritance_plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();

  if (!plan) {
    return (
      <main className="sv-doc">
        <h1>Documento não encontrado</h1>
        <p>O link pode estar incompleto ou o plano foi removido.</p>
      </main>
    );
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("npub")
    .eq("id", plan.user_id)
    .single();

  const { data: heirs } = await supabaseAdmin
    .from("heirs")
    .select("name, percent, email, telefone, npub")
    .eq("plan_id", plan.id)
    .order("name", { ascending: true });

  let otsStatus = "—";
  let otsMsg = "Plano ainda sem carimbo OpenTimestamps.";
  if (plan.doc_sha256 && plan.ots_receipt) {
    const v = await verificarCarimbo(plan.doc_sha256, plan.ots_receipt);
    otsStatus = v.status === "confirmado" ? "Confirmado" : v.status === "pendente" ? "Pendente" : "Erro";
    otsMsg = v.mensagem;
  }

  const hash = plan.doc_sha256 || "";
  const hashShort = hash ? `${hash.slice(0, 12)}…${hash.slice(-12)}` : "—";

  return (
    <main className="sv-doc">
      <header className="sv-doc-head">
        <p className="sv-doc-brand">SatVantage</p>
        <h1>Documento de Sucessão Digital</h1>
        <p className="sv-doc-sub">Prova documental verificável — sem custódia de chaves</p>
      </header>

      <section className="sv-doc-block">
        <h2>Titular</h2>
        <p className="sv-doc-mono">{user?.npub || "—"}</p>
        <p className="sv-doc-muted">
          Criado em {plan.created_at ? new Date(plan.created_at).toLocaleString("pt-BR") : "—"}
        </p>
      </section>

      {plan.status === "ativado" && (
        <section className="sv-doc-alert" role="alert">
          <strong>
            ⚠️ Este plano foi ativado em{" "}
            {plan.triggered_at
              ? new Date(plan.triggered_at).toLocaleString("pt-BR")
              : "data registrada"}{" "}
            após período de inatividade do titular, com múltiplos avisos prévios enviados sem
            resposta.
          </strong>
          <p>
            O SatVantage não custodia fundos nem move bitcoins. Este documento é uma prova
            cripto-verificável (hash ancorado na blockchain do Bitcoin) para apresentar a
            corretoras, família ou advogado.
          </p>
        </section>
      )}

      <section className="sv-doc-block">
        <h2>Herdeiros cadastrados</h2>
        <table className="sv-doc-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>%</th>
              <th>E-mail</th>
              <th>Telefone</th>
            </tr>
          </thead>
          <tbody>
            {(heirs || []).map((h, i) => (
              <tr key={i}>
                <td>{h.name}</td>
                <td>{Number(h.percent).toFixed(2)}</td>
                <td>{h.email || "—"}</td>
                <td>{h.telefone || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sv-doc-block">
        <h2>Prova criptográfica</h2>
        <p>
          Hash SHA-256:{" "}
          <abbr title={hash || undefined} className="sv-doc-mono">
            {hashShort}
          </abbr>
        </p>
        {hash && (
          <details>
            <summary>Ver hash completo</summary>
            <p className="sv-doc-mono sv-doc-break">{hash}</p>
          </details>
        )}
        <p>
          OpenTimestamps: <strong>{otsStatus}</strong>
        </p>
        <p className="sv-doc-muted">{otsMsg}</p>
        {plan.stamped_at && (
          <p className="sv-doc-muted">
            Carimbado em {new Date(plan.stamped_at).toLocaleString("pt-BR")}
          </p>
        )}
      </section>

      <footer className="sv-doc-foot">
        Status do plano: {plan.status}. Documento público — SatVantage não guarda chaves privadas.
      </footer>
    </main>
  );
}
