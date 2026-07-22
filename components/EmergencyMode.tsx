"use client";
// Modo Emergência: confirma identidade pela pergunta de segurança (mesma prova
// da recuperação de senha) antes de revogar a carteira Lightning e as corretoras.
import { useEffect, useRef, useState } from "react";
import { hashAnswer } from "@/lib/vault";
import { useI18n } from "@/lib/i18n";
import "./emergency.css";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Chamado depois que o servidor confirma a desconexão. */
  onDisconnected: () => void;
};

type Stage = "loading" | "no-question" | "ask" | "confirming" | "done" | "error";

export default function EmergencyMode({ open, onClose, onDisconnected }: Props) {
  const { t } = useI18n();
  const [stage, setStage] = useState<Stage>("loading");
  const [question, setQuestion] = useState<string | null>(null);
  const [qaSalt, setQaSalt] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setAnswer("");
    setError(null);
    setStage("loading");

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/emergency/question");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.question || !data.qaSalt) {
          setStage("no-question");
          return;
        }
        setQuestion(data.question);
        setQaSalt(data.qaSalt);
        setStage("ask");
      } catch {
        if (!cancelled) setStage("no-question");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && stage !== "confirming") onClose();
    }
    function onPointer(e: MouseEvent) {
      const el = dialogRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target) && stage !== "confirming") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, stage, onClose]);

  if (!open) return null;

  async function confirmar() {
    if (!qaSalt || !answer.trim()) return;
    setError(null);
    setStage("confirming");
    try {
      const answerHash = await hashAnswer(answer, qaSalt);
      const res = await fetch("/api/emergency/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerHash }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(res.status === 401 ? t.dash.emergencyWrongAnswer : t.dash.emergencyGenericError);
        setStage("ask");
        return;
      }
      setStage("done");
      onDisconnected();
    } catch {
      setError(t.dash.emergencyGenericError);
      setStage("ask");
    }
  }

  return (
    <div className="sv-emg-backdrop" role="presentation">
      <div
        ref={dialogRef}
        className="sv-emg-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sv-emg-title"
      >
        <div className="sv-emg-head">
          <h3 id="sv-emg-title">{t.dash.emergencyModalTitle}</h3>
          {stage !== "confirming" && (
            <button
              type="button"
              className="sv-emg-close"
              aria-label={t.dash.emergencyCloseAria}
              onClick={onClose}
            >
              ×
            </button>
          )}
        </div>

        {stage === "loading" && <p className="sv-emg-copy">{t.dash.emergencyQuestionLoading}</p>}

        {stage === "no-question" && (
          <>
            <p className="sv-emg-copy">{t.dash.emergencyNoQuestion}</p>
            <button type="button" className="sv-emg-btn sv-emg-btn--ghost" onClick={onClose}>
              {t.dash.emergencyDone}
            </button>
          </>
        )}

        {(stage === "ask" || stage === "confirming") && (
          <>
            <p className="sv-emg-copy">{t.dash.emergencyModalIntro}</p>
            {question && (
              <p className="sv-emg-question">
                <strong>{question}</strong>
              </p>
            )}
            <label className="sv-emg-label" htmlFor="sv-emg-answer">
              {t.dash.emergencyAnswerLabel}
            </label>
            <input
              id="sv-emg-answer"
              className="sv-emg-input"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t.dash.emergencyAnswerPlaceholder}
              autoComplete="off"
              disabled={stage === "confirming"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && answer.trim() && stage !== "confirming") void confirmar();
              }}
            />
            {error && (
              <p role="alert" className="sv-emg-error">
                {error}
              </p>
            )}
            <div className="sv-emg-actions">
              <button
                type="button"
                className="sv-emg-btn sv-emg-btn--danger"
                disabled={!answer.trim() || stage === "confirming"}
                onClick={() => void confirmar()}
              >
                {stage === "confirming" ? t.dash.emergencyConfirming : t.dash.emergencyConfirm}
              </button>
              <button
                type="button"
                className="sv-emg-btn sv-emg-btn--ghost"
                disabled={stage === "confirming"}
                onClick={onClose}
              >
                {t.dash.emergencyCancel}
              </button>
            </div>
          </>
        )}

        {stage === "done" && (
          <>
            <p className="sv-emg-copy sv-emg-copy--ok">{t.dash.emergencySuccessTitle}</p>
            <p className="sv-emg-copy">{t.dash.emergencySuccessBody}</p>
            <button type="button" className="sv-emg-btn sv-emg-btn--ghost" onClick={onClose}>
              {t.dash.emergencyDone}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
