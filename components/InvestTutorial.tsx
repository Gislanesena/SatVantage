"use client";

import { useState } from "react";
import { INVEST_TUTORIAL_STEPS } from "@/lib/invest-tutorial";

type Props = {
  onBack: () => void;
  onStartQuiz: () => void;
  disabled?: boolean;
};

export default function InvestTutorial({
  onBack,
  onStartQuiz,
  disabled = false,
}: Props) {
  const [step, setStep] = useState(0);
  const total = INVEST_TUTORIAL_STEPS.length;
  const current = INVEST_TUTORIAL_STEPS[step];
  const isLast = step >= total - 1;

  return (
    <div className="sv-tutorial" aria-label="Tutorial visual de como investir">
      <div className="sv-tutorial-top">
        <p className="sv-tutorial-kicker">Teórico · Como investir</p>
        <p className="sv-tutorial-progress">
          Passo {step + 1} de {total}
        </p>
      </div>

      <h2 className="sv-tutorial-title">{current.title}</h2>
      <p className="sv-tutorial-body">{current.body}</p>
      {current.tip && <p className="sv-tutorial-tip">{current.tip}</p>}

      <div className="sv-tutorial-dots" aria-hidden>
        {INVEST_TUTORIAL_STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`sv-tutorial-dot${i === step ? " is-on" : ""}${i < step ? " is-done" : ""}`}
          />
        ))}
      </div>

      <div className="sv-tutorial-actions">
        {step > 0 && (
          <button
            type="button"
            className="sv-chat-cta sv-chat-cta--ghost"
            disabled={disabled}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Anterior
          </button>
        )}
        {!isLast ? (
          <button
            type="button"
            className="sv-chat-cta"
            disabled={disabled}
            onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
          >
            Próximo
          </button>
        ) : (
          <button
            type="button"
            className="sv-chat-cta"
            disabled={disabled}
            onClick={onStartQuiz}
          >
            Fazer quiz e ganhar sats
          </button>
        )}
      </div>

      <div className="sv-tutorial-footer">
        <button
          type="button"
          className="linkish"
          disabled={disabled}
          onClick={onStartQuiz}
        >
          Pular para o quiz
        </button>
        <button type="button" className="linkish" disabled={disabled} onClick={onBack}>
          Voltar ao chat
        </button>
      </div>
    </div>
  );
}
