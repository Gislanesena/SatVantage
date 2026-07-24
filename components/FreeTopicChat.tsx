"use client";
// Chat educativo de tópico livre — SEM sats de missão.
// Quiz (sugestões) ou conversa com dúvidas livres (Dúvidas importantes).
import { useCallback, useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import { matchTopicAnswer, type OptionalTopic } from "@/lib/optional-topics";
import { useI18n } from "@/lib/i18n";
import { EMPTY_DOUBT, NO_MATCH_DOUBT, type TopicLocale } from "@/lib/topics-i18n";
import "./mentor.css";

type ChatLine = { kind: "agent" | "user"; text: string };

type Props = {
  topic: OptionalTopic;
  onBack: () => void;
  /** Chat embutido no painel flutuante do dashboard */
  embedded?: boolean;
  /** Cabeçalho/X ficam no sheet do Dashboard — não duplicar barra */
  sheetHosted?: boolean;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function FreeTopicChat({
  topic,
  onBack,
  embedded = false,
  sheetHosted = false,
}: Props) {
  const { t, locale } = useI18n();
  const m = t.mentor;
  const isConverse = topic.mode === "converse";
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [busy, setBusy] = useState(true);
  const [typing, setTyping] = useState(false);
  const [showQ, setShowQ] = useState(false);
  const [canAsk, setCanAsk] = useState(false);
  const [done, setDone] = useState(false);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, showQ, canAsk, done, typing]);

  useEffect(() => {
    if (canAsk && !busy) inputRef.current?.focus();
  }, [canAsk, busy]);

  const typeAgent = useCallback(async (text: string, runId: number) => {
    if (runIdRef.current !== runId) return;
    await sleep(900);
    if (runIdRef.current !== runId) return;
    setTyping(true);
    setLines((prev) => [...prev, { kind: "agent", text: "" }]);
    let i = 0;
    while (i < text.length) {
      if (runIdRef.current !== runId) return;
      i += 1;
      const slice = text.slice(0, i);
      setLines((prev) => {
        const next = [...prev];
        next[next.length - 1] = { kind: "agent", text: slice };
        return next;
      });
      const ch = text[i - 1];
      const delay = ch === "\n" ? 280 : /[.!?]/.test(ch ?? "") ? 160 : 36;
      await sleep(delay);
    }
    if (runIdRef.current === runId) setTyping(false);
    await sleep(1400);
  }, []);

  useEffect(() => {
    const runId = ++runIdRef.current;
    setLines([]);
    setShowQ(false);
    setCanAsk(false);
    setDone(false);
    setDraft("");
    setBusy(true);

    (async () => {
      setLines([{ kind: "user", text: topic.label }]);
      await sleep(800);
      if (runIdRef.current !== runId) return;
      await typeAgent(m.freeTopicLead, runId);
      if (runIdRef.current !== runId) return;
      for (const msg of topic.teach) {
        if (runIdRef.current !== runId) return;
        await typeAgent(msg, runId);
      }
      if (runIdRef.current !== runId) return;

      if (isConverse) {
        await typeAgent(
          topic.inviteDoubt ??
            "Ficou alguma dúvida? Pode perguntar com suas palavras.",
          runId,
        );
        if (runIdRef.current !== runId) return;
        setCanAsk(true);
        setBusy(false);
        return;
      }

      if (topic.question) {
        await typeAgent(topic.question, runId);
        if (runIdRef.current !== runId) return;
        setShowQ(true);
      }
      setBusy(false);
    })();

    return () => {
      runIdRef.current++;
    };
  }, [topic, typeAgent, isConverse, locale, m.freeTopicLead]);

  async function answerQuiz(i: number) {
    if (busy || !showQ || !topic.options || topic.correct == null) return;
    const runId = runIdRef.current;
    setBusy(true);
    setShowQ(false);
    setLines((p) => [...p, { kind: "user", text: topic.options![i] }]);
    const ok = i === topic.correct;
    await sleep(800);
    await typeAgent(
      ok ? (topic.feedbackCorrect ?? "Isso.") : (topic.feedbackWrong ?? "Quase — pense de novo."),
      runId,
    );
    if (runIdRef.current !== runId) return;
    await typeAgent(
      embedded ? m.freeTopicDoneEmbedded : m.freeTopicDoneDash,
      runId,
    );
    if (runIdRef.current !== runId) return;
    setDone(true);
    setBusy(false);
  }

  async function sendDoubt() {
    const text = draft.trim();
    if (!text || busy || !canAsk) return;
    const runId = runIdRef.current;
    setDraft("");
    setBusy(true);
    setLines((p) => [...p, { kind: "user", text }]);
    await sleep(500);
    if (runIdRef.current !== runId) return;

    const reply = matchTopicAnswer(topic, text, {
      empty: EMPTY_DOUBT[locale as TopicLocale] ?? EMPTY_DOUBT.pt,
      noMatch: NO_MATCH_DOUBT[locale as TopicLocale] ?? NO_MATCH_DOUBT.pt,
    });
    await typeAgent(reply, runId);
    if (runIdRef.current !== runId) return;
    await typeAgent(m.askMore, runId);
    if (runIdRef.current !== runId) return;
    setBusy(false);
  }

  const shellClass = embedded ? "sv-mentor sv-mentor--embedded" : "sv-mentor";

  return (
    <div className={shellClass}>
      {embedded && !sheetHosted ? (
        <div className="sv-mentor-embed-bar">
          <span>{topic.label}</span>
          <button type="button" className="linkish" onClick={onBack}>
            {m.exit}
          </button>
        </div>
      ) : !embedded ? (
        <SiteNav variant="mentor" />
      ) : null}
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
              <button type="button" className="sv-mentor-exit" onClick={onBack}>
                {m.exit}
              </button>
            </div>
          </header>
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
                    <span className="sv-bubble-label">{m.name}</span>
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
            {showQ && topic.options && (
              <div className="sv-chat-options">
                {topic.options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    className="sv-chat-option"
                    disabled={busy}
                    onClick={() => void answerQuiz(oi)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {canAsk && (
              <form
                className="sv-chat-ask"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendDoubt();
                }}
              >
                <input
                  ref={inputRef}
                  className="sv-chat-ask-input"
                  type="text"
                  value={draft}
                  disabled={busy}
                  placeholder={m.askPlaceholder}
                  autoComplete="off"
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="submit"
                  className="sv-chat-ask-send"
                  disabled={busy || !draft.trim()}
                >
                  {m.send}
                </button>
              </form>
            )}

            {(done || canAsk) && (
              <button type="button" className="sv-chat-cta sv-chat-cta--ghost" onClick={onBack}>
                {embedded ? m.backToTopics : m.backToDashboard}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
