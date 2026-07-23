"use client";
// Guia da homepage: mapa do site em chat. Por enquanto só "Como entrar usando Nostr".
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/use-focus-trap";
import "./guide.css";
import "./mentor.css";

type ChatLine = { kind: "agent" | "user"; text: string };

type Props = {
  onCreateAccount: () => void;
  onExtension: () => void;
};

const NUDGE_LABEL = "Como entrar usando nostr";

const SCRIPT = [
  "Oi! Aqui no SatVantage a conta é uma identidade Nostr — um par de chaves. Assim você não precisa de e-mail, e a chave privada nunca fica no nosso servidor.",
  "Por que Nostr? Porque provar quem você é na internet não precisa ser um formulário com dado pessoal. Você assina um desafio; a gente só verifica a assinatura.",
  "Tem dois caminhos pra entrar:\n\n1) Conta simplificada — usuário e senha. Sua chave fica cifrada no navegador (o cofre). A gente guarda o cofre, nunca a chave em claro.\n\n2) Extensão Nostr (Alby ou nos2x) — a chave fica no seu dispositivo; no login você só autoriza uma assinatura.",
  "Pode criar a conta simplificada agora, ou abrir a extensão se já tiver. Qualquer dúvida, é só voltar aqui.",
] as const;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function LandingGuide({ onCreateAccount, onExtension }: Props) {
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

  const sheetTrapRef = useFocusTrap(open, closeChat);

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
    setBusy(true);
    setShowActions(false);
    setLines([]);
    setLines([{ kind: "user", text: NUDGE_LABEL }]);
    await sleep(800);
    for (const msg of SCRIPT) {
      if (runIdRef.current !== runId) return;
      await typeAgent(msg, runId);
    }
    if (runIdRef.current !== runId) return;
    setShowActions(true);
    setBusy(false);
  }, [typeAgent]);

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
          aria-label="NagAI SatVantage"
          tabIndex={-1}
        >
          <div className="sv-guide-sheet-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/satvantage-mentor.png" alt="" width={40} height={40} />
            <div className="sv-guide-sheet-titles">
              <strong>NagAI</strong>
              <p>Mapa rápido do SatVantage</p>
            </div>
            <button
              type="button"
              className="sv-guide-close"
              aria-label="Fechar NagAI"
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
                      <div className="sv-bubble-head">
                        <span className="sv-bubble-label">NagAI</span>
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
              {typing && <p className="sv-guide-typing">digitando…</p>}
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
                      Criar conta simplificada
                    </button>
                    <button
                      type="button"
                      className="sv-chat-option"
                      onClick={() => {
                        closeChat();
                        onExtension();
                      }}
                    >
                      Entrar com extensão Nostr
                    </button>
                    <a
                      className="sv-chat-option sv-guide-ext-link"
                      href="https://getalby.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Baixar extensão Alby
                    </a>
                    <button type="button" className="sv-chat-option" onClick={closeChat}>
                      Entendi, obrigado
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
          aria-label={open ? "Fechar NagAI" : "Abrir NagAI"}
          aria-expanded={open}
          onClick={toggleFab}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/satvantage-mentor.png" alt="" width={56} height={56} />
        </button>

        {!open && nudgeOn && (
          <button
            type="button"
            className={`sv-guide-nudge${nudgeExiting ? " is-exiting" : ""}`}
            onClick={openChat}
            onAnimationEnd={handleNudgeAnimationEnd}
            aria-label={NUDGE_LABEL}
          >
            <span className="sv-guide-nudge-text">{NUDGE_LABEL}</span>
          </button>
        )}
      </div>
    </div>
  );
}
