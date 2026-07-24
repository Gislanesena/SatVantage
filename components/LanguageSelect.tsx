"use client";
import { useEffect, useRef, useState } from "react";
import { LOCALE_OPTIONS, useI18n, type Locale } from "@/lib/i18n";
import "./a11y.css";

type Props = {
  /** nav = header site · bank = dashboard · chat = painel NagAI compacto */
  variant?: "nav" | "bank" | "chat";
};

/**
 * Seletor global PT/EN/ES — lê/escreve o mesmo I18nProvider + localStorage.
 * Qualquer instância (header ou chat) atualiza todas as outras.
 * Permanece interativo durante o chat (mesmo após mensagens / busy).
 */
export default function LanguageSelect({ variant = "nav" }: Props) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const el = rootRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    // capture: fecha o menu sem perder o clique para outros handlers do documento
    document.addEventListener("mousedown", onDoc, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current =
    LOCALE_OPTIONS.find((o) => o.value === locale)?.label ?? locale.toUpperCase();

  const rootClass =
    variant === "bank"
      ? "sv-lang sv-lang--bank"
      : variant === "chat"
        ? "sv-lang sv-lang--chat"
        : "sv-lang";

  function pickLocale(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={rootClass}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="sv-lang-btn"
        aria-label={t.nav.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t.nav.language}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sv-lang-code">{current}</span>
        <span className="sv-lang-caret" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <ul className="sv-lang-menu" role="listbox" aria-label={t.nav.language}>
          {LOCALE_OPTIONS.map((opt) => (
            <li key={opt.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={opt.value === locale}
                className={`sv-lang-option${opt.value === locale ? " is-on" : ""}`}
                onMouseDown={(e) => {
                  // Evita que mousedown externo feche o menu antes do click
                  e.preventDefault();
                  e.stopPropagation();
                  pickLocale(opt.value as Locale);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
