"use client";
// Leitura por voz da página (Web Speech API) + âncora de acessibilidade.
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import "./a11y.css";

function pageText(): string {
  const root =
    document.getElementById("topo") ||
    document.querySelector("main") ||
    document.body;
  if (!root) return "";
  const clone = root.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      "script, style, noscript, [aria-hidden='true'], .sv-a11y, [vw]",
    )
    .forEach((el) => el.remove());
  return (clone.innerText || "").replace(/\s+\n/g, "\n").trim();
}

export default function AccessibilityFooter({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { t, locale } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  function stop() {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setSpeaking(false);
  }

  function start() {
    if (!supported) {
      window.alert(t.a11y.voiceUnsupported);
      return;
    }
    stop();
    const text = pageText();
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
    utter.rate = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
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
