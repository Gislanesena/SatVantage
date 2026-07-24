"use client";
// Chat educativo de tópico livre — SEM sats de missão.
import { useCallback, useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import type { OptionalTopic } from "@/lib/optional-topics";
import "./mentor.css";

type ChatLine = { kind: "agent" | "user"; text: string };

type Props = {
  topic: OptionalTopic;
  onBack: () => void;
  /** Chat embutido no painel flutuante do dashboard */
  embedded?: boolean;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function FreeTopicChat({ topic, onBack, embedded = false }: Props) {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [busy, setBusy] = useState(true);
  const [typing, setTyping] = useState(false);
  const [showQ, setShowQ] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, showQ, done, typing]);

  const typeAgent = useCallback(async (text: string, runId: number) => {
    if (runIdRef.current !== runId) return;
    setTyping(true);
    setLines((prev) => [...prev, { kind: "agent", text: "" }]);
    const chunk = text.length > 120 ? 3 : 2;
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
      await sleep(16);
    }
    if (runIdRef.current === runId) setTyping(false);
  }, []);

  useEffect(() => {
    const runId = ++runIdRef.current;
    setLines([]);
    setShowQ(false);
    setDone(false);
    setBusy(true);

    (async () => {
      await typeAgent(
        "Esse assunto é só aprendizado — sem sats de missão. Vamos com calma.",
        runId,
      );
      if (runIdRef.current !== runId) return;
      for (const msg of topic.teach) {
        await sleep(220);
        await typeAgent(msg, runId);
        if (runIdRef.current !== runId) return;
      }
      await sleep(260);
      await typeAgent(topic.question, runId);
      if (runIdRef.current !== runId) return;
      setShowQ(true);
      setBusy(false);
    })();

    return () => {
      runIdRef.current++;
    };
  }, [topic, typeAgent]);

  async function answer(i: number) {
    if (busy || !showQ) return;
    const runId = runIdRef.current;
    setBusy(true);
    setShowQ(false);
    setLines((p) => [...p, { kind: "user", text: topic.options[i] }]);
    const ok = i === topic.correct;
    await sleep(180);
    await typeAgent(ok ? topic.feedbackCorrect : topic.feedbackWrong, runId);
    if (runIdRef.current !== runId) return;
    await sleep(200);
    await typeAgent(
      embedded
        ? "Pode fechar o chat ou abrir outro assunto no mentor — o dashboard continua aí."
        : "Pode voltar ao dashboard quando quiser — ou abrir outro assunto no mentor.",
      runId,
    );
    if (runIdRef.current !== runId) return;
    setDone(true);
    setBusy(false);
  }

  const shellClass = embedded ? "sv-mentor sv-mentor--embedded" : "sv-mentor";

  return (
    <div className={shellClass}>
      {embedded ? (
        <div className="sv-mentor-embed-bar">
          <span>{topic.label}</span>
          <button type="button" className="linkish" onClick={onBack}>
            Fechar
          </button>
        </div>
      ) : (
        <SiteNav variant="mentor" onExitMentor={onBack} />
      )}
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
              <h1>{topic.label}</h1>
            </div>
            <p className="sv-mentor-practice-tag">Assunto livre · sem sats de missão</p>
          </header>
        )}
        {embedded && (
          <p className="sv-mentor-practice-tag">Assunto livre · sem sats de missão</p>
        )}

        <div className="sv-chat-panel">
          <div className="sv-chat-scroll">
            {lines.map((line, idx) =>
              line.kind === "agent" ? (
                <div key={idx} className="sv-bubble-row">
                  <img
                    src="/satvantage-mentor.png"
                    alt=""
                    className="sv-mentor-face"
                    width={36}
                    height={36}
                  />
                  <div className="sv-bubble sv-bubble--agent">
                    <span className="sv-bubble-label">Mentor</span>
                    <span className="sv-bubble-text">
                      {line.text}
                      {typing && idx === lines.length - 1 ? (
                        <span className="sv-caret" aria-hidden>
                          |
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
              ) : (
                <div key={idx} className="sv-bubble sv-bubble--user">
                  {line.text}
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>

          <div className="sv-chat-footer">
            {showQ && (
              <div className="sv-chat-options">
                {topic.options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    className="sv-chat-option"
                    disabled={busy}
                    onClick={() => void answer(oi)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {done && (
              <button type="button" className="sv-chat-cta" onClick={onBack}>
                {embedded ? "Voltar aos assuntos" : "Voltar ao dashboard"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
