"use client";
// Guia da homepage: mapa do site em chat. Por enquanto só "Como entrar usando Nostr".
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import "./guide.css";
import "./mentor.css";

type ChatLine = { kind: "agent" | "user"; text: string };

type Props = {
  onCreateAccount: () => void;
  onExtension: () => void;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function LandingGuide({ onCreateAccount, onExtension }: Props) {
  const { t, locale } = useI18n();
  const m = t.mentor;
  const [open, setOpen] = useState(false);
  const [nudgeOn, setNudgeOn] = useState(false);
  const [nudgeExiting, setNudgeExiting] = useState(false);
  const [fabAbsorbing, setFabAbsorbing] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [typing, setTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);

  // Notificação sai do ícone depois de um breve instante
  useEffect(() => {
    const id = window.setTimeout(() => setNudgeOn(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  // Depois de 5s, recolhe de volta para o ícone
  useEffect(() => {
    if (!nudgeOn || nudgeExiting || open) return;
    const id = window.setTimeout(() => setNudgeExiting(true), 5000);
    return () => window.clearTimeout(id);
  }, [nudgeOn, nudgeExiting, open]);

  function finishNudgeExit() {
    setNudgeOn(false);
    setNudgeExiting(false);
    setFabAbsorbing(true);
    window.setTimeout(() => setFabAbsorbing(false), 480);
  }

  function handleNudgeAnimationEnd(e: React.AnimationEvent<HTMLButtonElement>) {
    if (e.animationName !== "sv-guide-nudge-out") return;
    finishNudgeExit();
  }

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, typing, showActions, open]);

  const closeChat = useCallback(() => {
    runIdRef.current += 1;
    setOpen(false);
    setBusy(false);
    setTyping(false);
    setShowActions(false);
    setNudgeExiting(false);
    setNudgeOn(true);
  }, []);

  // Clicar fora do chat (e do botão) fecha
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

  const typeAgent = useCallback(async (text: string, runId: number) => {
    if (runIdRef.current !== runId) return;
    // Pausa antes de começar a digitar (dá tempo de ler a mensagem anterior)
    await sleep(900);
    if (runIdRef.current !== runId) return;
    setTyping(true);
    setLines((prev) => [...prev, { kind: "agent", text: "" }]);
    const chunk = 1;
    let i = 0;
    while (i < text.length) {
      if (runIdRef.current !== runId) return;
      i = Math.min(i + chunk, text.length);
      const slice = text.slice(0, i);
      setLines((prev) => {
        const next = [...prev];
        next[next.length - 1] = { kind: "agent", text: slice };
        return next;
      });
      // Letras um pouco mais lentas; pontuação “respira” mais
      const ch = text[i - 1];
      const delay = ch === "\n" ? 280 : /[.!?]/.test(ch ?? "") ? 160 : 36;
      await sleep(delay);
    }
    setTyping(false);
    // Pausa depois da mensagem completa, para acompanhar a leitura
    await sleep(1400);
  }, []);

  const runScript = useCallback(async () => {
    const runId = ++runIdRef.current;
    const script = [m.guideScript1, m.guideScript2, m.guideScript3, m.guideScript4];
    setBusy(true);
    setShowActions(false);
    setLines([]);
    setLines([{ kind: "user", text: m.nudgeNostr }]);
    await sleep(800);
    for (const msg of script) {
      if (runIdRef.current !== runId) return;
      await typeAgent(msg, runId);
    }
    if (runIdRef.current !== runId) return;
    setShowActions(true);
    setBusy(false);
  }, [typeAgent, m.guideScript1, m.guideScript2, m.guideScript3, m.guideScript4, m.nudgeNostr]);

  function openChat() {
    setOpen(true);
    setNudgeExiting(false);
    setNudgeOn(false);
    void runScript();
  }

  function toggleFab() {
    if (open) {
      closeChat();
      return;
    }
    openChat();
  }

  // Se o idioma mudar com o chat aberto, reinicia o roteiro no novo idioma
  useEffect(() => {
    if (!open) return;
    void runScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return (
    <div
      ref={wrapRef}
      className={`sv-guide-fab-wrap${open ? " is-chat" : ""}`}
    >
      {open && (
        <div className="sv-guide-sheet" role="dialog" aria-label={`${m.name} SatVantage`}>
          <div className="sv-guide-sheet-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/satvantage-mentor.png" alt="" width={40} height={40} />
            <div className="sv-guide-sheet-titles">
              <strong>{m.name}</strong>
              <p>{m.guideSubtitle}</p>
            </div>
            <button
              type="button"
              className="sv-guide-close"
              aria-label={m.closeNagAI}
              onClick={closeChat}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="sv-chat-panel sv-guide-chat">
            <div className="sv-chat-scroll">
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
                      <span className="sv-bubble-label">{m.name}</span>
                      <span className="sv-bubble-text">{line.text}</span>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="sv-bubble sv-bubble--user">
                    <span className="sv-bubble-text">{line.text}</span>
                  </div>
                ),
              )}
              {typing && <p className="sv-guide-typing">{m.typing}</p>}
              <div ref={bottomRef} />
            </div>

            {showActions && !busy && (
              <div className="sv-chat-footer">
                <div className="sv-chat-actions">
                  <div className="sv-chat-options">
                    <button
                      type="button"
                      className="sv-chat-option"
                      onClick={() => {
                        closeChat();
                        onCreateAccount();
                      }}
                    >
                      {m.createSimple}
                    </button>
                    <button
                      type="button"
                      className="sv-chat-option"
                      onClick={() => {
                        closeChat();
                        onExtension();
                      }}
                    >
                      {m.enterExt}
                    </button>
                    <a
                      className="sv-chat-option sv-guide-ext-link"
                      href="https://getalby.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {m.downloadAlby}
                    </a>
                    <button type="button" className="sv-chat-option" onClick={closeChat}>
                      {m.thanks}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sv-guide-fab-row">
        <button
          type="button"
          className={`sv-guide-fab${fabAbsorbing ? " is-absorbing" : ""}`}
          aria-label={open ? m.closeNagAI : m.openNagAI}
          aria-expanded={open}
          onClick={toggleFab}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/satvantage-mentor.png" alt="" width={56} height={56} />
        </button>

        {!open && nudgeOn && (
          <button
            type="button"
            key={locale}
            className={`sv-guide-nudge${nudgeExiting ? " is-exiting" : ""}`}
            onClick={openChat}
            onAnimationEnd={handleNudgeAnimationEnd}
            aria-label={m.nudgeNostr}
          >
            <span className="sv-guide-nudge-text">{m.nudgeNostr}</span>
          </button>
        )}
      </div>
    </div>
  );
}
