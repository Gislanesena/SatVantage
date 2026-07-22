"use client";

import { useEffect, useState } from "react";
import LanguageSelect from "@/components/LanguageSelect";
import { useI18n } from "@/lib/i18n";

type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("sv_theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

type SiteNavProps = {
  onStart?: () => void;
  variant?: "full" | "mentor" | "dash";
  onExitMentor?: () => void;
};

export default function SiteNav({
  onStart,
  variant = "full",
  onExitMentor,
}: SiteNavProps) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const isMentor = variant === "mentor";
  const isDash = variant === "dash";
  const isCompact = isMentor || isDash;

  const navLinks = [
    { href: "#conheca", label: t.nav.platform },
    { href: "#bitcoin", label: t.nav.bitcoinLive },
    { href: "#sobre", label: t.nav.about },
    { href: "#suporte", label: t.nav.support },
  ] as const;

  useEffect(() => {
    const next = readTheme();
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("sv_theme", next);
    } catch {
      /* ignore */
    }
  }

  function goStart(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(false);
    if (onStart) onStart();
    else {
      document.getElementById("acesso")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header className="sv-nav">
      <div className={`sv-nav-inner${isCompact ? " sv-nav-inner--mentor" : ""}`}>
        <a
          href={isCompact ? undefined : "#topo"}
          className="sv-nav-brand"
          aria-label="SatVantage"
          onClick={(e) => {
            if (isCompact) e.preventDefault();
          }}
        >
          <img
            src="/satvantage-logo.png?v=9"
            alt="SatVantage"
            className="sv-nav-logo"
            width={220}
            height={55}
          />
        </a>

        {!isCompact && (
          <nav className="sv-nav-links" aria-label={t.nav.sections}>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="sv-nav-actions">
          {!isDash && <LanguageSelect />}

          {!isDash && (
            <button
              type="button"
              className="sv-theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
              title={theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}

          {isMentor ? (
            <button type="button" className="sv-nav-exit" onClick={onExitMentor}>
              {t.nav.exitMentor}
            </button>
          ) : isDash ? null : (
            <>
              <a href="#acesso" className="sv-nav-cta" onClick={goStart}>
                {t.nav.start}
              </a>
              <button
                type="button"
                className="sv-nav-burger"
                aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span />
                <span />
              </button>
            </>
          )}
        </div>
      </div>

      {!isCompact && menuOpen && (
        <div className="sv-nav-drawer" role="dialog" aria-label={t.nav.menu}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="#acesso" className="sv-nav-cta" onClick={goStart}>
            {t.nav.start}
          </a>
        </div>
      )}
    </header>
  );
}
