"use client";

import { useCallback, useEffect, useState } from "react";
import { isSpeechSupported, speakText, stopSpeaking } from "@/lib/speak-text";

/**
 * Hook reutilizável: lê texto em voz alta (Web Speech API).
 * Preferência feminina pt-BR. Segundo clique cancela.
 */
export function useSpeakText(lang = "pt-BR") {
  const [speaking, setSpeaking] = useState(false);
  const supported = isSpeechSupported();

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text.trim()) return;
      setSpeaking(true);
      void speakText(text, {
        lang,
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      }).catch(() => setSpeaking(false));
    },
    [lang, supported],
  );

  const toggle = useCallback(
    (text: string) => {
      if (speaking) stop();
      else speak(text);
    },
    [speak, speaking, stop],
  );

  return { supported, speaking, speak, stop, toggle };
}
