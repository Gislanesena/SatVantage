"use client";
// Leitura por voz da página (Web Speech API) + âncora de acessibilidade.
import { useSpeakText } from "@/lib/use-speak-text";
import { extractReadableText } from "@/lib/speak-text";
import { useI18n } from "@/lib/i18n";
import "./a11y.css";

export default function AccessibilityFooter({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { t, locale } = useI18n();
  const lang = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  const { supported, speaking, speak, stop } = useSpeakText(lang);

  function start() {
    if (!supported) {
      window.alert(t.a11y.voiceUnsupported);
      return;
    }
    const text = extractReadableText();
    if (!text) return;
    speak(text);
  }

  const Tag = embedded ? "div" : "footer";

  return (
    <Tag
      className={`sv-a11y${embedded ? " sv-a11y--embedded" : ""}`}
      aria-label={t.a11y.footerLabel}
    >
      <div className="sv-a11y-inner">
        <button
          type="button"
          className={`sv-a11y-voice${speaking ? " is-on" : ""}`}
          onClick={() => (speaking ? stop() : start())}
          aria-label={speaking ? t.a11y.stopReading : t.a11y.readPage}
          aria-pressed={speaking}
        >
          <span className="sv-a11y-ico" aria-hidden>
            {speaking ? "■" : "🔊"}
          </span>
          {speaking ? t.a11y.stopReading : t.a11y.readPage}
        </button>
      </div>
    </Tag>
  );
}
