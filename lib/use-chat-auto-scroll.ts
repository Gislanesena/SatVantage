"use client";

import { useCallback, useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 120;

/**
 * Auto-scroll do chat só quando o usuário já está perto do fim.
 * Se rolar para cima para ler mensagens antigas, pausa até voltar ao rodapé.
 */
export function useChatAutoScroll(trigger: unknown) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance <= NEAR_BOTTOM_PX;
  }, []);

  /** Chamar ao enviar mensagem do usuário para voltar a acompanhar o fim. */
  const stickToBottom = useCallback(() => {
    stickToBottomRef.current = true;
  }, []);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [trigger]);

  return { scrollRef, bottomRef, onScroll, stickToBottom };
}
