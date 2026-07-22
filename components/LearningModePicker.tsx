"use client";

type Props = {
  onSelectTeorico: () => void;
  onSelectPratico: () => void;
  onBack: () => void;
  disabled?: boolean;
};

export default function LearningModePicker({
  onSelectTeorico,
  onSelectPratico,
  onBack,
  disabled = false,
}: Props) {
  return (
    <div className="sv-learn-pick" role="group" aria-label="Escolha o modo de aprendizado">
      <p className="sv-learn-pick-title">Como você quer treinar agora?</p>
      <p className="sv-learn-pick-sub">
        Teórico reforça conceitos. Prático simula o mercado com saldo fictício.
      </p>

      <div className="sv-learn-pick-actions">
        <button
          type="button"
          className="sv-chat-cta"
          disabled={disabled}
          onClick={onSelectTeorico}
        >
          Teórico
        </button>
        <button
          type="button"
          className="sv-chat-cta sv-chat-cta--ghost"
          disabled={disabled}
          onClick={onSelectPratico}
        >
          Prático
        </button>
      </div>

      <button
        type="button"
        className="linkish sv-learn-pick-back"
        disabled={disabled}
        onClick={onBack}
      >
        Voltar ao chat
      </button>
    </div>
  );
}
