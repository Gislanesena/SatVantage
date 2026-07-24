"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MicStatus = "idle" | "listening" | "unsupported" | "denied" | "error";

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: any) => void) | null;
  onerror: ((ev: any) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

/**
 * Web Speech API → preenche o draft com interim + final (pt-BR).
 */
export function useSpeechToText(opts: {
  draft: string;
  setDraft: (v: string | ((prev: string) => string)) => void;
  disabled?: boolean;
}) {
  const { draft, setDraft, disabled } = opts;
  const [status, setStatus] = useState<MicStatus>("idle");
  const recRef = useRef<SpeechRec | null>(null);
  const baseRef = useRef(""); // texto antes de começar a falar

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setStatus("idle");
  }, []);

  const start = useCallback(() => {
    if (disabled) return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }

    if (recRef.current) {
      stop();
      return;
    }

    const rec = new Ctor();
    recRef.current = rec;
    baseRef.current = draft.trimEnd();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (ev: any) => {
      let interim = "";
      let finalChunk = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        const t = r?.[0]?.transcript ?? "";
        if (r.isFinal) finalChunk += t;
        else interim += t;
      }
      if (finalChunk) {
        baseRef.current = [baseRef.current, finalChunk.trim()]
          .filter(Boolean)
          .join(" ");
      }
      const next = [baseRef.current, interim.trim()].filter(Boolean).join(" ");
      setDraft(next);
    };

    rec.onerror = (ev: any) => {
      const err = String(ev?.error || "");
      if (err === "not-allowed" || err === "service-not-allowed") {
        setStatus("denied");
      } else if (err === "aborted") {
        setStatus("idle");
      } else {
        setStatus("error");
      }
      recRef.current = null;
    };

    rec.onend = () => {
      recRef.current = null;
      setStatus((s) => (s === "listening" ? "idle" : s));
    };

    try {
      rec.start();
      setStatus("listening");
    } catch {
      setStatus("error");
      recRef.current = null;
    }
  }, [disabled, draft, setDraft, stop]);

  const toggle = useCallback(() => {
    if (status === "listening") stop();
    else start();
  }, [start, status, stop]);

  const statusMessage =
    status === "listening"
      ? "Ouvindo… fale agora"
      : status === "unsupported"
        ? "Microfone não suportado neste navegador (use Chrome/Edge)."
        : status === "denied"
          ? "Permissão de microfone negada. Ative nas configurações do site."
          : status === "error"
            ? "Falha no reconhecimento de voz. Tente de novo."
            : null;

  return { status, toggle, stop, statusMessage, listening: status === "listening" };
}
