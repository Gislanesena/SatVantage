"use client";
// Chat de mentoria: painel único, histórico permanente, tópicos opcionais no fim.
import { useCallback, useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import { useI18n } from "@/lib/i18n";
import {
  MISSION_1_SLUG,
  MISSION_2_SLUG,
  type MissionSlug,
} from "@/lib/missions";
import { OPTIONAL_TOPICS, type OptionalTopic } from "@/lib/optional-topics";
import { localizeTopic } from "@/lib/topics-i18n";
import "./mentor.css";

type Lesson = {
  id: string;
  teach: string;
  question: string;
  options: string[];
};

type ChatLine =
  | { kind: "agent"; text: string }
  | { kind: "user"; text: string };

type ResponseSlot = { answer: number | null; skipped: boolean };

type ComposerMode =
  | { type: "hidden" }
  | { type: "mission"; options: string[] }
  | { type: "topic-q"; topicId: string; options: string[] }
  | {
      type: "end";
      /** mentoria 1: continuar · mentoria 2 / fim: tópicos */
      showContinue?: boolean;
      topics: OptionalTopic[];
      satsLine: string | null;
    };

type MentorChatProps = {
  slug: MissionSlug;
  onExitToHome: () => void;
  onContinueMentor?: () => void;
  onGoDashboard: () => void;
  /** Recarrega saldo/XP após submit (fonte: /api/rewards/balance) */
  onBalanceChanged?: () => void;
  /** Se true, “sair” volta ao dash (em vez da homepage) */
  fromDashboard?: boolean;
  /** Chat embutido no painel flutuante do dashboard */
  embedded?: boolean;
  /** Cabeçalho/X ficam no sheet do Dashboard */
  sheetHosted?: boolean;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function MentorChat({
  slug,
  onExitToHome,
  onContinueMentor,
  onGoDashboard,
  onBalanceChanged,
  fromDashboard = false,
  embedded = false,
  sheetHosted = false,
}: MentorChatProps) {
  const { t, locale } = useI18n();
  const m = t.mentor;
  const copy =
    slug === MISSION_1_SLUG
      ? { title: m.m1Title, intro: m.introM1, skipAllAgent: m.skipAllM1 }
      : { title: m.m2Title, intro: m.introM2, skipAllAgent: m.skipAllM2 };
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [forcePractice, setForcePractice] = useState(false);
  const [rewardEligible, setRewardEligible] = useState(true);
  const [sessionKey, setSessionKey] = useState(0);

  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [responses, setResponses] = useState<ResponseSlot[]>([]);
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [composer, setComposer] = useState<ComposerMode>({ type: "hidden" });
  const [doneTopics, setDoneTopics] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const responsesRef = useRef<ResponseSlot[]>([]);
  const lessonsRef = useRef<Lesson[]>([]);
  const stepRef = useRef(0);
  const doneTopicsRef = useRef<string[]>([]);

  const leave = fromDashboard ? onGoDashboard : onExitToHome;

  useEffect(() => {
    setForcePractice(false);
  }, [slug]);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);
  useEffect(() => {
    lessonsRef.current = lessons;
  }, [lessons]);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    doneTopicsRef.current = doneTopics;
  }, [doneTopics]);

  useEffect(() => {
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

  function pushUser(text: string) {
    setLines((prev) => [...prev, { kind: "user", text }]);
  }

  const presentLesson = useCallback(
    async (lesson: Lesson, runId: number) => {
      if (!alive(runId)) return;
      setComposer({ type: "hidden" });
      await typeAgent(lesson.teach, runId);
      if (!alive(runId)) return;
      await sleep(260);
      await typeAgent(lesson.question, runId);
      if (!alive(runId)) return;
      setComposer({ type: "mission", options: lesson.options });
    },
    [alive, typeAgent],
  );

  function remainingTopics(exclude: string[] = doneTopicsRef.current) {
    return OPTIONAL_TOPICS.filter((topic) => !exclude.includes(topic.id)).map((topic) =>
      localizeTopic(topic, locale),
    );
  }

  async function showEndMenu(
    runId: number,
    opts: {
      skipAll?: boolean;
      satsCredited?: number;
      alreadyDone?: boolean;
      satsBalance?: number;
      practiceOnly?: boolean;
    },
  ) {
    if (!alive(runId)) return;

    let satsLine: string | null = null;
    if (opts.alreadyDone) {
      await typeAgent(
        opts.skipAll ? m.alreadySkipped : m.alreadyDone,
        runId,
      );
      if (typeof opts.satsBalance === "number") {
        satsLine = m.balanceLine.replace("{n}", String(opts.satsBalance));
      }
    } else if (opts.skipAll) {
      await typeAgent(m.skipAllOk, runId);
    } else if (typeof opts.satsCredited === "number" && opts.satsCredited > 0) {
      await typeAgent(m.satsWon.replace("{n}", String(opts.satsCredited)), runId);
      await typeAgent(m.withdrawHint, runId);
      if (typeof opts.satsBalance === "number") {
        satsLine = m.balanceGuaranteed.replace("{n}", String(opts.satsBalance));
      }
    } else if (opts.practiceOnly) {
      await typeAgent(m.practiceDone, runId);
    } else if (typeof opts.satsCredited === "number") {
      await typeAgent(m.noNewSats, runId);
    }

    if (!alive(runId)) return;

    if (slug === MISSION_1_SLUG) {
      await typeAgent(m.continuePromptM1, runId);
      if (!alive(runId)) return;
      setComposer({
        type: "end",
        showContinue: true,
        topics: [],
        satsLine,
      });
    } else {
      await typeAgent(m.optionalTopicsPrompt, runId);
      if (!alive(runId)) return;
      setComposer({
        type: "end",
        showContinue: false,
        topics: remainingTopics(),
        satsLine,
      });
    }
    setBusy(false);
  }

  useEffect(() => {
    const runId = ++runIdRef.current;

    setLoading(true);
    setError(null);
    setShowGate(false);
    setStep(0);
    stepRef.current = 0;
    setLines([]);
    setLessons([]);
    lessonsRef.current = [];
    setResponses([]);
    responsesRef.current = [];
    setComposer({ type: "hidden" });
    setTyping(false);
    setBusy(false);
    setDoneTopics([]);
    doneTopicsRef.current = [];

    (async () => {
      try {
        const res = await fetch(
          `/api/missions?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}`,
        );
        const data = await res.json();
        if (!alive(runId)) return;
        if (!res.ok) throw new Error(data.error ?? "erro ao carregar");

        const loaded: Lesson[] = data.lessons ?? [];
        if (slug === MISSION_2_SLUG && loaded[0] && !String(loaded[0].id).startsWith("w")) {
          throw new Error("conteúdo da mentoria 2 inválido — recarregue a página");
        }

        setLessons(loaded);
        lessonsRef.current = loaded;
        setRewardEligible(!!data.rewardEligible);

        // Já ganhou sats desta mentoria → portão (pode refazer sem prêmio)
        if (!data.rewardEligible && !forcePractice) {
          setShowGate(true);
          setLoading(false);
          return;
        }

        setLoading(false);
        if (!loaded.length) return;

        setBusy(true);
        const intro = !data.rewardEligible ? m.practiceIntro : copy.intro;
        await typeAgent(intro, runId);
        if (!alive(runId)) return;
        await sleep(320);
        await presentLesson(loaded[0], runId);
        if (alive(runId)) setBusy(false);
      } catch (e: any) {
        if (!alive(runId)) return;
        setError(e.message ?? "falha ao carregar mentoria");
        setLessons([]);
        lessonsRef.current = [];
        setComposer({ type: "hidden" });
        setLoading(false);
      }
    })();

    return () => {
      runIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sessionKey, forcePractice, locale]);

  async function finish(payload: { responses: ResponseSlot[] } | { skipAll: true }) {
    const runId = runIdRef.current;
    setBusy(true);
    setComposer({ type: "hidden" });
    setError(null);
    try {
      const res = await fetch("/api/missions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...payload }),
      });
      const json = await res.json();
      if (!alive(runId)) return;
      if (!res.ok) throw new Error(json.error);

      // Saldo canônico vem de /api/rewards/balance (não só do JSON do submit)
      let satsBalance = typeof json.satsBalance === "number" ? json.satsBalance : undefined;
      try {
        const balRes = await fetch("/api/rewards/balance");
        if (balRes.ok) {
          const bal = await balRes.json();
          if (typeof bal.satsBalance === "number") satsBalance = bal.satsBalance;
        }
      } catch {
        /* mantém satsBalance do submit */
      }
      onBalanceChanged?.();

      await sleep(300);
      await showEndMenu(runId, {
        skipAll: !!json.skipAll,
        satsCredited: json.satsCredited ?? 0,
        satsBalance,
        practiceOnly: !!json.practiceOnly || !!json.alreadyRewarded,
      });
    } catch (e: any) {
      if (!alive(runId)) return;
      setError(e.message ?? "erro ao salvar");
      setBusy(false);
    }
  }

  async function advance(nextResponses: ResponseSlot[], nextStep: number) {
    const runId = runIdRef.current;
    const list = lessonsRef.current;
    if (nextStep >= list.length) {
      await sleep(360);
      if (!alive(runId)) return;
      await typeAgent(m.savingProgress, runId);
      if (!alive(runId)) return;
      const full = list.map((_, i) => nextResponses[i] ?? { answer: null, skipped: true });
      await finish({ responses: full });
      return;
    }
    setStep(nextStep);
    stepRef.current = nextStep;
    await sleep(360);
    if (!alive(runId)) return;
    await presentLesson(list[nextStep], runId);
    if (alive(runId)) setBusy(false);
  }

  async function answerMission(optionIndex: number) {
    const runId = runIdRef.current;
    const lesson = lessonsRef.current[stepRef.current];
    if (!lesson || busy || composer.type !== "mission") return;
    setBusy(true);
    setComposer({ type: "hidden" });
    setError(null);
    pushUser(lesson.options[optionIndex]);

    try {
      const checkRes = await fetch("/api/missions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          lessonIndex: stepRef.current,
          answer: optionIndex,
          locale,
        }),
      });
      const check = await checkRes.json();
      if (!alive(runId)) return;
      if (!checkRes.ok) throw new Error(check.error);

      const nextResponses = [...responsesRef.current];
      nextResponses[stepRef.current] = { answer: optionIndex, skipped: false };
      setResponses(nextResponses);
      responsesRef.current = nextResponses;

      await sleep(180);
      await typeAgent(check.feedback, runId);
      if (!alive(runId)) return;
      await advance(nextResponses, stepRef.current + 1);
    } catch (e: any) {
      if (!alive(runId)) return;
      setError(e.message ?? "erro ao responder");
      setComposer({ type: "mission", options: lesson.options });
      setBusy(false);
    }
  }

  async function skipQuestion() {
    const runId = runIdRef.current;
    if (busy || composer.type !== "mission" || !lessonsRef.current[stepRef.current]) return;
    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser(m.skipQUser);

    const nextResponses = [...responsesRef.current];
    nextResponses[stepRef.current] = { answer: null, skipped: true };
    setResponses(nextResponses);
    responsesRef.current = nextResponses;

    await sleep(140);
    await typeAgent(m.okContinue, runId);
    if (!alive(runId)) return;
    await advance(nextResponses, stepRef.current + 1);
  }

  async function skipAll() {
    const runId = runIdRef.current;
    if (busy) return;
    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser(m.skipAllUser);
    await typeAgent(copy.skipAllAgent, runId);
    if (!alive(runId)) return;
    await finish({ skipAll: true });
  }

  async function startOptionalTopic(topic: OptionalTopic) {
    const runId = runIdRef.current;
    if (busy) return;
    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser(topic.label);

    for (const msg of topic.teach) {
      if (!alive(runId)) return;
      await sleep(220);
      await typeAgent(msg, runId);
    }
    if (!alive(runId)) return;
    if (!topic.question || !topic.options) {
      setBusy(false);
      return;
    }
    await sleep(260);
    await typeAgent(topic.question, runId);
    if (!alive(runId)) return;
    setComposer({ type: "topic-q", topicId: topic.id, options: topic.options });
    setBusy(false);
  }

  async function answerTopic(optionIndex: number) {
    const runId = runIdRef.current;
    if (composer.type !== "topic-q" || busy) return;
    const base = OPTIONAL_TOPICS.find((t) => t.id === composer.topicId);
    if (!base?.options || base.correct == null) return;
    const topic = localizeTopic(base, locale);
    if (!topic.options || topic.correct == null) return;

    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser(topic.options[optionIndex]);

    const ok = optionIndex === topic.correct;
    await sleep(180);
    await typeAgent(
      ok
        ? (topic.feedbackCorrect ?? "Certo.")
        : (topic.feedbackWrong ?? "Não foi essa."),
      runId,
    );
    if (!alive(runId)) return;

    const nextDone = [...doneTopicsRef.current, topic.id];
    setDoneTopics(nextDone);
    doneTopicsRef.current = nextDone;

    const left = remainingTopics(nextDone);
    await sleep(280);
    if (left.length) {
      await typeAgent(m.anotherTopicOrDash, runId);
    } else {
      await typeAgent(m.extrasDone, runId);
    }
    if (!alive(runId)) return;
    setComposer({
      type: "end",
      showContinue: false,
      topics: left,
      satsLine: null,
    });
    setBusy(false);
  }

  async function skipTopicQuestion() {
    const runId = runIdRef.current;
    if (composer.type !== "topic-q" || busy) return;
    const topic = OPTIONAL_TOPICS.find((t) => t.id === composer.topicId);
    if (!topic) return;

    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser(m.skipQUser);
    await typeAgent(m.topicSkipOk, runId);
    if (!alive(runId)) return;

    const nextDone = [...doneTopicsRef.current, topic.id];
    setDoneTopics(nextDone);
    doneTopicsRef.current = nextDone;
    const left = remainingTopics(nextDone);

    await sleep(200);
    await typeAgent(
      left.length > 0 ? m.anotherOptionalOrDash : m.rereadOrDash,
      runId,
    );
    if (!alive(runId)) return;
    setComposer({ type: "end", showContinue: false, topics: left, satsLine: null });
    setBusy(false);
  }

  const shellClass = embedded ? "sv-mentor sv-mentor--embedded" : "sv-mentor";

  function shellNav() {
    if (sheetHosted) return null;
    if (embedded) {
      return (
        <div className="sv-mentor-embed-bar">
          <span>{copy.title}</span>
          <button type="button" className="linkish" onClick={leave}>
            {m.exit}
          </button>
        </div>
      );
    }
    return <SiteNav variant="mentor" />;
  }

  function mentorTitleBar() {
    if (embedded || sheetHosted) return null;
    return (
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
          <button type="button" className="sv-mentor-exit" onClick={leave}>
            {m.exit}
          </button>
        </div>
        {!rewardEligible && !showGate && !loading && (
          <p className="sv-mentor-practice-tag">{m.practiceMode}</p>
        )}
      </header>
    );
  }

  if (loading) {
    return (
      <div className={shellClass}>
        {shellNav()}
        <div className="sv-mentor-body">
          {mentorTitleBar()}
          <p className="sv-mentor-status">{m.loading}</p>
        </div>
      </div>
    );
  }

  if (showGate) {
    return (
      <div className={shellClass}>
        {shellNav()}
        <div className="sv-mentor-body">
          {mentorTitleBar()}
          <div className="sv-mentor-gate">
            <img
              src="/satvantage-mentor.png"
              alt=""
              className="sv-mentor-gate-face"
              width={88}
              height={88}
            />
            <h1>{copy.title}</h1>
            <p>{m.gateBody}</p>
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
                {m.redoWithoutSats}
              </button>
              <button type="button" className="sv-chat-cta sv-chat-cta--ghost" onClick={onGoDashboard}>
                {m.backToDashboard}
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
        {mentorTitleBar()}
        {embedded && !rewardEligible && (
          <p className="sv-mentor-practice-tag">{m.practiceMode}</p>
        )}

        <div className="sv-chat-panel">
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
                    <span className="sv-bubble-label">{m.name}</span>
                    <span className="sv-bubble-text">
                      {line.text}
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

          <div className="sv-chat-footer">
            {composer.type === "mission" && (
              <div className="sv-chat-actions">
                <div className="sv-chat-options">
                  {composer.options.map((opt, oi) => (
                    <button
                      key={oi}
                      type="button"
                      className="sv-chat-option"
                      disabled={busy}
                      onClick={() => void answerMission(oi)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="sv-chat-row">
                  <button
                    type="button"
                    className="linkish"
                    disabled={busy}
                    onClick={() => void skipQuestion()}
                  >
                    {m.skipQuestion}
                  </button>
                  <button
                    type="button"
                    className="linkish"
                    disabled={busy}
                    onClick={() => void skipAll()}
                  >
                    {m.skipConversation}
                  </button>
                </div>
              </div>
            )}

            {composer.type === "topic-q" && (
              <div className="sv-chat-actions">
                <div className="sv-chat-options">
                  {composer.options.map((opt, oi) => (
                    <button
                      key={oi}
                      type="button"
                      className="sv-chat-option"
                      disabled={busy}
                      onClick={() => void answerTopic(oi)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="sv-chat-row">
                  <button
                    type="button"
                    className="linkish"
                    disabled={busy}
                    onClick={() => void skipTopicQuestion()}
                  >
                    {m.skipQuestion}
                  </button>
                </div>
              </div>
            )}

            {composer.type === "end" && (
              <div className="sv-chat-end">
                {composer.satsLine && <p className="sv-chat-end-note">{composer.satsLine}</p>}

                {composer.showContinue && onContinueMentor && (
                  <button
                    type="button"
                    className="sv-chat-cta"
                    disabled={busy}
                    onClick={onContinueMentor}
                  >
                    {m.continueM2}
                  </button>
                )}

                {composer.topics.length > 0 && (
                  <div className="sv-topic-list">
                    <p className="sv-chat-end-note">{m.optionalTopics}</p>
                    {composer.topics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        className="sv-topic-btn"
                        disabled={busy}
                        onClick={() => void startOptionalTopic(topic)}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className={
                    composer.showContinue || composer.topics.length
                      ? "sv-chat-cta sv-chat-cta--ghost"
                      : "sv-chat-cta"
                  }
                  disabled={busy}
                  onClick={onGoDashboard}
                >
                  {embedded ? m.closeChat : m.goDashboard}
                </button>
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
