/**
 * Utilitário global de síntese de voz (Web Speech API).
 * Preferência: voz feminina pt-BR quando disponível.
 */
import { resolveFemaleVoice } from "@/lib/speech-voices";

export type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: () => void;
};

let currentUtter: SpeechSynthesisUtterance | null = null;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  currentUtter = null;
}

export function pauseSpeaking(): void {
  if (!isSpeechSupported()) return;
  try {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  } catch {
    /* ignore */
  }
}

export function resumeSpeaking(): void {
  if (!isSpeechSupported()) return;
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {
    /* ignore */
  }
}

export function isSpeechPaused(): boolean {
  if (!isSpeechSupported()) return false;
  try {
    return window.speechSynthesis.paused;
  } catch {
    return false;
  }
}

/**
 * Lê `text` em voz alta. Cancela qualquer leitura em andamento.
 * Retorna Promise que resolve ao terminar (ou rejeita em erro).
 */
export async function speakText(
  text: string,
  opts: SpeakOptions = {},
): Promise<void> {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!isSpeechSupported() || !clean) return;

  const lang = opts.lang ?? "pt-BR";
  stopSpeaking();

  const voice = await resolveFemaleVoice(lang);
  const utter = new SpeechSynthesisUtterance(clean);
  currentUtter = utter;
  utter.lang = lang;
  utter.rate = opts.rate ?? 1;
  utter.pitch = opts.pitch ?? 1.05;
  if (voice) utter.voice = voice;

  return new Promise((resolve, reject) => {
    utter.onend = () => {
      if (currentUtter === utter) currentUtter = null;
      opts.onEnd?.();
      resolve();
    };
    utter.onerror = () => {
      if (currentUtter === utter) currentUtter = null;
      opts.onError?.();
      reject(new Error("speech_error"));
    };
    // Chrome: cancel + speak no mesmo tick às vezes falha
    window.setTimeout(() => {
      try {
        window.speechSynthesis.speak(utter);
      } catch {
        opts.onError?.();
        reject(new Error("speech_error"));
      }
    }, 20);
  });
}

/** Extrai texto legível de um elemento (ou seletor), removendo ruído a11y. */
export function extractReadableText(root?: Element | string | null): string {
  if (typeof document === "undefined") return "";
  const el =
    typeof root === "string"
      ? document.querySelector(root)
      : root ??
        document.getElementById("conteudo") ??
        document.getElementById("topo") ??
        document.querySelector("main") ??
        document.body;
  if (!el) return "";
  const clone = el.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      "script, style, noscript, [aria-hidden='true'], .sv-a11y, .sv-a11y-dock, .sv-a11y-fab, .sv-skip, [vw], .sv-sr-only, #sv-vlibras-root",
    )
    .forEach((n) => n.remove());
  return (clone.innerText || "").replace(/\s+\n/g, "\n").trim().slice(0, 12000);
}
