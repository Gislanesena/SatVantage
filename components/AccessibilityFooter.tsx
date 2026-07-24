"use client";
// Acessibilidade: FAB de voz + FAB de ajuda (logo acima do áudio).
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import "./a11y.css";

type VoiceState = "idle" | "speaking" | "paused";

function pageText(): string {
  const root =
    document.getElementById("topo") ||
    document.querySelector("main") ||
    document.body;
  if (!root) return "";
  const clone = root.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      "script, style, noscript, [aria-hidden='true'], .sv-a11y, [vw], .sv-a11y-fab, .sv-a11y-help, .sv-a11y-help-panel",
    )
    .forEach((el) => el.remove());
  return (clone.innerText || "").replace(/\s+\n/g, "\n").trim();
}

export default function AccessibilityFooter() {
  const { t, locale } = useI18n();
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [helpOpen, setHelpOpen] = useState(false);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
      if (pressTimer.current) window.clearTimeout(pressTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!helpOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setHelpOpen(false);
    }
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      const panel = document.querySelector(".sv-a11y-help");
      if (panel && !panel.contains(t)) setHelpOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDoc);
    };
  }, [helpOpen]);

  function stop() {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setVoice("idle");
  }

  function pause() {
    try {
      window.speechSynthesis.pause();
      setVoice("paused");
    } catch {
      /* ignore */
    }
  }

  function resume() {
    try {
      window.speechSynthesis.resume();
      setVoice("speaking");
    } catch {
      /* ignore */
    }
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
    utter.onend = () => setVoice("idle");
    utter.onerror = () => setVoice("idle");
    setVoice("speaking");
    window.speechSynthesis.speak(utter);
  }

  function onVoiceClick() {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (voice === "idle") start();
    else if (voice === "speaking") pause();
    else resume();
  }

  function onVoicePointerDown() {
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      stop();
    }, 550);
  }

  function onVoicePointerUp() {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  const voiceLabel =
    voice === "speaking"
      ? t.a11y.pauseReading
      : voice === "paused"
        ? t.a11y.resumeReading
        : t.a11y.readPage;

  return (
    <>
      <button
        type="button"
        className={`sv-a11y-fab${voice !== "idle" ? " is-on" : ""}${voice === "paused" ? " is-paused" : ""}`}
        onClick={onVoiceClick}
        onPointerDown={onVoicePointerDown}
        onPointerUp={onVoicePointerUp}
        onPointerLeave={onVoicePointerUp}
        onPointerCancel={onVoicePointerUp}
        aria-pressed={voice === "speaking"}
        aria-label={`${voiceLabel}. ${t.a11y.voiceHoldToStop}`}
        title={`${voiceLabel} — ${t.a11y.voiceHoldToStop}`}
      >
        {voice === "speaking" ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
          </svg>
        ) : voice === "paused" ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M8 5.5v13l11-6.5L8 5.5Z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 9v6h3.2L12 19V5L7.2 9H4Z" fill="currentColor" />
            <path
              d="M15.2 8.2a4.2 4.2 0 0 1 0 7.6M17.6 5.5a7.5 7.5 0 0 1 0 13"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      <div className="sv-a11y-help">
        <button
          type="button"
          className={`sv-a11y-help-fab${helpOpen ? " is-on" : ""}`}
          onClick={() => setHelpOpen((v) => !v)}
          aria-expanded={helpOpen}
          aria-controls="sv-a11y-help-panel"
          aria-label={t.a11y.helpBtn}
          title={t.a11y.helpBtn}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/accessibility-icon.png"
            alt=""
            width={56}
            height={56}
            draggable={false}
          />
        </button>

        {helpOpen && (
          <div
            id="sv-a11y-help-panel"
            className="sv-a11y-help-panel"
            role="dialog"
            aria-labelledby="sv-a11y-help-title"
          >
            <h2 id="sv-a11y-help-title" className="sv-a11y-help-title">
              {t.a11y.helpTitle}
            </h2>
            <div className="sv-a11y-help-block">
              <p className="sv-a11y-help-label">{t.a11y.helpAudioTitle}</p>
              <p className="sv-a11y-help-text">{t.a11y.helpAudioBody}</p>
            </div>
            <div className="sv-a11y-help-block">
              <p className="sv-a11y-help-label">{t.a11y.helpVlibrasTitle}</p>
              <p className="sv-a11y-help-text">{t.a11y.helpVlibrasBody}</p>
            </div>
            <button
              type="button"
              className="sv-a11y-help-close"
              onClick={() => setHelpOpen(false)}
            >
              {t.a11y.helpClose}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
