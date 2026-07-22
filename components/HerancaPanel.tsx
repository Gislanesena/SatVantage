"use client";
// Painel de herança no dashboard — prova documental + prova de vida.
// SatVantage NÃO custodia chaves nem move bitcoins neste módulo.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import "./heranca.css";

type Heir = {
  id: string;
  name: string;
  email?: string | null;
  telefone?: string | null;
  npub?: string | null;
  percent: number;
  contacts_confirmed_at?: string | null;
};

type Plan = {
  id: string;
  status: string;
  doc_sha256?: string | null;
  ots_receipt?: string | null;
  stamped_at?: string | null;
  last_checkin_at?: string | null;
  checkin_interval_days?: number;
  titular_email?: string | null;
  reminder_stage?: number;
  triggered_at?: string | null;
};

type DraftHeir = {
  name: string;
  email: string;
  telefone: string;
  npub: string;
  percent: string;
};

const emptyDraft = (): DraftHeir => ({
  name: "",
  email: "",
  telefone: "",
  npub: "",
  percent: "",
});

export default function HerancaPanel({
  onCheckinSuccess,
}: {
  onCheckinSuccess?: () => void;
} = {}) {
  const { t } = useI18n();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [minutosRestantes, setMinutosRestantes] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftHeir>(emptyDraft());
  const [titularEmail, setTitularEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  const [otsMsg, setOtsMsg] = useState<string | null>(null);
  const [otsStatus, setOtsStatus] = useState<string | null>(null);
  const [confirmIds, setConfirmIds] = useState<Record<string, boolean>>({});

  const totalPercent = useMemo(
    () => heirs.reduce((s, h) => s + Number(h.percent || 0), 0),
    [heirs],
  );

  const load = useCallback(async () => {
    const res = await fetch("/api/heranca/plan");
    if (res.status === 401) return;
    const json = await res.json().catch(() => ({}));
    setPlan(json.plan ?? null);
    setHeirs(json.heirs ?? []);
    setMinutosRestantes(json.minutosRestantes ?? json.diasRestantes ?? null);
    setTitularEmail(json.plan?.titular_email ?? "");
    const map: Record<string, boolean> = {};
    for (const h of json.heirs ?? []) map[h.id] = true;
    setConfirmIds(map);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveTitularEmail() {
    setError(null);
    setBusy("email");
    try {
      const res = await fetch("/api/heranca/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titularEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPlan(json.plan);
      setNotice("E-mail de lembretes salvo.");
    } catch (e: any) {
      setError(e.message ?? "falha ao salvar e-mail");
    } finally {
      setBusy(null);
    }
  }

  async function addHeir() {
    setError(null);
    const percent = Number(draft.percent);
    if (!draft.name.trim() || !draft.email.trim() || !percent) {
      setError("Preencha nome, e-mail e percentual.");
      return;
    }
    if (totalPercent + percent > 100) {
      setError("A soma dos percentuais não pode passar de 100%.");
      return;
    }
    setBusy("heir");
    try {
      const res = await fetch("/api/heranca/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heirs: [
            {
              name: draft.name,
              email: draft.email,
              telefone: draft.telefone || undefined,
              npub: draft.npub || undefined,
              percent,
            },
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPlan(json.plan);
      setHeirs(json.heirs ?? []);
      setMinutosRestantes(json.minutosRestantes ?? json.diasRestantes ?? null);
      setDraft(emptyDraft());
      setNotice("Herdeiro cadastrado.");
    } catch (e: any) {
      setError(e.message ?? "falha ao cadastrar herdeiro");
    } finally {
      setBusy(null);
    }
  }

  async function removeHeir(id: string) {
    setError(null);
    setBusy("heir");
    try {
      const res = await fetch("/api/heranca/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heirs: [{ id, remove: true }] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPlan(json.plan);
      setHeirs(json.heirs ?? []);
    } catch (e: any) {
      setError(e.message ?? "falha ao remover");
    } finally {
      setBusy(null);
    }
  }

  async function stamp() {
    setError(null);
    setBusy("stamp");
    setOtsMsg(null);
    try {
      const res = await fetch("/api/heranca/stamp", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOtsStatus("pendente");
      setOtsMsg(json.verificacao?.mensagem || "Carimbo enviado (pendente na blockchain).");
      await load();
      setNotice("Plano carimbado. A confirmação na blockchain pode levar horas.");
    } catch (e: any) {
      setError(e.message ?? "falha ao carimbar");
    } finally {
      setBusy(null);
    }
  }

  async function verifyStamp() {
    setBusy("verify");
    setError(null);
    try {
      const res = await fetch("/api/heranca/stamp");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOtsStatus(json.status);
      setOtsMsg(json.mensagem);
    } catch (e: any) {
      setError(e.message ?? "falha ao verificar");
    } finally {
      setBusy(null);
    }
  }

  async function checkin() {
    setError(null);
    setBusy("checkin");
    try {
      const ids = Object.entries(confirmIds)
        .filter(([, v]) => v)
        .map(([id]) => id);
      const res = await fetch("/api/heranca/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmedHeirIds: ids }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setNotice("Prova de vida confirmada. Obrigado.");
      await load();
      onCheckinSuccess?.();
    } catch (e: any) {
      setError(e.message ?? "falha no check-in");
    } finally {
      setBusy(null);
    }
  }

  const urgencia =
    minutosRestantes == null
      ? null
      : minutosRestantes <= 10
        ? "crit"
        : minutosRestantes <= 20
          ? "warn"
          : "ok";

  return (
    <section className="sv-heranca" aria-labelledby="sv-heranca-title">
      <div className="sv-heranca-head">
        <h2 id="sv-heranca-title" className="sv-heranca-title">
          Herança digital
        </h2>
        <button type="button" className="sv-heranca-link" onClick={() => setHowOpen(true)}>
          {t.dash.estateHowTitle}
        </button>
      </div>
      <p className="sv-heranca-copy">
        Organize herdeiros e prove o plano com a blockchain — sem custodiar chaves nem mover
        bitcoins.
      </p>

      {/* Cadastro de herdeiros */}
      <div className="sv-heranca-card">
        <h3>Herdeiros</h3>
        <p className="sv-heranca-meta">
          Soma dos percentuais:{" "}
          <strong className={totalPercent > 100 ? "is-bad" : undefined}>
            {totalPercent.toFixed(2)}%
          </strong>
          {totalPercent > 100 ? " — acima de 100%" : ""}
        </p>
        <ul className="sv-heranca-list">
          {heirs.map((h) => (
            <li key={h.id}>
              <div>
                <strong>{h.name}</strong> · {Number(h.percent).toFixed(2)}%
                <div className="sv-heranca-meta">
                  {h.email}
                  {h.telefone ? ` · ${h.telefone}` : ""}
                  {h.npub ? ` · ${h.npub.slice(0, 12)}…` : ""}
                </div>
              </div>
              <button type="button" className="sv-heranca-ghost" onClick={() => void removeHeir(h.id)}>
                Remover
              </button>
            </li>
          ))}
          {heirs.length === 0 && <li className="sv-heranca-meta">Nenhum herdeiro ainda.</li>}
        </ul>

        <div className="sv-heranca-form">
          <input
            placeholder="Nome"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <input
            placeholder="E-mail (obrigatório)"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
          />
          <input
            placeholder="Telefone (opcional)"
            value={draft.telefone}
            onChange={(e) => setDraft({ ...draft, telefone: e.target.value })}
          />
          <input
            placeholder="npub (opcional)"
            value={draft.npub}
            onChange={(e) => setDraft({ ...draft, npub: e.target.value })}
          />
          <input
            placeholder="% (ex: 50)"
            type="number"
            min={0.01}
            max={100}
            step="0.01"
            value={draft.percent}
            onChange={(e) => setDraft({ ...draft, percent: e.target.value })}
          />
          <button
            type="button"
            className="sv-heranca-btn"
            disabled={busy === "heir" || totalPercent >= 100}
            onClick={() => void addHeir()}
          >
            {busy === "heir" ? "…" : "Adicionar herdeiro"}
          </button>
        </div>
        <p className="sv-heranca-consent">
          Ao cadastrar, você confirma que o herdeiro pode ser contactado por esses canais em caso
          de ativação do plano.
        </p>
      </div>

      {/* Carimbo */}
      <div className="sv-heranca-card">
        <h3>Carimbar plano na blockchain</h3>
        <p className="sv-heranca-meta">
          Status: <strong>{plan?.status || "rascunho"}</strong>
          {plan?.stamped_at
            ? ` · carimbado em ${new Date(plan.stamped_at).toLocaleString("pt-BR")}`
            : ""}
        </p>
        {plan?.doc_sha256 && (
          <p className="sv-heranca-mono">{plan.doc_sha256.slice(0, 20)}…</p>
        )}
        {otsMsg && (
          <p className="sv-heranca-meta">
            OpenTimestamps ({otsStatus || "—"}): {otsMsg}
          </p>
        )}
        <div className="sv-heranca-actions">
          <button
            type="button"
            className="sv-heranca-btn"
            disabled={busy === "stamp" || heirs.length < 1}
            onClick={() => void stamp()}
          >
            {busy === "stamp" ? "Carimbando…" : "Carimbar plano"}
          </button>
          <button
            type="button"
            className="sv-heranca-ghost"
            disabled={busy === "verify" || !plan?.ots_receipt}
            onClick={() => void verifyStamp()}
          >
            {busy === "verify" ? "…" : "Verificar agora"}
          </button>
          {plan?.id && (
            <a
              className="sv-heranca-link"
              href={`/heranca/verificar/${plan.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Ver documento público
            </a>
          )}
        </div>
      </div>

      {/* Prova de vida */}
      <div className="sv-heranca-card">
        <h3>Prova de vida</h3>
        <p className="sv-heranca-meta">
          Só para lembretes — sem este e-mail, você confirma direto por aqui. Sem ele, o sistema
          não consegue avisar antes de notificar herdeiros.
        </p>
        <div className="sv-heranca-form sv-heranca-form--row">
          <input
            type="email"
            placeholder="Seu e-mail de lembretes (opcional)"
            value={titularEmail}
            onChange={(e) => setTitularEmail(e.target.value)}
          />
          <button
            type="button"
            className="sv-heranca-ghost"
            disabled={busy === "email"}
            onClick={() => void saveTitularEmail()}
          >
            Salvar e-mail
          </button>
        </div>
        <p className={`sv-heranca-days${urgencia ? ` is-${urgencia}` : ""}`}>
          {plan?.last_checkin_at
            ? `Último check-in: ${new Date(plan.last_checkin_at).toLocaleString("pt-BR")}`
            : "Ainda sem check-in registrado."}
          {minutosRestantes != null
            ? ` · Faltam ~${minutosRestantes} min no prazo (demo: 50 min total)`
            : ""}
        </p>
        {heirs.length > 0 && (
          <div className="sv-heranca-confirm">
            <p className="sv-heranca-meta">Confirmar que os contatos dos herdeiros seguem corretos:</p>
            {heirs.map((h) => (
              <label key={h.id} className="sv-heranca-check">
                <input
                  type="checkbox"
                  checked={!!confirmIds[h.id]}
                  onChange={(e) =>
                    setConfirmIds((m) => ({ ...m, [h.id]: e.target.checked }))
                  }
                />
                {h.name} ({h.email})
              </label>
            ))}
          </div>
        )}
        <button
          type="button"
          className="sv-heranca-btn"
          disabled={busy === "checkin" || !plan}
          onClick={() => void checkin()}
        >
          {busy === "checkin" ? "…" : "✅ Confirmar que estou bem"}
        </button>
      </div>

      {notice && <p className="sv-heranca-notice">{notice}</p>}
      {error && (
        <p className="sv-heranca-error" role="alert">
          {error}
        </p>
      )}

      {howOpen && (
        <div className="sv-heranca-modal" role="dialog" aria-modal="true" aria-labelledby="sv-heranca-how-title">
          <div className="sv-heranca-modal-card">
            <button
              type="button"
              className="sv-heranca-modal-close"
              aria-label={t.dash.estateHowClose}
              title={t.dash.estateHowClose}
              onClick={() => setHowOpen(false)}
            >
              ×
            </button>
            <h3 id="sv-heranca-how-title">{t.dash.estateHowTitle}</h3>
            <div className="sv-heranca-how">
              <article>
                <h4>{t.dash.estateHowKeysTitle}</h4>
                <p>{t.dash.estateHowKeysBody}</p>
              </article>
              <article>
                <h4>{t.dash.estateHowDocTitle}</h4>
                <p>{t.dash.estateHowDocBody}</p>
              </article>
              <article>
                <h4>{t.dash.estateHowPlatformTitle}</h4>
                <p>{t.dash.estateHowPlatformBody}</p>
              </article>
              <article>
                <h4>{t.dash.estateHowHeirTitle}</h4>
                <p>{t.dash.estateHowHeirBody}</p>
              </article>
              <article>
                <h4>{t.dash.estateHowContactsTitle}</h4>
                <p>{t.dash.estateHowContactsBody}</p>
              </article>
            </div>
            <div className="sv-heranca-timeline">
              <p>
                <strong>{t.dash.estateHowTimeline}</strong>
              </p>
            </div>
            <p className="sv-heranca-ext">
              <strong>{t.dash.estateHowExtTip}</strong>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
