"use client";

import { useSpeakText } from "@/lib/use-speak-text";
import { useI18n } from "@/lib/i18n";
import SpeakIcon from "@/components/SpeakIcon";

type SpeakButtonProps = {
  text: string;
  disabled?: boolean;
  className?: string;
  /** Rótulo acessível customizado (padrão: Ouvir mensagem) */
  label?: string;
};

/** Botão reutilizável “Ouvir” — síntese de voz para qualquer texto. */
export default function SpeakButton({
  text,
  disabled,
  className,
  label,
}: SpeakButtonProps) {
  const { t, locale } = useI18n();
  const lang = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  const { supported, speaking, toggle } = useSpeakText(lang);
  if (!supported || !text.trim()) return null;

  const listenLabel = label || t.a11y.listenMessage;
  const stopLabel = t.a11y.stopReading;

  return (
    <button
      type="button"
      className={`sv-speak-btn${speaking ? " is-on" : ""}${className ? ` ${className}` : ""}`}
      disabled={disabled}
      aria-label={speaking ? stopLabel : listenLabel}
      aria-pressed={speaking}
      title={speaking ? stopLabel : listenLabel}
      onClick={(e) => {
        e.stopPropagation();
        toggle(text);
      }}
    >
      {speaking ? (
        <span aria-hidden>■</span>
      ) : (
        <SpeakIcon className="sv-speak-btn-ico" size={16} />
      )}
    </button>
  );
}
