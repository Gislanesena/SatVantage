"use client";
// Dúvidas importantes — clicam e abrem no chat do mentor.
import { KNOW_QUESTIONS } from "@/lib/optional-topics";
import "./know.css";

type Props = {
  onAsk: (topicId: string) => void;
};

export default function KnowPanel({ onAsk }: Props) {
  return (
    <section className="sv-know" aria-label="Dúvidas importantes">
      <div className="sv-know-top">
        <p className="sv-know-label">Dúvidas importantes</p>
      </div>

      <ul className="sv-know-list">
        {KNOW_QUESTIONS.map((q) => (
          <li key={q.id}>
            <button
              type="button"
              className="sv-know-item"
              onClick={() => onAsk(q.id)}
            >
              <span className="sv-know-item-text">{q.label}</span>
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
