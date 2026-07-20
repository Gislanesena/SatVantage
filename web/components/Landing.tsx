"use client";
import { useState } from "react";
import "./landing.css";
import SiteNav from "@/components/SiteNav";
import BtcMarket from "@/components/BtcMarket";
import LandingGuide from "@/components/LandingGuide";

const NOSTR_NOTICE =
  "Essa plataforma utiliza login Nostr. Caso não tenha, você pode fazer uma conta conosco de forma simplificada.";

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
  const [showLoginChoices, setShowLoginChoices] = useState(false);

  return (
    <div className="sv-landing" id="topo">
      <SiteNav
        onStart={() =>
          document.getElementById("acesso")?.scrollIntoView({ behavior: "smooth" })
        }
      />

      <div className="sv-landing-body">
        <section className="sv-hero" aria-label="Apresentação" id="plataforma">
          <div className="sv-hero-main">
            <div className="sv-hero-intro">
              <p className="sv-eyebrow sv-rise">
                <span aria-hidden="true">✦</span>
                Aprenda · Opere · Pague com Lightning
              </p>

              <h1 className="sv-rise sv-rise-delay-1">
                A porta de entrada para o <em>Bitcoin</em>.
              </h1>
            </div>

            <div className="sv-hero-actions sv-rise sv-rise-delay-2" id="acesso">
              <div className="sv-cta-stack">
                <button type="button" className="sv-btn-primary" onClick={onCreateAccount}>
                  Comece a Investir
                  <span aria-hidden="true">→</span>
                </button>

                <button
                  type="button"
                  className="sv-btn-ghost"
                  onClick={() => setShowLoginChoices((o) => !o)}
                  aria-expanded={showLoginChoices}
                  aria-controls="login-choices"
                >
                  Já possuo conta
                </button>

                <a href="#seguranca" className="sv-btn-ghost">
                  Conheça a Plataforma
                </a>
              </div>

              {showLoginChoices && (
                <div className="sv-login-panel sv-rise" id="login-choices">
                  <p className="sv-login-notice">{NOSTR_NOTICE}</p>
                  <div className="sv-login-actions">
                    <button type="button" className="sv-btn-primary" onClick={onExistingLogin}>
                      Entrar com conta SatVantage
                    </button>
                    <button
                      type="button"
                      className="sv-btn-ghost"
                      onClick={onExtension}
                      disabled={extensionBusy}
                    >
                      {extensionBusy
                        ? "Aguardando a extensão…"
                        : "Entrar com extensão Nostr"}
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
              <p className="sv-lede">
                Comece a investir ou conecte suas carteiras e corretoras favoritas,
                compre, venda e transfira Bitcoin de forma simples, pague o dia a
                dia via Lightning e ganhe <em>satoshis ao vivo</em> aprendendo.
              </p>
              <p className="sv-lede-line">
                Para iniciantes e investidores frequentes.
              </p>
              <p className="sv-lede-note">
                Essa plataforma utiliza login Nostr; caso não tenha, você pode
                fazer uma conta conosco de forma simplificada.
              </p>
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
                Ambiente seguro
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
                Identidade Nostr
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
                Conteúdo atualizado
              </li>
            </ul>
          </div>
        </section>
      </div>

      <section className="sv-landing-btc" id="bitcoin" aria-label="Bitcoin ao vivo">
        <BtcMarket variant="wide" />
      </section>

      <div className="sv-landing-body sv-landing-body--after">
        <section id="seguranca" className="sv-section">
          <h2>Segurança como princípio, não como slogan</h2>
          <p className="sv-section-lede">
            A plataforma acessa só o necessário para autenticar e operar. Sua chave
            privada não passa pelo nosso servidor.
          </p>
          <ul className="sv-security-list">
            <li>
              <strong>Guardamos o cofre, nunca a chave.</strong>
              <span>
                No caminho com senha, a chave Nostr fica cifrada no seu navegador.
                Sem e-mail, sem dado pessoal obrigatório.
              </span>
            </li>
            <li>
              <strong>Extensão = a chave não sai do seu dispositivo.</strong>
              <span>
                Com Alby ou nos2x, só pedimos uma assinatura. Verificamos a prova —
                não a chave.
              </span>
            </li>
            <li>
              <strong>Modo emergência e fricção consciente.</strong>
              <span>
                Revogue conexões num toque se perder o aparelho. Em operações fora
                do padrão, alertamos antes — você decide.
              </span>
            </li>
          </ul>
        </section>
      </div>

      <LandingGuide onCreateAccount={onCreateAccount} onExtension={onExtension} />
    </div>
  );
}
