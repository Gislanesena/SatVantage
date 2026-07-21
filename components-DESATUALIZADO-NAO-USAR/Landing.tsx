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

                <a href="#conheca" className="sv-btn-ghost">
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

      <section className="sv-platform" id="conheca" aria-labelledby="sv-platform-title">
        <div className="sv-landing-body sv-platform-inner">
          <p className="sv-platform-eyebrow">Plataforma</p>
          <h2 id="sv-platform-title" className="sv-platform-title">
            Sua porta de <em>entrada</em> para o mundo do Bitcoin
          </h2>
          <p className="sv-platform-lede">
            Integramos carteiras e corretoras que você já conhece — ou ajudamos a
            escolher a ideal. Comprar, vender e transferir Bitcoin fica simples e
            transparente, para iniciantes e especialistas.
          </p>

          <ul className="sv-platform-grid">
            <li className="sv-platform-card">
              <span className="sv-platform-ico" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="13"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M3 10h18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" />
                </svg>
              </span>
              <strong>Conecte sua carteira</strong>
              <p>Use a que você já confia — hardware, mobile ou Lightning. Sem migração forçada.</p>
            </li>

            <li className="sv-platform-card">
              <span className="sv-platform-ico" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 19V9.5L12 5l8 4.5V19"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 19v-5h6v5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <strong>Integre corretoras</strong>
              <p>
                Binance, Mercado Bitcoin, Coinbase e mais. Um só painel para acompanhar
                saldos e histórico.
              </p>
            </li>

            <li className="sv-platform-card">
              <span className="sv-platform-ico" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 8H4.5a1.5 1.5 0 0 0 0 3H19a1.5 1.5 0 0 1 0 3H16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 8l2.2-2.2M7 8l2.2 2.2M16 14l-2.2-2.2M16 14l-2.2 2.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <strong>Compre, venda e transfira</strong>
              <p>
                Operações simplificadas em poucos toques, com cotação em tempo real
                para decidir com mais clareza.
              </p>
            </li>

            <li className="sv-platform-card">
              <span className="sv-platform-ico" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 3.5h7.5L19 8v12.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 3.5V8h4.5M8.5 13h7M8.5 16.5h5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <strong>Tributário e patrimônio</strong>
              <p>
                Orientações claras sobre imposto, declaração e patrimônio em Bitcoin —
                o que costuma ficar de fora das conversas.
              </p>
            </li>
          </ul>

          <div className="sv-partners">
            <article className="sv-partners-panel">
              <div className="sv-partners-head">
                <span className="sv-partners-ico" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="6"
                      width="18"
                      height="13"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="16.5" cy="14.5" r="1.1" fill="currentColor" />
                  </svg>
                </span>
                <h3>Carteiras compatíveis</h3>
              </div>
              <p>
                Especialistas escolhem a carteira que já usam. Iniciantes recebem a
                recomendação certa para o seu momento.
              </p>
              <ul className="sv-partners-tags">
                {[
                  "Breez SDK",
                  "Phoenix",
                  "Blue",
                  "Wallet of Satoshi",
                  "Ledger",
                  "Trezor",
                  "BitKey",
                  "Coldcard",
                ].map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </article>

            <article className="sv-partners-panel">
              <div className="sv-partners-head">
                <span className="sv-partners-ico" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 19V9.5L12 5l8 4.5V19"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 19v-5h6v5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3>Corretoras integradas</h3>
              </div>
              <p>
                Conecte suas contas por API e opere com a melhor cotação — sem sair
                da SatVantage.
              </p>
              <ul className="sv-partners-tags">
                {[
                  "Binance",
                  "Bitso",
                  "Mercado Bitcoin",
                  "Foxbit",
                  "Bitget",
                  "Coinbase",
                  "Kraken",
                  "Bitfinex",
                ].map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="sv-why" id="sobre" aria-labelledby="sv-why-title">
        <div className="sv-landing-body sv-why-inner">
          <p className="sv-platform-eyebrow">Por que Bitcoin?</p>
          <h2 id="sv-why-title" className="sv-platform-title sv-why-title">
            Entenda o ativo que está redefinindo o dinheiro
          </h2>
          <p className="sv-platform-lede">
            Antes de investir, é essencial compreender. Explicamos o Bitcoin de forma
            simples, sem jargões e com a profundidade que você precisar.
          </p>

          <ul className="sv-why-grid">
            <li className="sv-platform-card">
              <span className="sv-platform-ico" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
              </span>
              <strong>Soberania financeira</strong>
              <p>
                Você é dono do seu dinheiro. Sem intermediários, sem censura,
                transparente por design.
              </p>
            </li>

            <li className="sv-platform-card">
              <span className="sv-platform-ico" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 16.5 9.5 11l3.5 3.5L20 7.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 7.5h5v5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <strong>Reserva de valor digital</strong>
              <p>
                Oferta limitada em 21 milhões. Uma proteção real contra inflação e
                desvalorização.
              </p>
            </li>

            <li className="sv-platform-card">
              <span className="sv-platform-ico" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2 5.5 13.5H12L11 22 18.5 10.5H12L13 2Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <strong>Tecnologia que evolui</strong>
              <p>
                Da rede principal ao Lightning: pagamentos instantâneos e globais,
                24/7.
              </p>
            </li>
          </ul>

          <ul className="sv-pillars">
            <li className="sv-pillars-item">
              <span className="sv-platform-ico sv-platform-ico--sm" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
              </span>
              <div>
                <strong>Segurança em primeiro lugar</strong>
                <p>Ensinamos autocustódia responsável e boas práticas desde o dia 1.</p>
              </div>
            </li>
            <li className="sv-pillars-item">
              <span className="sv-platform-ico sv-platform-ico--sm" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 4.5h9.5L18.5 8v11.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 4.5V8h3.5M8 12h7M8 15.5h5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <strong>Conteúdo verificado</strong>
                <p>Curadoria por especialistas ativos no ecossistema Bitcoin.</p>
              </div>
            </li>
            <li className="sv-pillars-item">
              <span className="sv-platform-ico sv-platform-ico--sm" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="16" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M3.8 18c1.2-2.6 3.2-3.9 5.2-3.9s4 1.3 5.2 3.9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13.2 14.4c1.1-.5 2.3-.6 3.5-.2 1.5.5 2.7 1.7 3.5 3.8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div>
                <strong>Comunidade acolhedora</strong>
                <p>Um espaço para tirar dúvidas sem julgamentos, do básico ao avançado.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <footer className="sv-footer" id="suporte">
        <div className="sv-footer-inner">
          <p className="sv-footer-copy">© 2026 SatVantage. Todos os direitos reservados.</p>
          <a
            className="sv-footer-support"
            href="mailto:gislane.sena@icloud.com"
          >
            Suporte
          </a>
          <p className="sv-footer-risk">
            Investir em Bitcoin envolve riscos. Estude antes de investir.
          </p>
        </div>
      </footer>

      <LandingGuide onCreateAccount={onCreateAccount} onExtension={onExtension} />
    </div>
  );
}
