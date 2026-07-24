"use client";
// Chat educativo de tópico livre — SEM sats de missão.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import type { OptionalTopic } from "@/lib/optional-topics";
import ChatComposer from "@/components/ChatComposer";
import { useChatAutoScroll } from "@/lib/use-chat-auto-scroll";
import { useI18n, type Locale } from "@/lib/i18n";
import { localizeTopic } from "@/lib/topics-i18n";
import "./mentor.css";

type ChatLine = { kind: "agent" | "user"; text: string };

type Props = {
  topic: OptionalTopic;
  onBack: () => void;
  /** Chat embutido no painel flutuante do dashboard */
  embedded?: boolean;
  /** Mesmo host do sheet NagAI (API alinhada ao MentorChat) */
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
  const localized = useMemo(
    () => localizeTopic(topic, locale as Locale),
    [topic, locale],
  );
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [busy, setBusy] = useState(true);
  const [typing, setTyping] = useState(false);
  const [showQ, setShowQ] = useState(false);
  const [done, setDone] = useState(false);
  const [draft, setDraft] = useState("");
  const runIdRef = useRef(0);
  const scrollTrigger = `${lines.length}:${typing}:${showQ}:${done}`;
  const { scrollRef, bottomRef, onScroll, stickToBottom } =
    useChatAutoScroll(scrollTrigger);

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
    setDraft("");

    (async () => {
      await typeAgent(t.mentor.freeTopicIntro, runId);
      if (runIdRef.current !== runId) return;
      for (const msg of localized.teach) {
        await sleep(220);
        await typeAgent(msg, runId);
        if (runIdRef.current !== runId) return;
      }
      await sleep(260);
      await typeAgent(localized.question ?? "", runId);
      if (runIdRef.current !== runId) return;
      setShowQ(true);
      setBusy(false);
    })();

    return () => {
      runIdRef.current++;
    };
  }, [localized, typeAgent, t.mentor.freeTopicIntro]);

  async function answer(i: number) {
    if (busy || !showQ) return;
    const runId = runIdRef.current;
    const options = localized.options ?? [];
    setBusy(true);
    setShowQ(false);
    stickToBottom();
    setLines((p) => [...p, { kind: "user", text: options[i] ?? "" }]);
    const ok = i === localized.correct;
    await sleep(180);
    await typeAgent(
      (ok ? localized.feedbackCorrect : localized.feedbackWrong) ?? "",
      runId,
    );
    if (runIdRef.current !== runId) return;
    await sleep(200);
    await typeAgent(
      embedded ? t.mentor.freeTopicDoneEmbedded : t.mentor.freeTopicDoneDash,
      runId,
    );
    if (runIdRef.current !== runId) return;
    setDone(true);
    setBusy(false);
  }

  async function sendDoubt() {
    const text = draft.trim();
    if (!text || busy) return;
    const runId = runIdRef.current;
    setDraft("");
    setBusy(true);
    stickToBottom();
    setLines((p) => [...p, { kind: "user", text }]);
    await typeAgent(t.mentor.freeTopicNoSats, runId);
    if (runIdRef.current === runId) setBusy(false);
  }

  const shellClass = embedded ? "sv-mentor sv-mentor--embedded" : "sv-mentor";
  const showAsk = done || (!showQ && !busy);

  return (
    <div className={shellClass}>
      {embedded && !sheetHosted ? (
        <div className="sv-mentor-embed-bar">
          <span>{localized.label}</span>
          <button type="button" className="linkish" onClick={onBack}>
            {t.mentor.close}
          </button>
        </div>
      ) : !embedded ? (
        <SiteNav variant="mentor" onExitMentor={onBack} />
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
              <h1>{localized.label}</h1>
            </div>
            <p className="sv-mentor-practice-tag">{t.mentor.freeTopicTag}</p>
          </header>
        )}
        {embedded && (
          <p className="sv-mentor-practice-tag">{t.mentor.freeTopicTag}</p>
        )}

        <div className="sv-chat-panel">
          <div
            className="sv-chat-scroll"
            ref={scrollRef}
            onScroll={onScroll}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label={t.mentor.name}
          >
            {lines.map((line, idx) =>
              line.kind === "agent" ? (
                line.text ? (
                <div key={idx} className="sv-bubble-row">
                  <img
                    src="/satvantage-mentor.png"
                    alt=""
                    className="sv-mentor-face"
                    width={36}
                    height={36}
                  />
                  <div className="sv-bubble sv-bubble--agent">
                    <div className="sv-bubble-head">
                      <span className="sv-bubble-label">{t.mentor.name}</span>
                    </div>
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
                ) : null
              ) : (
                <div key={idx} className="sv-bubble sv-bubble--user">
                  {line.text}
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>

          <div
            className={`sv-chat-footer${embedded ? " sv-chat-footer--sheet" : ""}`}
          >
            {showQ && (
              <div className="sv-chat-options">
                {(localized.options ?? []).map((opt, oi) => (
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

            {showAsk && (
              <ChatComposer
                draft={draft}
                setDraft={setDraft}
                disabled={busy}
                onSubmit={() => void sendDoubt()}
                sendLabel="text"
              />
            )}

            {done && (
              <button
                type="button"
                className="sv-chat-cta sv-chat-cta--sheet-back"
                onClick={onBack}
              >
                {embedded ? t.mentor.backToTopics : t.mentor.backToDashboard}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
