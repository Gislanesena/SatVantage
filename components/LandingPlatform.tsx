"use client";
import { useI18n } from "@/lib/i18n";

export default function LandingPlatform() {
  const { t } = useI18n();
  const cards = [
    { key: "wallet" as const, icon: "wallet" },
    { key: "exchanges" as const, icon: "bank" },
    { key: "trade" as const, icon: "swap" },
    { key: "tax" as const, icon: "tax" },
  ];

  return (
    <section className="sv-platform" id="conheca" aria-labelledby="sv-platform-title">
      <div className="sv-landing-body sv-platform-inner">
        <p className="sv-platform-eyebrow">{t.platform.eyebrow}</p>
        <h2 id="sv-platform-title" className="sv-platform-title">
          {t.platform.titleBefore}
          <em>{t.platform.titleEm}</em>
          {t.platform.titleAfter}
        </h2>
        <p className="sv-platform-lede">{t.platform.lede}</p>

        <ul className="sv-platform-grid">
          {cards.map((card) => (
            <li key={card.key} className="sv-platform-card">
              <span className="sv-platform-ico" aria-hidden>
                {card.icon === "wallet" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a1 1 0 0 1 1 1v2.2M4 7.5V17a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-5.2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <circle cx="16.5" cy="13.5" r="1.2" fill="currentColor" />
                  </svg>
                )}
                {card.icon === "bank" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M3 18h18M12 4l9 6H3l9-6Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {card.icon === "swap" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 8h12M16 5l3 3-3 3M17 16H5M8 13l-3 3 3 3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {card.icon === "tax" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 4h8l3 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8l3-4Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12h6M9 15h4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
              <strong>{t.platform[card.key].title}</strong>
              <p>{t.platform[card.key].body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
