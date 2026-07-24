"use client";
import { useState } from "react";
import "./landing.css";
import SiteNav from "@/components/SiteNav";
import BtcMarket from "@/components/BtcMarket";
import LandingGuide from "@/components/LandingGuide";
import LandingPlatform from "@/components/LandingPlatform";
import LandingWhy from "@/components/LandingWhy";
import LandingAbout from "@/components/LandingAbout";
import SiteFooter from "@/components/SiteFooter";
import SkipToContent from "@/components/SkipToContent";
import { useI18n } from "@/lib/i18n";

type LandingProps = {
  onCreateAccount: () => void;
  onExtension: () => void;
  onExistingLogin: () => void;
  extensionBusy?: boolean;
  error?: string | null;
};

export default function Landing({
  onCreateAccount,
  onExtension,
  onExistingLogin,
  extensionBusy,
  error,
}: LandingProps) {
  const { t, locale } = useI18n();
  const [showLoginChoices, setShowLoginChoices] = useState(false);

  return (
    <div className="sv-landing" id="topo" translate="no">
      <SkipToContent href="#conteudo" />
      <SiteNav
        onStart={() =>
          document.getElementById("acesso")?.scrollIntoView({ behavior: "smooth" })
        }
      />

      <div className="sv-landing-body" id="conteudo" tabIndex={-1}>
        <section className="sv-hero" aria-label={t.landing.presentation} id="plataforma">
          <div className="sv-hero-main">
            <div className="sv-hero-intro" key={locale}>
              <p className="sv-eyebrow sv-rise" translate="no">
                <span aria-hidden="true">✦</span>
                {t.landing.eyebrow}
              </p>

              <h1 className="sv-rise sv-rise-delay-1" translate="no">
                {t.landing.headlineBefore}
                <em>{t.landing.headlineEm}</em>
                {t.landing.headlineAfter}
              </h1>
            </div>

            <div className="sv-hero-actions sv-rise sv-rise-delay-2" id="acesso">
              <div className="sv-cta-stack" key={`cta-${locale}`}>
                <button type="button" className="sv-btn-primary" translate="no" onClick={onCreateAccount}>
                  {t.landing.invest}
                  <span aria-hidden="true">→</span>
                </button>

                <button
                  type="button"
                  className="sv-btn-ghost"
                  onClick={() => setShowLoginChoices((o) => !o)}
                  aria-expanded={showLoginChoices}
                  aria-controls="login-choices"
                >
                  {t.landing.haveAccount}
                </button>

                <a href="#conheca" className="sv-btn-ghost">
                  {t.landing.knowPlatform}
                </a>
              </div>

              {showLoginChoices && (
                <div className="sv-login-panel sv-rise" id="login-choices">
                  <p className="sv-login-notice">{t.landing.nostrNotice}</p>
                  <div className="sv-login-actions">
                    <button type="button" className="sv-btn-primary" onClick={onExistingLogin}>
                      {t.landing.enterAccount}
                    </button>
                    <button
                      type="button"
                      className="sv-btn-ghost"
                      onClick={onExtension}
                      disabled={extensionBusy}
                    >
                      {extensionBusy ? t.landing.enterExtBusy : t.landing.enterExt}
                    </button>
                  </div>
                  {error && (
                    <p role="alert" className="sv-error">
                      {error}
                    </p>
                  )}
                </div>
              )}

              {!showLoginChoices && error && (
                <p role="alert" className="sv-error sv-hero-error">
                  {error}
                </p>
              )}
            </div>

            <div className="sv-hero-body sv-rise sv-rise-delay-2">
              <p className="sv-lede">{t.landing.lede}</p>
              <p className="sv-lede-line">{t.landing.ledeLine}</p>
              <p className="sv-lede-note">{t.landing.ledeNote}</p>
            </div>

            <ul className="sv-trust sv-rise sv-rise-delay-3">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3 5 6.5v5.2c0 4.4 2.9 8.4 7 9.3 4.1-.9 7-4.9 7-9.3V6.5L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                {t.landing.trustSafe}
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M5 19c1.4-3 3.8-4.5 7-4.5s5.6 1.5 7 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {t.landing.trustNostr}
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 16.5 10 10l4 4 6-7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t.landing.trustContent}
              </li>
            </ul>
          </div>
        </section>
      </div>

            <section className="sv-landing-ext" aria-label={t.landing.copilotoTitle}>
        <div className="sv-ext-promo">
          <div className="sv-ext-promo-text">
            <p className="sv-ext-promo-eyebrow">{t.landing.copilotoEyebrow}</p>
            <h3 className="sv-ext-promo-title">{t.landing.copilotoTitle}</h3>
            <p className="sv-ext-promo-copy">{t.landing.copilotoCopy}</p>
          </div>
          <button
            type="button"
            className="sv-ext-promo-btn"
            title={t.landing.copilotoBtnTitle}
            aria-disabled="true"
            onClick={(e) => e.preventDefault()}
          >
            {t.landing.copilotoBtn}
          </button>
        </div>
      </section>

      <section className="sv-landing-btc" id="bitcoin" aria-label={t.landing.bitcoinLive}>
        <BtcMarket variant="wide" />
      </section>

      <LandingPlatform />

      <LandingWhy />

      <LandingAbout />

      <LandingGuide onCreateAccount={onCreateAccount} onExtension={onExtension} />

      <SiteFooter />
    </div>
  );
}
