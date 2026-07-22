"use client";
import { useI18n } from "@/lib/i18n";

export default function LandingWhy() {
  const { t } = useI18n();
  const cards = [
    { key: "sovereignty" as const, icon: "shield" },
    { key: "reserve" as const, icon: "chart" },
    { key: "tech" as const, icon: "bolt" },
  ];

  return (
    <section className="sv-platform sv-why" id="por-que-bitcoin" aria-labelledby="sv-why-title">
      <div className="sv-landing-body sv-platform-inner">
        <p className="sv-platform-eyebrow">{t.why.eyebrow}</p>
        <h2 id="sv-why-title" className="sv-platform-title sv-why-title">
          {t.why.title}
        </h2>
        <p className="sv-platform-lede">{t.why.lede}</p>

        <ul className="sv-platform-grid sv-why-grid">
          {cards.map((card) => (
            <li key={card.key} className="sv-platform-card">
              <span className="sv-platform-ico" aria-hidden>
                {card.icon === "shield" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3 5 6.5v5.2c0 4.4 2.9 8.4 7 9.3 4.1-.9 7-4.9 7-9.3V6.5L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.2 12.2 11 14l3.8-4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {card.icon === "chart" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 16.5 9.2 11l3.2 3.2L20 7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 7h5v5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {card.icon === "bolt" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 3 6.5 13.2h4.2L10.2 21 18 9.8h-4.3L13 3Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <strong>{t.why[card.key].title}</strong>
              <p>{t.why[card.key].body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
