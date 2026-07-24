"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Prende o foco dentro de um diálogo aberto e restaura ao fechar.
 * Esc fecha via `onEscape` (opcional).
 */
export function useFocusTrap(
  active: boolean,
  onEscape?: () => void,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    if (!node) return;

    prevFocusRef.current = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const list = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0,
      );
      (list[0] ?? node).focus();
    };

    const t = window.setTimeout(focusFirst, 30);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const list = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0,
      );
      if (list.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (current === first || !node.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else if (current === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown, true);
      const prev = prevFocusRef.current;
      if (prev && typeof prev.focus === "function") {
        try {
          prev.focus();
        } catch {
          /* ignore */
        }
      }
    };
  }, [active]);

  return containerRef;
}
