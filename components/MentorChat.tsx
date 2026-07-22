"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import LearningModePicker from "@/components/LearningModePicker";
import InvestTutorial from "@/components/InvestTutorial";
import ProTraderSimulator from "@/components/ProTraderSimulator";
import {
  MISSION_1_SLUG,
  MISSION_2_SLUG,
  type MissionSlug,
} from "@/lib/missions";
import "./mentor.css";
import { useI18n, type Locale } from "@/lib/i18n";
import { quizTriggerMessage, speechLocale } from "@/lib/lang";

type ChatLine =
  | { kind: "agent"; text: string }
  | { kind: "user"; text: string };

type ComposerMode =
  | { type: "hidden" }
  | { type: "free-input" }
  | { type: "learning-pick" }
  | { type: "tutorial" }
  | { type: "simulator" };

type MentorChatProps = {
  slug: MissionSlug;
  level?: string;
  onExitToHome: () => void;
  onContinueMentor?: () => void;
  onGoDashboard: () => void;
  onBalanceChanged?: () => void;
  fromDashboard?: boolean;
  embedded?: boolean;
  sheetHosted?: boolean;
  [key: string]: any;
};

const COPY: Record<
  MissionSlug,
  { title: string; intro: string; skipAllAgent: string }
> = {
  [MISSION_1_SLUG]: {
    title: "NagAI · Primeiros passos",
    intro: "Oi! Eu sou a NagAI, sua mentora de Bitcoin. Para negociar com facilidade, contamos com as corretoras conectadas para você comprar seus ativos. Qual sua dúvida sobre Bitcoin hoje?",
    skipAllAgent: "Tudo bem. Vamos direto ao dashboard.",
  },
  [MISSION_2_SLUG]: {
    title: "NagAI · Carteira e Lightning",
    intro: "Oi! Eu sou a NagAI, sua mentora de Bitcoin. Para negociar com facilidade, contamos com as corretoras Mercado Bitcoin, Binance e Blink integradas. Qual sua dúvida sobre Bitcoin hoje?",
    skipAllAgent: "Sem problema. Vamos ao dashboard.",
  },
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Remove Markdown residual para bolhas de texto puro. */
function toPlainChatText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\[DESAFIO\]\s*/g, "")
    .trim();
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function MentorChat({
  slug,
  level = "iniciante",
  onExitToHome,
  onContinueMentor,
  onGoDashboard,
  onBalanceChanged,
  fromDashboard = false,
  embedded = false,
  sheetHosted = false,
}: MentorChatProps) {
  const { locale } = useI18n();
  const safeSlug = COPY[slug] ? slug : MISSION_1_SLUG;
  const copy = COPY[safeSlug];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [forcePractice, setForcePractice] = useState(false);
  const [rewardEligible, setRewardEligible] = useState(true);
  const [sessionKey, setSessionKey] = useState(0);
  const [satsNotification, setSatsNotification] = useState<number | null>(null);

  const [lines, setLines] = useState<ChatLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [composer, setComposer] = useState<ComposerMode>({ type: "hidden" });
  const [userInputText, setUserInputText] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [satsBalance, setSatsBalance] = useState<number | null>(null);

  const lang: Locale = locale;
  const prevLocaleRef = useRef<Locale>(locale);

  const bottomRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sendFreeTextRef = useRef<(textToSend?: string) => Promise<void>>(
    async () => {},
  );

  const leave = fromDashboard ? onGoDashboard : onExitToHome;

  const refreshSatsBalance = useCallback(async () => {
    try {
      // Mesma fonte do Dashboard: GET /api/rewards/balance → satsBalance
      const res = await fetch("/api/rewards/balance");
      if (!res.ok) return;
      const j = await res.json();
      setSatsBalance(typeof j.satsBalance === "number" ? j.satsBalance : 0);
    } catch {
      /* ignore */
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
  }, []);

  useEffect(() => {
    setSpeechSupported(!!getSpeechRecognitionCtor());
    setTtsSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
  }, []);

  useEffect(() => {
    void refreshSatsBalance();
  }, [refreshSatsBalance, sessionKey]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (busy && listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
    }
  }, [busy, listening]);

  useEffect(() => {
    setForcePractice(false);
  }, [slug]);

  useEffect(() => {
    // No simulador/tutorial o auto-scroll do chat briga com o spotlight.
    if (composer.type === "simulator" || composer.type === "tutorial") return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, composer, typing]);

  const alive = useCallback((runId: number) => runIdRef.current === runId, []);

  const typeAgent = useCallback(
    async (text: string, runId: number) => {
      if (!alive(runId)) return;
      setTyping(true);
      setLines((prev) => [...prev, { kind: "agent", text: "" }]);

      const chunk = text.length > 160 ? 3 : text.length > 80 ? 2 : 1;
      let i = 0;
      while (i < text.length) {
        if (!alive(runId)) return;
        i = Math.min(i + chunk, text.length);
        const slice = text.slice(0, i);
        setLines((prev) => {
          const next = [...prev];
          next[next.length - 1] = { kind: "agent", text: slice };
          return next;
        });
        await sleep(16);
      }
      if (alive(runId)) setTyping(false);
    },
    [alive],
  );

const sendFreeText = useCallback(
    async (textToSend?: string) => {
      const runId = runIdRef.current;
      const text = textToSend || userInputText;
      if (!text.trim() || busy) return;

      const newUserLine: ChatLine = { kind: "user", text };
      // Já criamos a lista atualizada incluindo a mensagem atual do usuário imediatamente
      const updatedLines = [...lines, newUserLine];

      setBusy(true);
      setComposer({ type: "hidden" });
      setUserInputText("");
      setError(null);
      setLines(updatedLines);

      try {
        // Envia o array atualizado com a pergunta e a resposta do usuário
        const historicoFormatado = updatedLines.map((l) => ({
          role: l.kind === "agent" ? "assistant" : "user",
          content: l.text,
        }));

        const res = await fetch("http://127.0.0.1:8000/api/api/mentor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mensagem_usuario: text,
            nivel_conhecimento: level,
            historico: historicoFormatado,
            idioma: lang,
          }),
        });

        const check = await res.json();
        if (!alive(runId)) return;
        if (!res.ok) throw new Error(check.error || "Erro ao responder");

        const rawResposta = String(
          check.resposta_ia || check.resposta || check.message || "Entendido!",
        );
        const tinhaDesafio = /\[DESAFIO\]/i.test(rawResposta);
        const respostaIa = toPlainChatText(rawResposta);

        await sleep(180);
        await typeAgent(respostaIa, runId);
        if (!alive(runId)) return;

        // Tag interna no histórico (oculta na UI via toPlainChatText) para o
        // backend avaliar a próxima mensagem como resposta do quiz.
        if (tinhaDesafio) {
          setLines((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.kind === "agent" && !/\[DESAFIO\]/i.test(last.text)) {
              next[next.length - 1] = {
                kind: "agent",
                text: `[DESAFIO] ${last.text}`,
              };
            }
            return next;
          });
        }

        if (check.ganhou_sats && check.sats_ganhos > 0) {
          setSatsNotification(check.sats_ganhos);

          try {
            await fetch("/api/rewards/credit-quiz", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: check.sats_ganhos }),
            });
          } catch {
            /* notificação ainda aparece; saldo pode atualizar depois */
          }

          setTimeout(() => {
            setSatsNotification(null);
          }, 4000);

          void refreshSatsBalance();
          if (onBalanceChanged) {
            onBalanceChanged();
          }
        }

        setComposer({ type: "free-input" });
        setBusy(false);
      } catch (e: any) {
        if (!alive(runId)) return;
        setError(e.message ?? "erro ao responder");
        setComposer({ type: "free-input" });
        setBusy(false);
      }
    },
    [
      userInputText,
      busy,
      lines,
      level,
      lang,
      alive,
      typeAgent,
      onBalanceChanged,
      refreshSatsBalance,
    ]
  );

  useEffect(() => {
    sendFreeTextRef.current = sendFreeText;
  }, [sendFreeText]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  // Troca de idioma (LanguageSelect / sv_locale) → reinicia intro no novo idioma.
  useEffect(() => {
    if (prevLocaleRef.current === locale) return;
    prevLocaleRef.current = locale;
    stopSpeaking();
    stopListening();
    setSessionKey((k) => k + 1);
  }, [locale, stopSpeaking, stopListening]);

  const toggleVoiceInput = useCallback(() => {
    if (busy) return;

    if (listening) {
      stopListening();
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Seu navegador não suporta ditado por voz. Use Chrome ou Edge.");
      return;
    }

    setError(null);
    stopSpeaking();
    const recognition = new Ctor();
    recognition.lang = speechLocale(lang);
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript ?? "";
      }
      const text = transcript.trim();
      if (!text) return;
      setUserInputText(text);

      const last = event.results[event.results.length - 1];
      if (last?.isFinal) {
        setListening(false);
        void sendFreeTextRef.current(text);
      }
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      const code = event?.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Permissão de microfone negada. Libere o mic no navegador e tente de novo.");
      } else if (code !== "aborted" && code !== "no-speech") {
        setError("Não foi possível captar o áudio. Tente novamente.");
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      setError("Não foi possível iniciar o microfone.");
    }
  }, [busy, listening, stopListening, stopSpeaking, lang]);

  const toggleSpeakMessage = useCallback(
    (index: number, rawText: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setError("Seu navegador não suporta leitura em voz alta.");
        return;
      }

      const text = toPlainChatText(rawText);
      if (!text.trim()) return;

      if (speakingIndex === index) {
        stopSpeaking();
        return;
      }

      stopListening();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLocale(lang);
      utterance.rate = 1;
      utterance.onend = () => setSpeakingIndex(null);
      utterance.onerror = () => setSpeakingIndex(null);

      setSpeakingIndex(index);
      window.speechSynthesis.speak(utterance);
    },
    [speakingIndex, stopListening, stopSpeaking, lang],
  );

  useEffect(() => {
    const runId = ++runIdRef.current;

    setLoading(true);
    setError(null);
    setShowGate(false);
    setLines([]);
    setComposer({ type: "hidden" });
    setTyping(false);
    setBusy(false);

    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/api/mentor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mensagem_usuario: "iniciar",
            nivel_conhecimento: level,
            idioma: lang,
          }),
        });

        const data = await res.json();
        if (!alive(runId)) return;
        if (!res.ok) throw new Error(data.error ?? "erro ao carregar");

        const textResponse = toPlainChatText(
          data.resposta_ia && data.resposta_ia !== "Qual sua dúvida sobre bitcoin hj?"
            ? data.resposta_ia
            : copy.intro,
        );

        setRewardEligible(!!data.rewardEligible);

        setLoading(false);
        setBusy(true);
        await typeAgent(textResponse, runId);
        if (!alive(runId)) return;

        setComposer({ type: "free-input" });
        if (alive(runId)) setBusy(false);
      } catch (e: any) {
        if (!alive(runId)) return;
        
        setLoading(false);
        setBusy(true);
        await typeAgent(copy.intro, runId);
        if (!alive(runId)) return;
        setComposer({ type: "free-input" });
        if (alive(runId)) setBusy(false);
      }
    })();

    return () => {
      runIdRef.current++;
    };
  }, [safeSlug, sessionKey, forcePractice, alive, copy.intro, level, lang, typeAgent]);

  const shellClass = embedded ? "sv-mentor sv-mentor--embedded" : "sv-mentor";

  function shellNav() {
    if (sheetHosted) return null;
    if (embedded) {
      return (
        <div className="sv-mentor-embed-bar">
          <span>{copy.title}</span>
          <button type="button" className="linkish" onClick={leave}>
            Fechar
          </button>
        </div>
      );
    }
    return (
      <SiteNav
        variant="mentor"
        onExitMentor={leave}
      />
    );
  }

  if (loading) {
    return (
      <div className={shellClass}>
        {shellNav()}
        <div className="sv-mentor-body">
          <p className="sv-mentor-status">Abrindo conversa…</p>
        </div>
      </div>
    );
  }

  if (showGate) {
    return (
      <div className={shellClass}>
        {shellNav()}
        <div className="sv-mentor-body">
          <div className="sv-mentor-gate">
            <img
              src="/satvantage-mentor.png"
              alt=""
              className="sv-mentor-gate-face"
              width={88}
              height={88}
            />
            <h1>{copy.title}</h1>
            <p>Nesta conta os sats desta conversa já foram creditados.</p>
            <div className="sv-mentor-gate-actions">
              <button
                type="button"
                className="sv-chat-cta"
                onClick={() => {
                  setForcePractice(true);
                  setShowGate(false);
                  setSessionKey((k) => k + 1);
                }}
              >
                Refazer sem novos sats
              </button>
              <button type="button" className="sv-chat-cta sv-chat-cta--ghost" onClick={onGoDashboard}>
                Voltar ao dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      {shellNav()}

      <div className="sv-mentor-body">
        {!embedded && (
          <header className="sv-mentor-head">
            <div className="sv-mentor-head-row">
              <img
                src="/satvantage-mentor.png"
                alt=""
                className="sv-mentor-head-face"
                width={40}
                height={40}
              />
              <h1>{copy.title}</h1>
              <span className="sv-mentor-sats" aria-label="Saldo de satoshis">
                <span aria-hidden="true">⚡</span>{" "}
                {satsBalance === null
                  ? "…"
                  : `${satsBalance.toLocaleString("pt-BR")} sats`}
              </span>
            </div>
            <nav className="sv-mentor-quick" aria-label="Acesso rápido">
              <button
                type="button"
                className={`sv-mentor-quick-btn${
                  composer.type === "learning-pick" || composer.type === "tutorial"
                    ? " is-active"
                    : ""
                }`}
                onClick={() => setComposer({ type: "learning-pick" })}
                disabled={busy}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M8 4h8v2.2c0 2.4-1.8 4.4-4 4.8-2.2-.4-4-2.4-4-4.8V4Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 5.5H5.8A2.8 2.8 0 0 0 8.6 9M16 5.5h2.2A2.8 2.8 0 0 1 15.4 9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 11.2V14M9.5 20h5M10.5 14h3l.5 6h-4l.5-6Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Teste de Conhecimento</span>
              </button>
              <button
                type="button"
                className="sv-mentor-quick-btn"
                onClick={onGoDashboard}
                disabled={busy}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 14.5V19a1 1 0 0 0 1 1h4.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 12l5.2-3.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="1.4" fill="currentColor" />
                  <path
                    d="M14.8 19h4.2a1 1 0 0 0 1-1v-2.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Dashboard</span>
              </button>
            </nav>
          </header>
        )}

        <div
          className={`sv-chat-panel${
            composer.type === "simulator" ? " sv-chat-panel--sim" : ""
          }`}
        >
          <div className="sv-chat-scroll">
            {lines.map((line, i) =>
              line.kind === "agent" ? (
                <div key={i} className="sv-bubble-row">
                  <img
                    src="/satvantage-mentor.png"
                    alt=""
                    className="sv-mentor-face"
                    width={36}
                    height={36}
                  />
                  <div className="sv-bubble sv-bubble--agent">
                    <div className="sv-bubble-head">
                      <span className="sv-bubble-label">NagAI</span>
                      {ttsSupported &&
                        !(typing && i === lines.length - 1) &&
                        !!toPlainChatText(line.text) && (
                          <button
                            type="button"
                            className={`sv-chat-speak${speakingIndex === i ? " is-speaking" : ""}`}
                            aria-label={
                              speakingIndex === i
                                ? "Parar leitura"
                                : "Ouvir mensagem"
                            }
                            title={
                              speakingIndex === i
                                ? "Parar leitura"
                                : "Ouvir em voz alta"
                            }
                            onClick={() => toggleSpeakMessage(i, line.text)}
                          >
                            {speakingIndex === i ? (
                              <svg
                                className="sv-chat-speak-icon"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <rect
                                  x="6"
                                  y="6"
                                  width="12"
                                  height="12"
                                  rx="1.5"
                                  fill="#ffffff"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="sv-chat-speak-icon"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M3 10v4h4l5 4V6L7 10H3z"
                                  fill="#ffffff"
                                />
                                <path
                                  d="M16 9a4 4 0 0 1 0 6"
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  fill="none"
                                />
                                <path
                                  d="M18.5 7a7 7 0 0 1 0 10"
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  fill="none"
                                />
                              </svg>
                            )}
                          </button>
                        )}
                    </div>
                    <span className="sv-bubble-text">
                      {toPlainChatText(line.text)}
                      {typing && i === lines.length - 1 ? (
                        <span className="sv-caret" aria-hidden>
                          |
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
              ) : (
                <div key={i} className="sv-bubble sv-bubble--user">
                  <span className="sv-bubble-text">{line.text}</span>
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>

          {satsNotification && (
            <div style={{
              background: "linear-gradient(135deg, #f7931a, #ffb84d)",
              color: "#000",
              padding: "8px 16px",
              borderRadius: "20px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "8px 16px",
              boxShadow: "0 4px 12px rgba(247, 147, 26, 0.4)"
            }}>
              ⚡ +{satsNotification} Satoshis adicionados ao seu saldo!
            </div>
          )}

          <div className="sv-chat-footer">
            {composer.type === "learning-pick" && (
              <LearningModePicker
                disabled={busy}
                onBack={() => setComposer({ type: "free-input" })}
                onSelectTeorico={() => setComposer({ type: "tutorial" })}
                onSelectPratico={() => setComposer({ type: "simulator" })}
              />
            )}

            {composer.type === "tutorial" && (
              <InvestTutorial
                disabled={busy}
                onBack={() => setComposer({ type: "free-input" })}
                onStartQuiz={() => {
                  setComposer({ type: "free-input" });
                  void sendFreeText(quizTriggerMessage(lang));
                }}
              />
            )}

            {composer.type === "simulator" && (
              <ProTraderSimulator
                disabled={busy}
                onBack={() => setComposer({ type: "free-input" })}
                onGoDashboard={onGoDashboard}
              />
            )}

            {composer.type === "free-input" && (
              <div className="sv-chat-actions">
                <div style={{ display: "flex", gap: "8px", width: "100%", alignItems: "center" }}>
                  <input
                    type="text"
                    value={userInputText}
                    onChange={(e) => setUserInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !busy) {
                        if (listening) stopListening();
                        void sendFreeText();
                      }
                    }}
                    placeholder={
                      listening
                        ? "Ouvindo… fale sua dúvida"
                        : "Digite sua dúvida sobre Bitcoin aqui..."
                    }
                    disabled={busy}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: listening
                        ? "1px solid rgba(59, 130, 246, 0.7)"
                        : "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      outline: "none",
                    }}
                  />
                  {speechSupported && (
                    <button
                      type="button"
                      className={`sv-chat-mic${listening ? " is-listening" : ""}`}
                      aria-label={listening ? "Parar ditado" : "Falar mensagem"}
                      aria-pressed={listening}
                      title={listening ? "Parar ditado" : "Enviar por voz"}
                      disabled={busy}
                      onClick={toggleVoiceInput}
                    >
                      <svg
                        className="sv-chat-mic-icon"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <rect
                          x="9"
                          y="2"
                          width="6"
                          height="11"
                          rx="3"
                          stroke="#ffffff"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M5 11a7 7 0 0 0 14 0"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M12 18v3"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8 21h8"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    className="sv-chat-cta"
                    style={{ padding: "0 16px", whiteSpace: "nowrap" }}
                    disabled={busy || !userInputText.trim()}
                    onClick={() => {
                      if (listening) stopListening();
                      void sendFreeText();
                    }}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="sv-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}