"use client";
// Guia da homepage: mapa do site em chat. Por enquanto só "Como entrar usando Nostr".
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useI18n } from "@/lib/i18n";
import "./guide.css";
import "./mentor.css";

type ChatLine = { kind: "agent" | "user"; text: string };

type Props = {
  onCreateAccount: () => void;
  onExtension: () => void;
};

/** Só retoma auto-scroll se o usuário voltou de verdade ao fim (após ter saído). */
const RESUME_BOTTOM_PX = 28;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function distanceFromBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight;
}

export default function LandingGuide({ onCreateAccount, onExtension }: Props) {
  const { t } = useI18n();
  const tipLabel = t.mentor.nudgeNostr;
  const [open, setOpen] = useState(false);
  /** intro = visível ao carregar; exiting = sumindo; idle = só no hover */
  const [tipPhase, setTipPhase] = useState<"waiting" | "intro" | "exiting" | "idle">(
    "waiting",
  );
  const [fabAbsorbing, setFabAbsorbing] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [typing, setTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const runIdRef = useRef(0);
  /** true = usuário pediu para pausar o auto-scroll (sobe e fica parado) */
  const userPausedRef = useRef(false);
  /** true = já esteve longe do fim; só assim onScroll pode retomar */
  const wasAwayRef = useRef(false);
  const programmaticRef = useRef(false);
  const lastTouchYRef = useRef<number | null>(null);

  const maybeAutoScroll = useCallback(() => {
    const el = scrollElRef.current;
    if (!el || userPausedRef.current) return;
    programmaticRef.current = true;
    el.scrollTop = el.scrollHeight;
    // Mantém a flag o suficiente para ignorar o scroll event sintético
    window.setTimeout(() => {
      programmaticRef.current = false;
    }, 50);
  }, []);

  const bindScrollEl = useCallback((node: HTMLDivElement | null) => {
    scrollElRef.current = node;
    if (!node) return;

    const pause = () => {
      userPausedRef.current = true;
    };

    const tryResume = () => {
      if (distanceFromBottom(node) <= RESUME_BOTTOM_PX) {
        userPausedRef.current = false;
        wasAwayRef.current = false;
      }
    };

    // capture: true — pega o gesto antes do browser “engolir” o scroll
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        pause();
        return;
      }
      if (e.deltaY > 0 && userPausedRef.current) {
        // Só retoma se o usuário está rolando para baixo e já perto do fim
        window.requestAnimationFrame(tryResume);
      }
    };

    const onScroll = () => {
      if (programmaticRef.current) return;
      const d = distanceFromBottom(node);
      if (d > RESUME_BOTTOM_PX) {
        wasAwayRef.current = true;
        pause();
      } else if (wasAwayRef.current) {
        // Voltou ao rodapé depois de ter subido
        userPausedRef.current = false;
        wasAwayRef.current = false;
      }
      // Importante: NÃO limpar a pausa só porque d≈0 no início (pouco conteúdo)
    };

    const onTouchStart = (e: TouchEvent) => {
      lastTouchYRef.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (y == null || lastTouchYRef.current == null) return;
      // Dedo para baixo = conteúdo sobe (usuário lendo acima)
      if (y > lastTouchYRef.current + 2) pause();
      if (y < lastTouchYRef.current - 2 && userPausedRef.current) {
        window.requestAnimationFrame(tryResume);
      }
      lastTouchYRef.current = y;
    };

    node.addEventListener("wheel", onWheel, { passive: true, capture: true });
    node.addEventListener("scroll", onScroll, { passive: true });
    node.addEventListener("touchstart", onTouchStart, { passive: true });
    node.addEventListener("touchmove", onTouchMove, { passive: true });

    (node as HTMLDivElement & { __svUnbind?: () => void }).__svUnbind = () => {
      node.removeEventListener("wheel", onWheel, true);
      node.removeEventListener("scroll", onScroll);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const scrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      const prev = scrollElRef.current as
        | (HTMLDivElement & { __svUnbind?: () => void })
        | null;
      prev?.__svUnbind?.();
      bindScrollEl(node);
    },
    [bindScrollEl],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setTipPhase("intro"), 900);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (tipPhase !== "intro" || open) return;
    const id = window.setTimeout(() => setTipPhase("exiting"), 5000);
    return () => window.clearTimeout(id);
  }, [tipPhase, open]);

  function finishTipExit() {
    setTipPhase("idle");
    setFabAbsorbing(true);
    window.setTimeout(() => setFabAbsorbing(false), 480);
  }

  function handleTipAnimationEnd(e: React.AnimationEvent<HTMLSpanElement>) {
    if (e.animationName !== "sv-guide-tip-out") return;
    finishTipExit();
  }

  const closeChat = useCallback(() => {
    runIdRef.current += 1;
    setOpen(false);
    setBusy(false);
    setTyping(false);
    setShowActions(false);
    setTipPhase((p) => (p === "waiting" || p === "intro" ? p : "idle"));
  }, []);

  const sheetTrapRef = useFocusTrap(open, closeChat);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const el = wrapRef.current;
      const target = e.target as Node | null;
      if (el && target && !el.contains(target)) {
        closeChat();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, closeChat]);

  // Auto-scroll só quando o usuário NÃO pausou (não depende de “perto do fim”)
  useEffect(() => {
    if (!open) return;
    maybeAutoScroll();
  }, [open, lines, typing, showActions, maybeAutoScroll, lines[lines.length - 1]?.text]);

  const typeAgent = useCallback(
    async (text: string, runId: number) => {
      if (runIdRef.current !== runId) return;
      await sleep(900);
      if (runIdRef.current !== runId) return;
      setTyping(true);
      setLines((prev) => [...prev, { kind: "agent", text: "" }]);
      let i = 0;
      while (i < text.length) {
        if (runIdRef.current !== runId) return;
        i = Math.min(i + 1, text.length);
        const slice = text.slice(0, i);
        setLines((prev) => {
          const next = [...prev];
          next[next.length - 1] = { kind: "agent", text: slice };
          return next;
        });
        // Scroll imediato após pintar (respeita userPausedRef)
        window.requestAnimationFrame(() => maybeAutoScroll());
        const ch = text[i - 1];
        const delay = ch === "\n" ? 280 : /[.!?]/.test(ch ?? "") ? 160 : 36;
        await sleep(delay);
      }
      setTyping(false);
      await sleep(1400);
    },
    [maybeAutoScroll],
  );

  const runScript = useCallback(async () => {
    const runId = ++runIdRef.current;
    setBusy(true);
    setShowActions(false);
    userPausedRef.current = false;
    wasAwayRef.current = false;
    setLines([{ kind: "user", text: tipLabel }]);
    await sleep(800);
    const script = [
      t.mentor.guideScript1,
      t.mentor.guideScript2,
      t.mentor.guideScript3,
      t.mentor.guideScript4,
    ];
    for (const msg of script) {
      if (runIdRef.current !== runId) return;
      await typeAgent(msg, runId);
    }
    if (runIdRef.current !== runId) return;
    setShowActions(true);
    setBusy(false);
    window.requestAnimationFrame(() => maybeAutoScroll());
  }, [
    typeAgent,
    maybeAutoScroll,
    tipLabel,
    t.mentor.guideScript1,
    t.mentor.guideScript2,
    t.mentor.guideScript3,
    t.mentor.guideScript4,
  ]);

  function openChat() {
    setOpen(true);
    setTipPhase("idle");
    userPausedRef.current = false;
    wasAwayRef.current = false;
    void runScript();
  }

  function toggleFab() {
    if (open) {
      closeChat();
      return;
    }
    openChat();
  }

  return (
    <div
      ref={wrapRef}
      className={`sv-guide-fab-wrap${open ? " is-chat" : ""}`}
    >
      {open && (
        <div
          ref={sheetTrapRef}
          className="sv-guide-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={`${t.mentor.name} SatVantage`}
          tabIndex={-1}
        >
          <div className="sv-guide-sheet-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/satvantage-mentor.png" alt="" width={40} height={40} />
            <div className="sv-guide-sheet-titles">
              <strong>{t.mentor.name}</strong>
              <p>{t.mentor.guideSubtitle}</p>
            </div>
            <button
              type="button"
              className="sv-guide-close"
              aria-label={t.mentor.close}
              onClick={closeChat}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="sv-chat-panel sv-guide-chat">
            <div className="sv-chat-scroll sv-guide-scroll" ref={scrollRef}>
              {lines.map((line, i) =>
                line.kind === "agent" ? (
                  <div key={i} className="sv-bubble-row">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/satvantage-mentor.png"
                      alt=""
                      width={28}
                      height={28}
                      className="sv-guide-avatar"
                    />
                    <div className="sv-bubble sv-bubble--agent">
                      <div className="sv-bubble-head">
                        <span className="sv-bubble-label">{t.mentor.name}</span>
                      </div>
                      <span className="sv-bubble-text">{line.text}</span>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="sv-bubble sv-bubble--user">
                    <span className="sv-bubble-text">{line.text}</span>
                  </div>
                ),
              )}
              {typing && <p className="sv-guide-typing">{t.mentor.typing}</p>}

              {showActions && !busy && (
                <div className="sv-guide-actions-inline">
                  <div
                    className="sv-chat-options sv-guide-options"
                    role="group"
                    aria-label={t.a11y.optionsLabel}
                  >
                    <button
                      type="button"
                      className="sv-chat-option"
                      onClick={() => {
                        closeChat();
                        onCreateAccount();
                      }}
                    >
                      {t.mentor.createSimple}
                    </button>
                    <button
                      type="button"
                      className="sv-chat-option"
                      onClick={() => {
                        closeChat();
                        onExtension();
                      }}
                    >
                      {t.mentor.enterExt}
                    </button>
                    <a
                      className="sv-chat-option sv-guide-ext-link"
                      href="https://getalby.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.mentor.downloadAlby}
                    </a>
                    <button
                      type="button"
                      className="sv-chat-option"
                      onClick={closeChat}
                    >
                      {t.mentor.thanks}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="sv-guide-fab-row">
        <div
          className={`sv-guide-fab-tip-wrap${tipPhase === "idle" && !open ? " is-hoverable" : ""}`}
        >
          <button
            type="button"
            className={`sv-guide-fab${fabAbsorbing ? " is-absorbing" : ""}`}
            aria-label={open ? t.mentor.close : tipLabel}
            aria-expanded={open}
            onClick={toggleFab}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/satvantage-mentor.png" alt="" width={56} height={56} />
          </button>
          {!open && tipPhase !== "waiting" && (
            <span
              className={`sv-guide-tip${tipPhase === "intro" ? " is-intro" : ""}${tipPhase === "exiting" ? " is-exiting" : ""}${tipPhase === "idle" ? " is-hover-only" : ""}`}
              role="tooltip"
              onAnimationEnd={handleTipAnimationEnd}
              onClick={openChat}
            >
              {tipLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
