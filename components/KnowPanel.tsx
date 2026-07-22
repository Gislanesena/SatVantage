"use client";
// Dúvidas importantes — clicam e abrem no chat do mentor.
import { KNOW_QUESTIONS } from "@/lib/optional-topics";
import { useI18n } from "@/lib/i18n";
import "./know.css";

type Props = {
  onAsk: (topicId: string) => void;
};

const KNOW_LABEL_KEY = {
  "imposto-quando": "qImpostoQuando",
  "ir-2027": "qIr2027",
  "patrimonio-crypto": "qPatrimonio",
  "informe-corretora": "qInforme",
} as const;

export default function KnowPanel({ onAsk }: Props) {
  const { t } = useI18n();

  function labelFor(id: string, fallback: string) {
    const key = KNOW_LABEL_KEY[id as keyof typeof KNOW_LABEL_KEY];
    return key ? t.know[key] : fallback;
  }

  return (
    <section className="sv-know" aria-label={t.know.title}>
      <div className="sv-know-top">
        <p className="sv-know-label">{t.know.title}</p>
      </div>

      <ul className="sv-know-list">
        {KNOW_QUESTIONS.map((q) => (
          <li key={q.id}>
            <button
              type="button"
              className="sv-know-item"
              onClick={() => onAsk(q.id)}
            >
              <span className="sv-know-item-text">{labelFor(q.id, q.label)}</span>
              <span className="sv-know-item-go" aria-hidden>
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
