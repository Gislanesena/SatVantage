"use client";

import { useCallback, useEffect, useState } from "react";
import {
  extractReadableText,
  isSpeechPaused,
  isSpeechSupported,
  pauseSpeaking,
  resumeSpeaking,
  speakText,
  stopSpeaking,
} from "@/lib/speak-text";
import { useI18n } from "@/lib/i18n";
import A11yDialog from "@/components/A11yDialog";
import AccessibilityIcon from "@/components/AccessibilityIcon";
import SpeakIcon from "@/components/SpeakIcon";
import "./a11y.css";

const OPEN_EVENT = "sv-a11y-open";

export function openAccessibilityPanel() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * Dock flutuante (canto inferior direito), de cima para baixo:
 * 1) menu de acessibilidade · 2) VLibras (plugin) · 3) leitura em voz alta
 */
export default function AccessibilityDock() {
  const { t, locale } = useI18n();
  const lang = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  const [panelOpen, setPanelOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const supported = isSpeechSupported();

  useEffect(() => {
    function onOpen() {
      setPanelOpen(true);
    }
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      window.alert(t.a11y.voiceUnsupported);
      return;
    }
    const text = extractReadableText();
    if (!text) return;
    setSpeaking(true);
    setPaused(false);
    void speakText(text, {
      lang,
      onEnd: () => {
        setSpeaking(false);
        setPaused(false);
      },
      onError: () => {
        setSpeaking(false);
        setPaused(false);
      },
    }).catch(() => {
      setSpeaking(false);
      setPaused(false);
    });
  }, [lang, supported, t.a11y.voiceUnsupported]);

  const togglePause = useCallback(() => {
    if (!speaking) return;
    if (paused || isSpeechPaused()) {
      resumeSpeaking();
      setPaused(false);
    } else {
      pauseSpeaking();
      setPaused(true);
    }
  }, [paused, speaking]);

  return (
    <>
      <div className="sv-a11y-dock" role="region" aria-label={t.a11y.footerLabel}>
        <button
          type="button"
          className="sv-a11y-fab sv-a11y-fab--menu"
          onClick={() => setPanelOpen(true)}
          aria-label={t.a11y.optionsLabel}
          title={t.a11y.optionsLabel}
        >
          <AccessibilityIcon className="sv-a11y-menu-ico" />
        </button>

        <div className="sv-a11y-fab-stack" role="group" aria-label={t.a11y.readPage}>
          {!speaking ? (
            <button
              type="button"
              className="sv-a11y-fab sv-a11y-fab--tts"
              onClick={start}
              aria-label={t.a11y.readPage}
              title={t.a11y.readPage}
            >
              <SpeakIcon className="sv-a11y-tts-ico" size={26} />
            </button>
          ) : (
            <div className="sv-a11y-fab-row">
              <button
                type="button"
                className={`sv-a11y-fab sv-a11y-fab--tts${paused ? " is-paused" : " is-on"}`}
                onClick={togglePause}
                aria-label={paused ? t.a11y.resumeReading : t.a11y.pauseReading}
                title={paused ? t.a11y.resumeReading : t.a11y.pauseReading}
              >
                <span aria-hidden>{paused ? "▶" : "❚❚"}</span>
              </button>
              <button
                type="button"
                className="sv-a11y-fab sv-a11y-fab--stop"
                onClick={stop}
                aria-label={t.a11y.stopReading}
                title={t.a11y.stopReading}
              >
                <span aria-hidden>■</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <A11yDialog
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        labelledBy="sv-a11y-panel-title"
        className="sv-a11y-panel"
      >
        <h2 id="sv-a11y-panel-title">{t.a11y.panelTitle}</h2>
        <p>{t.a11y.panelIntro}</p>
        <ul className="sv-a11y-panel-list">
          <li>{t.a11y.panelTts}</li>
          <li>{t.a11y.panelVlibras}</li>
          <li>{t.a11y.panelSkip}</li>
        </ul>
        <div className="sv-a11y-panel-actions">
          <button
            type="button"
            className="sv-a11y-panel-btn"
            onClick={() => {
              setPanelOpen(false);
              start();
            }}
          >
            {t.a11y.readPage}
          </button>
          <button
            type="button"
            className="sv-a11y-panel-btn sv-a11y-panel-btn--ghost"
            onClick={() => setPanelOpen(false)}
          >
            {t.a11y.closeDialog}
          </button>
        </div>
      </A11yDialog>
    </>
  );
}
