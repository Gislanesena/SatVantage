"use client";

import { useCallback, useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 64;

/**
 * Auto-scroll do chat só quando o usuário já está perto do fim.
 * Wheel para cima / scroll longe do rodapé → pausa até voltar ao fim.
 */
export function useChatAutoScroll(trigger: unknown) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const programmaticRef = useRef(false);

  const syncStickFromEl = useCallback(() => {
    const el = scrollRef.current;
    if (!el || programmaticRef.current) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance <= NEAR_BOTTOM_PX;
  }, []);

  const onScroll = useCallback(() => {
    syncStickFromEl();
  }, [syncStickFromEl]);

  const stickToBottom = useCallback(() => {
    stickToBottomRef.current = true;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) stickToBottomRef.current = false;
    };
    const onTouchMove = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distance > NEAR_BOTTOM_PX) stickToBottomRef.current = false;
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onTouchMove);
    };
  });

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const el = scrollRef.current;
    if (el) {
      programmaticRef.current = true;
      el.scrollTop = el.scrollHeight;
      requestAnimationFrame(() => {
        programmaticRef.current = false;
      });
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [trigger]);

  return { scrollRef, bottomRef, onScroll, stickToBottom };
}
