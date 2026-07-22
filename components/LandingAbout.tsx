"use client";
import { useI18n } from "@/lib/i18n";

const TIKTOK_URL = "https://www.tiktok.com/@satvantage";
const INSTAGRAM_URL = "https://www.instagram.com/satvantage";

export default function LandingAbout() {
  const { t } = useI18n();
  const cards = [
    { key: "security" as const, icon: "shield" },
    { key: "content" as const, icon: "book" },
    { key: "community" as const, icon: "people" },
  ];

  return (
    <section className="sv-about" id="sobre" aria-labelledby="sv-about-title">
      <div className="sv-landing-body sv-about-inner">
        <div className="sv-about-copy">
          <p className="sv-platform-eyebrow">{t.about.eyebrow}</p>
          <h2 id="sv-about-title" className="sv-about-title">
            {t.about.title}
          </h2>
          <p className="sv-about-p">{t.about.p1}</p>
          <p className="sv-about-p">{t.about.p2}</p>
        </div>

        <ul className="sv-about-panel">
          {cards.map((card) => (
            <li key={card.key} className="sv-about-card">
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
                {card.icon === "book" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5A2.5 2.5 0 0 1 20 21.5V5.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {card.icon === "people" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="16" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.6" />
                    <path
                      d="M3.8 18c.9-2.6 2.8-4 5.2-4s4.3 1.4 5.2 4M13.2 18c.4-1.5 1.4-2.6 3-2.6 1.5 0 2.5 1 3 2.6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
              <div>
                <strong>{t.about[card.key].title}</strong>
                <p>{t.about[card.key].body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sv-landing-body sv-about-social">
        <p className="sv-about-social-text">{t.why.socialLearn}</p>
        <div className="sv-about-social-actions">
          <a
            className="sv-about-social-btn sv-about-social-btn--tiktok"
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sv-about-social-ico" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14.2 3c.5 2.4 2.1 4.1 4.5 4.6v3.1c-1.6-.1-3-.6-4.2-1.5v5.7a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.2a2.6 2.6 0 1 0 1.8 2.5V3h2.7Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            {t.why.tiktok}
          </a>
          <a
            className="sv-about-social-btn sv-about-social-btn--instagram"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sv-about-social-ico" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3.5"
                  y="3.5"
                  width="17"
                  height="17"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
              </svg>
            </span>
            {t.why.instagram}
          </a>
        </div>
      </div>
    </section>
  );
}
