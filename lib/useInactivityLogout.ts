"use client";
// Logout por INATIVIDADE (não por tempo de sessão) — 20min sem interação,
// com aviso 1min antes. Refresh e navegação normal nunca deslogam sozinhos;
// só a ausência de mouse/tecla/toque reinicia o contador.
import { useEffect, useRef, useState } from "react";

const TIMEOUT_MS = 20 * 60_000;
const WARNING_MS = TIMEOUT_MS - 60_000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

export function useInactivityLogout(active: boolean, onTimeout: () => void) {
  const [warning, setWarning] = useState(false);
  const warnTimer = useRef<ReturnType<typeof setTimeout>>();
  const outTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!active) {
      setWarning(false);
      clearTimeout(warnTimer.current);
      clearTimeout(outTimer.current);
      return;
    }

    function reset() {
      setWarning(false);
      clearTimeout(warnTimer.current);
      clearTimeout(outTimer.current);
      warnTimer.current = setTimeout(() => setWarning(true), WARNING_MS);
      outTimer.current = setTimeout(() => onTimeout(), TIMEOUT_MS);
    }

    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, reset));
    reset();

    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, reset));
      clearTimeout(warnTimer.current);
      clearTimeout(outTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { warning };
}
