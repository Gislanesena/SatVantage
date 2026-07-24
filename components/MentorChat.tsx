"use client";
// NagAI: chat livre por padrão; Teste de Conhecimento abre Teórico (quiz 5/3) ou Prático.
import { useCallback, useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import {
  MISSION_1_SLUG,
  MISSION_2_SLUG,
  type MissionSlug,
} from "@/lib/missions";
import { OPTIONAL_TOPICS, type OptionalTopic } from "@/lib/optional-topics";
import { postAgent } from "@/lib/agents-client";
import ChatComposer from "@/components/ChatComposer";
import SpeakButton from "@/components/SpeakButton";
import TradeSimulator from "@/components/TradeSimulator";
import SkipToContent from "@/components/SkipToContent";
import { useSpeechToText } from "@/lib/use-speech-to-text";
import { matchSpokenOption } from "@/lib/match-spoken-option";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { dictFor, useI18n, type Locale } from "@/lib/i18n";
import { localizeLessonClient } from "@/lib/quiz-i18n";
import { localizeTopic } from "@/lib/topics-i18n";
import { useChatAutoScroll } from "@/lib/use-chat-auto-scroll";
import NagaiHistoryDrawer from "@/components/NagaiHistoryDrawer";
import A11yDialog from "@/components/A11yDialog";
import {
  newConversationId,
  resolveHistoryScope,
  upsertHistoryConversation,
  type NagaiHistoryLine,
} from "@/lib/nagai-history";
import "./mentor.css";

/** Espelha quiz.ts — não importar quiz no cliente (contém gabarito). */
const SATS_CORRECT = 5;
const SATS_TRIED = 3;

type Lesson = {
  id: string;
  teach: string;
  question: string;
  options: string[];
};

type ChatLine =
  | { kind: "agent"; text: string; satsNote?: string; sats?: number; lang?: Locale }
  | { kind: "user"; text: string; lang?: Locale };

type ResponseSlot = { answer: number | null; skipped: boolean };

type ComposerMode =
  | { type: "hidden" }
  | { type: "mission"; options: string[] }
  | { type: "topic-q"; topicId: string; options: string[] }
  | {
      type: "end";
      showContinue?: boolean;
      topics: OptionalTopic[];
      satsLine: string | null;
      /** Destaque amarelo com sats ganhos neste teste */
      satsHighlight?: string | null;
      /** Fecha direto no dashboard (teste de 1 pergunta) */
      dashboardOnly?: boolean;
    };

/** chat = livre · quiz = teórico · pratico = simulador de trade */
type UiMode = "chat" | "quiz" | "pratico";

export type MentorIntent = "chat" | "quiz" | "pratico";

type MentorChatProps = {
  slug: MissionSlug;
  onExitToHome: () => void;
  onContinueMentor?: () => void;
  onGoDashboard: () => void;
  onBalanceChanged?: () => void;
  fromDashboard?: boolean;
  embedded?: boolean;
  sheetHosted?: boolean;
  /** Ação pedida ao abrir (ex.: menu do FAB → quiz ou simulador). */
  initialIntent?: MentorIntent;
  /** Usuário já confirmou no dashboard que vai revisar sem novos sats. */
  startAsPractice?: boolean;
};

const COPY_KEYS = {
  [MISSION_1_SLUG]: { title: "titleM1", intro: "introM1" },
  [MISSION_2_SLUG]: { title: "titleM2", intro: "introM2" },
} as const;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const NAGAI_TEMPLATE_KEYS = [
  "hitSats",
  "trySats",
  "thisTest",
  "accountBalance",
  "historyMessages",
] as const;

type NagaiStringKey = Exclude<
  keyof ReturnType<typeof dictFor>["nagai"],
  never
>;

/** Mapa texto(qualquer idioma) → variantes pt/en/es para chaves string do nagai. */
function buildNagaiTextTriples(): Map<string, Record<Locale, string>> {
  const map = new Map<string, Record<Locale, string>>();
  const pt = dictFor("pt").nagai;
  const en = dictFor("en").nagai;
  const es = dictFor("es").nagai;
  for (const key of Object.keys(pt) as NagaiStringKey[]) {
    const pv = pt[key];
    const ev = en[key];
    const sv = es[key];
    if (typeof pv !== "string" || typeof ev !== "string" || typeof sv !== "string") {
      continue;
    }
    const triple = { pt: pv, en: ev, es: sv };
    map.set(pv, triple);
    map.set(ev, triple);
    map.set(sv, triple);
  }
  return map;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Remapeia texto conhecido (i18n) para o locale alvo; null se for mensagem livre. */
function remapKnownChatText(text: string, target: Locale): string | null {
  if (!text.trim()) return text;
  const triples = buildNagaiTextTriples();
  const hit = triples.get(text);
  if (hit) return hit[target];

  for (const key of NAGAI_TEMPLATE_KEYS) {
    for (const src of ["pt", "en", "es"] as Locale[]) {
      const template = dictFor(src).nagai[key];
      if (typeof template !== "string" || !template.includes("{")) continue;
      const pattern = `^${escapeRegExp(template)
        .replace("\\{sats\\}", "(.+)")
        .replace("\\{n\\}", "(.+)")}$`;
      const m = text.match(new RegExp(pattern));
      if (!m) continue;
      let out = dictFor(target).nagai[key] as string;
      if (template.includes("{sats}") && m[1] != null) {
        out = out.replace("{sats}", m[1]);
      } else if (template.includes("{n}") && m[1] != null) {
        out = out.replace("{n}", m[1]);
      }
      return out;
    }
  }
  return null;
}

/** Tradução livre PT/EN/ES (MyMemory) — não depende do mentor Bitcoin. */
async function translateFreeText(
  text: string,
  from: Locale,
  to: Locale,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || from === to) return text;
  try {
    const chunks: string[] = [];
    let rest = trimmed;
    while (rest.length > 0) {
      chunks.push(rest.slice(0, 450));
      rest = rest.slice(450);
    }
    const parts: string[] = [];
    for (const chunk of chunks) {
      const url =
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}` +
        `&langpair=${from}|${to}`;
      const res = await fetch(url);
      if (!res.ok) return text;
      const data = (await res.json()) as {
        responseData?: { translatedText?: string };
      };
      const out = data.responseData?.translatedText?.trim();
      if (!out || /MYMEMORY WARNING/i.test(out)) return text;
      parts.push(out);
    }
    return parts.join("");
  } catch {
    return text;
  }
}

function guessLineLang(text: string, fallback: Locale): Locale {
  const known = remapKnownChatText(text, "pt");
  if (known != null) {
    // texto já é de algum dicionário — descobrir origem
    for (const loc of ["pt", "en", "es"] as Locale[]) {
      if (buildNagaiTextTriples().get(text)?.[loc] === text) return loc;
    }
  }
  // Heurística leve
  if (/[áàâãéêíóôõúç]/i.test(text) && !/[ñ¿¡]/i.test(text)) return "pt";
  if (/[ñ¿¡]/i.test(text)) return "es";
  if (/\b(the|and|you|what|how|bitcoin)\b/i.test(text) && !/[áàâãéêíóôõúçñ]/i.test(text)) {
    return "en";
  }
  return fallback;
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
  initialIntent = "chat",
  startAsPractice = false,
}: MentorChatProps) {
  const { t, locale } = useI18n();
  const copyKeys = COPY_KEYS[slug];
  const copy = {
    title: t.nagai[copyKeys.title],
    intro: t.nagai[copyKeys.intro],
  };
  const [mode, setMode] = useState<UiMode>(
    initialIntent === "pratico" ? "pratico" : "chat",
  );
  const [showKnowledgePicker, setShowKnowledgePicker] = useState(false);
  const [draft, setDraft] = useState("");
  const [sessionSats, setSessionSats] = useState(0);
  const [accountBalance, setAccountBalance] = useState<number | null>(null);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [forcePractice, setForcePractice] = useState(startAsPractice);
  const [rewardEligible, setRewardEligible] = useState(true);

  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [responses, setResponses] = useState<ResponseSlot[]>([]);
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [composer, setComposer] = useState<ComposerMode>({ type: "hidden" });
  const [doneTopics, setDoneTopics] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversationId, setConversationId] = useState(() => newConversationId());
  const conversationCreatedAtRef = useRef(Date.now());
  const historyScopeRef = useRef("guest");

  const runIdRef = useRef(0);
  const responsesRef = useRef<ResponseSlot[]>([]);
  const lessonsRef = useRef<Lesson[]>([]);
  const stepRef = useRef(0);
  const doneTopicsRef = useRef<string[]>([]);
  const busyRef = useRef(false);
  const typingRef = useRef(false);
  const linesRef = useRef<ChatLine[]>([]);
  const localeChatReadyRef = useRef(false);
  const localeChatAppliedRef = useRef<Locale | null>(null);
  const relocalizeIdRef = useRef(0);
  const knowledgeTrapRef = useFocusTrap(showKnowledgePicker, () =>
    setShowKnowledgePicker(false),
  );

  const scrollTrigger = `${lines.length}:${typing}:${composer.type}:${showKnowledgePicker}:${mode}`;
  const {
    scrollRef,
    bottomRef: chatBottomRef,
    onScroll: onChatScroll,
    stickToBottom,
  } = useChatAutoScroll(scrollTrigger);

  const leave = fromDashboard ? onGoDashboard : onExitToHome;

  useEffect(() => {
    setMode("chat");
    setShowKnowledgePicker(false);
    setForcePractice(startAsPractice);
    setShowGate(false);
    setDraft("");
  }, [slug, startAsPractice]);

  const [voiceDraft, setVoiceDraft] = useState("");
  const quizSpeech = useSpeechToText({
    draft: voiceDraft,
    setDraft: setVoiceDraft,
    disabled: busy || composer.type !== "mission",
  });

  useEffect(() => {
    if (composer.type !== "mission" || busy || !voiceDraft.trim()) return;
    const matched = matchSpokenOption(voiceDraft, composer.options);
    if (matched === null) return;
    quizSpeech.stop();
    setVoiceDraft("");
    if (matched === -1) {
      void skipQuestion();
      return;
    }
    void answerMission(matched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceDraft, composer, busy]);

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
    busyRef.current = busy;
  }, [busy]);
  useEffect(() => {
    typingRef.current = typing;
  }, [typing]);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  useEffect(() => {
    void resolveHistoryScope().then((s) => {
      historyScopeRef.current = s;
    });
  }, []);

  /** Persiste conversa livre (metadados no índice; mensagens em chave separada). */
  useEffect(() => {
    if (mode !== "chat" || typing || busy) return;
    if (lines.length < 2) return;
    const hasUser = lines.some((l) => l.kind === "user" && l.text.trim());
    if (!hasUser) return;

    const timer = window.setTimeout(() => {
      upsertHistoryConversation(historyScopeRef.current, {
        id: conversationId,
        locale: locale as Locale,
        slug,
        lines: lines as NagaiHistoryLine[],
        createdAt: conversationCreatedAtRef.current,
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [lines, mode, typing, busy, conversationId, locale, slug]);

  const alive = useCallback((runId: number) => runIdRef.current === runId, []);

  const typeAgent = useCallback(
    async (
      text: string,
      runId: number,
      meta?: { satsNote?: string; sats?: number },
    ) => {
      if (!alive(runId)) return;
      setTyping(true);
      setLines((prev) => [
        ...prev,
        {
          kind: "agent",
          text: "",
          satsNote: meta?.satsNote,
          sats: meta?.sats,
          lang: locale as Locale,
        },
      ]);
      const chunk = text.length > 160 ? 3 : text.length > 80 ? 2 : 1;
      let i = 0;
      while (i < text.length) {
        if (!alive(runId)) {
          setTyping(false);
          return;
        }
        i = Math.min(i + chunk, text.length);
        const slice = text.slice(0, i);
        setLines((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.kind === "agent") {
            next[next.length - 1] = { ...last, text: slice };
          }
          return next;
        });
        await sleep(16);
      }
      if (alive(runId)) setTyping(false);
    },
    [alive, locale],
  );

  function pushUser(text: string) {
    stickToBottom();
    setLines((prev) => [
      ...prev,
      { kind: "user", text, lang: locale as Locale },
    ]);
  }

  function flushHistorySave(nextLines = lines) {
    if (nextLines.length < 2) return;
    if (!nextLines.some((l) => l.kind === "user" && l.text.trim())) return;
    upsertHistoryConversation(historyScopeRef.current, {
      id: conversationId,
      locale: locale as Locale,
      slug,
      lines: nextLines as NagaiHistoryLine[],
      createdAt: conversationCreatedAtRef.current,
    });
  }

  function startNewConversation() {
    flushHistorySave();
    const runId = ++runIdRef.current;
    setConversationId(newConversationId());
    conversationCreatedAtRef.current = Date.now();
    setMode("chat");
    setShowKnowledgePicker(false);
    setShowGate(false);
    setHistoryOpen(false);
    setError(null);
    setComposer({ type: "hidden" });
    setLines([]);
    stickToBottom();
    setBusy(true);
    void (async () => {
      await typeAgent(copy.intro, runId);
      if (alive(runId)) setBusy(false);
    })();
  }

  function loadHistoryConversation(id: string, histLines: NagaiHistoryLine[]) {
    flushHistorySave();
    runIdRef.current += 1;
    setConversationId(id);
    conversationCreatedAtRef.current = Date.now();
    setMode("chat");
    setShowKnowledgePicker(false);
    setShowGate(false);
    setComposer({ type: "hidden" });
    setBusy(false);
    setTyping(false);
    setError(null);
    stickToBottom();
    setLines(
      histLines.map((l) => ({
        kind: l.kind,
        text: l.text,
        satsNote: l.satsNote,
        sats: l.sats,
      })),
    );
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
    return OPTIONAL_TOPICS.filter((t) => !exclude.includes(t.id));
  }

  // Entrada: chat livre, quiz automático ou simulador (conforme initialIntent)
  useEffect(() => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setError(null);
    setLines([]);
    setComposer({ type: "hidden" });
    setBusy(false);
    setTyping(false);
    setShowKnowledgePicker(false);

    if (initialIntent === "pratico") {
      setMode("pratico");
      setLoading(false);
      return () => {
        runIdRef.current++;
      };
    }

    setMode("chat");

    (async () => {
      setLoading(false);
      if (initialIntent === "quiz") {
        // Quiz sobe no efeito dedicado (após hydrate), sem intro duplicada.
        return;
      }
      setBusy(true);
      await typeAgent(copy.intro, runId);
      if (alive(runId)) setBusy(false);
    })();

    return () => {
      runIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, initialIntent]);

  useEffect(() => {
    if (initialIntent !== "quiz") return;
    const id = window.setTimeout(() => {
      void startTheoreticalQuiz();
    }, 80);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, initialIntent]);

  const rewardEligibleRef = useRef(true);
  useEffect(() => {
    rewardEligibleRef.current = rewardEligible;
  }, [rewardEligible]);

  /** Idioma muda no chat: traduz TODO o histórico (user + agente) para o idioma ativo. */
  useEffect(() => {
    if (mode !== "chat") return;
    const target = locale as Locale;
    if (!localeChatReadyRef.current) {
      localeChatReadyRef.current = true;
      localeChatAppliedRef.current = target;
      return;
    }
    // Mesmo idioma já aplicado com sucesso → não re-traduz (ex.: voltar do simulador)
    if (localeChatAppliedRef.current === target) return;

    let cancelled = false;
    const myId = ++relocalizeIdRef.current;
    const stillMine = () => !cancelled && relocalizeIdRef.current === myId;

    (async () => {
      while (!cancelled && (busyRef.current || typingRef.current)) {
        await sleep(80);
      }
      if (!stillMine()) return;

      const snapshot = linesRef.current;
      if (!snapshot.length) {
        // Sem linhas: marca o idioma atual (intro virá depois)
        if (stillMine()) localeChatAppliedRef.current = target;
        return;
      }

      const introTarget = copy.intro;
      const intros = new Set([
        dictFor("pt").nagai.introM1,
        dictFor("en").nagai.introM1,
        dictFor("es").nagai.introM1,
        dictFor("pt").nagai.introM2,
        dictFor("en").nagai.introM2,
        dictFor("es").nagai.introM2,
      ]);

      setBusy(true);
      try {
        const next: ChatLine[] = [];
        for (let i = 0; i < snapshot.length; i++) {
          if (!stillMine()) return;
          const line = snapshot[i]!;

          if (line.kind === "agent") {
            // Intro / boas-vindas → chave i18n do idioma ativo
            if (i === 0 || intros.has(line.text)) {
              next.push({
                kind: "agent",
                text: introTarget,
                lang: target,
                sats: line.sats,
                satsNote: line.satsNote
                  ? (remapKnownChatText(line.satsNote, target) ?? line.satsNote)
                  : line.satsNote,
              });
              setLines([...next, ...snapshot.slice(i + 1)]);
              continue;
            }

            const known = remapKnownChatText(line.text, target);
            const from = line.lang ?? guessLineLang(line.text, "pt");
            const text =
              known ?? (await translateFreeText(line.text, from, target));
            let satsNote = line.satsNote;
            if (satsNote) {
              satsNote =
                remapKnownChatText(satsNote, target) ??
                (await translateFreeText(satsNote, from, target));
            }
            next.push({
              kind: "agent",
              text,
              satsNote,
              sats: line.sats,
              lang: target,
            });
          } else {
            const known = remapKnownChatText(line.text, target);
            const from = line.lang ?? guessLineLang(line.text, "pt");
            const text =
              known ?? (await translateFreeText(line.text, from, target));
            next.push({ kind: "user", text, lang: target });
          }
          setLines([...next, ...snapshot.slice(i + 1)]);
        }
        if (stillMine()) {
          setLines(next);
          // Só marca idioma aplicado após conclusão — evita histórico misto
          // se o efeito for cancelado ao ir para quiz/simulador.
          localeChatAppliedRef.current = target;
        }
      } finally {
        if (stillMine()) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
      relocalizeIdRef.current += 1;
    };
  }, [locale, copy.intro, mode]);

  /** Se o idioma muda com o quiz aberto, reescreve intro + teach + pergunta + opções. */
  useEffect(() => {
    if (mode !== "quiz" || composer.type !== "mission") return;
    let cancelled = false;
    const nagai = dictFor(locale as Locale).nagai;
    const introText = rewardEligibleRef.current
      ? nagai.quizIntroEarn
      : nagai.quizIntroPractice;

    (async () => {
      try {
        const res = await fetch(
          `/api/missions?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}`,
        );
        const data = await res.json();
        if (cancelled || !res.ok) return;
        const raw: Lesson[] = (data.lessons ?? []).slice(0, 1);
        const loaded = raw.map((l) => localizeLessonClient(l, locale));
        if (!loaded[0]) return;
        setLessons(loaded);
        lessonsRef.current = loaded;
        setComposer({ type: "mission", options: loaded[0].options });
        setLines((prev) => {
          const next = [...prev];
          // Ordem típica: user(want) → agent(intro) → agent(teach) → agent(question)
          const agentIdx: number[] = [];
          for (let i = 0; i < next.length; i++) {
            if (next[i].kind === "agent") agentIdx.push(i);
          }
          if (agentIdx.length >= 3) {
            const [iIntro, iTeach, iQ] = agentIdx.slice(-3);
            next[iIntro] = { ...next[iIntro], text: introText };
            next[iTeach] = { ...next[iTeach], text: loaded[0].teach };
            next[iQ] = { ...next[iQ], text: loaded[0].question };
          } else if (agentIdx.length === 2) {
            const [iTeach, iQ] = agentIdx;
            next[iTeach] = { ...next[iTeach], text: loaded[0].teach };
            next[iQ] = { ...next[iQ], text: loaded[0].question };
          }
          for (let i = 0; i < next.length; i++) {
            if (next[i].kind === "user") {
              next[i] = { ...next[i], text: nagai.wantTheoretical };
              break;
            }
          }
          return next;
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, mode, composer.type, slug]);

  async function startTheoreticalQuiz(opts?: { practiceConfirmed?: boolean }) {
    const runId = ++runIdRef.current;
    // Fonte da verdade: idioma do Header (contexto React)
    const activeLocale = locale as Locale;
    const nagai = dictFor(activeLocale).nagai;
    flushHistorySave();

    const asPractice =
      !!opts?.practiceConfirmed || forcePractice || startAsPractice;
    if (opts?.practiceConfirmed) {
      setForcePractice(true);
    }

    setShowKnowledgePicker(false);
    setMode("quiz");
    setSessionSats(0);
    setError(null);
    setShowGate(false);
    setStep(0);
    stepRef.current = 0;
    setResponses([]);
    responsesRef.current = [];
    setComposer({ type: "hidden" });
    setBusy(true);
    setLines([]);
    pushUser(nagai.wantTheoretical);

    try {
      const res = await fetch(
        `/api/missions?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(activeLocale)}`,
      );
      const data = await res.json();
      if (!alive(runId)) return;
      if (!res.ok) throw new Error(data.error ?? "erro ao carregar teste");

      const loaded: Lesson[] = (data.lessons ?? [])
        .slice(0, 1)
        .map((l: Lesson) => localizeLessonClient(l, activeLocale));
      setLessons(loaded);
      lessonsRef.current = loaded;
      setRewardEligible(!!data.rewardEligible);
      rewardEligibleRef.current = !!data.rewardEligible;

      if (!data.rewardEligible && !asPractice) {
        setShowGate(true);
        setBusy(false);
        return;
      }

      if (asPractice) {
        setForcePractice(true);
      }

      if (!loaded.length) {
        await typeAgent(nagai.quizEmpty, runId);
        setMode("chat");
        setBusy(false);
        return;
      }

      const intro = !data.rewardEligible
        ? nagai.quizIntroPractice
        : nagai.quizIntroEarn;
      await typeAgent(intro, runId);
      if (!alive(runId)) return;
      await sleep(280);
      await presentLesson(loaded[0], runId);
      if (alive(runId)) setBusy(false);
    } catch (e: any) {
      if (!alive(runId)) return;
      setError(e.message ?? "falha ao iniciar teste");
      setMode("chat");
      setBusy(false);
    }
  }

  function startPracticalSim() {
    setShowKnowledgePicker(false);
    setComposer({ type: "hidden" });
    setBusy(false);
    setError(null);
    setMode("pratico");
  }

  function exitPracticalSim() {
    const runId = ++runIdRef.current;
    setMode("chat");
    setComposer({ type: "hidden" });
    setShowKnowledgePicker(false);
    setError(null);
    setTyping(false);
    stickToBottom();

    // Sem mensagens (ex.: entrou direto no simulador) → restaura a intro da NagAI
    if (linesRef.current.length === 0) {
      setBusy(true);
      void (async () => {
        await typeAgent(copy.intro, runId);
        if (alive(runId)) setBusy(false);
      })();
      return;
    }
    setBusy(false);
  }

  async function sendFreeChat() {
    const text = draft.trim();
    if (!text || busy || mode === "quiz") return;
    const runId = ++runIdRef.current;
    setDraft("");
    setBusy(true);
    setError(null);
    pushUser(text);
    try {
      const { ok, data } = await postAgent<{
        error?: string;
        resposta_ia?: string;
        feedback?: string;
        resposta?: string;
      }>("interact", {
        mensagem_usuario: text,
        tema_atual: "Bitcoin",
        idioma: locale,
        locale,
      });
      if (!alive(runId)) return;
      if (!ok) throw new Error(data.error ?? "falha na NagAI");
      const reply =
        data.resposta_ia || data.feedback || data.resposta || t.nagai.reformulate;
      await typeAgent(reply, runId);
    } catch (e: any) {
      if (!alive(runId)) return;
      setError(e.message ?? "erro ao enviar");
      await typeAgent(
        t.nagai.agentError,
        runId,
      );
    } finally {
      if (alive(runId)) setBusy(false);
    }
  }

  async function showEndMenu(
    runId: number,
    opts: {
      skipAll?: boolean;
      satsCredited?: number;
      alreadyDone?: boolean;
      satsBalance?: number;
      practiceOnly?: boolean;
      earnedThisRound?: number;
    },
  ) {
    if (!alive(runId)) return;

    let satsLine: string | null = null;
    let satsHighlight: string | null = null;
    const earned =
      typeof opts.earnedThisRound === "number"
        ? opts.earnedThisRound
        : typeof opts.satsCredited === "number"
          ? opts.satsCredited
          : 0;

    if (opts.alreadyDone) {
      await typeAgent(
        opts.skipAll ? t.mentor.alreadySkipped : t.mentor.alreadyDone,
        runId,
      );
      if (typeof opts.satsBalance === "number") {
        satsLine = t.mentor.balanceLine.replace("{n}", String(opts.satsBalance));
      }
    } else if (opts.skipAll) {
      await typeAgent(t.nagai.zeroSatsClosed, runId);
      satsHighlight = t.nagai.zeroSatsTest;
    } else if (opts.practiceOnly) {
      await typeAgent(t.mentor.practiceDone, runId);
      satsHighlight = t.nagai.practiceNoSats;
    } else if (earned > 0) {
      await typeAgent(
        t.mentor.satsWon.replace("{n}", String(earned)),
        runId,
      );
      satsHighlight = t.nagai.hitSats.replace("{sats}", String(earned));
      if (typeof opts.satsBalance === "number") {
        satsLine = t.nagai.accountBalance.replace(
          "{sats}",
          String(opts.satsBalance),
        );
      }
    } else {
      await typeAgent(t.nagai.zeroSatsClosed, runId);
      satsHighlight = t.nagai.zeroSatsTest;
    }

    if (!alive(runId)) return;

    setComposer({
      type: "end",
      showContinue: false,
      topics: [],
      satsLine,
      satsHighlight,
      dashboardOnly: true,
    });
    setBusy(false);
    setMode("chat");
  }

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

      let satsBalance = typeof json.satsBalance === "number" ? json.satsBalance : undefined;
      try {
        const balRes = await fetch("/api/rewards/balance");
        if (balRes.ok) {
          const bal = await balRes.json();
          if (typeof bal.satsBalance === "number") satsBalance = bal.satsBalance;
        }
      } catch {
        /* ignore */
      }
      onBalanceChanged?.();

      const earnedThisRound =
        "skipAll" in payload
          ? 0
          : typeof json.satsEarned === "number"
            ? json.satsEarned
            : sessionSats;

      await sleep(300);
      await showEndMenu(runId, {
        skipAll: "skipAll" in payload,
        satsCredited: json.satsCredited ?? 0,
        earnedThisRound,
        satsBalance,
        practiceOnly: !!json.practiceOnly || !!json.alreadyRewarded,
        alreadyDone: !!json.alreadyDone,
      });
    } catch (e: any) {
      if (!alive(runId)) return;
      setError(e.message ?? "erro ao salvar");
      setBusy(false);
    }
  }

  /** Teste de conhecimento = 1 pergunta. Encerra na hora e mostra saída ao dashboard. */
  async function endKnowledgeTest(
    nextResponses: ResponseSlot[],
    highlight: string,
  ) {
    const runId = runIdRef.current;
    setStep(0);
    stepRef.current = 0;
    setMode("chat");
    // Mostra o botão imediatamente sob o feedback amarelo — sem nova pergunta.
    setComposer({
      type: "end",
      showContinue: false,
      topics: [],
      satsLine: null,
      satsHighlight: highlight,
      dashboardOnly: true,
    });
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/missions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, responses: nextResponses.slice(0, 1) }),
      });
      const json = await res.json();
      if (!alive(runId)) return;
      if (!res.ok) throw new Error(json.error);

      let satsBalance = typeof json.satsBalance === "number" ? json.satsBalance : undefined;
      try {
        const balRes = await fetch("/api/rewards/balance");
        if (balRes.ok) {
          const bal = await balRes.json();
          if (typeof bal.satsBalance === "number") satsBalance = bal.satsBalance;
        }
      } catch {
        /* ignore */
      }
      onBalanceChanged?.();

      const earned =
        typeof json.satsEarned === "number"
          ? json.satsEarned
          : typeof json.satsCredited === "number"
            ? json.satsCredited
            : sessionSats;

      let finalHighlight = highlight;
      if (json.practiceOnly || json.alreadyRewarded) {
        finalHighlight = t.nagai.practiceNoSats;
      } else if (earned > 0) {
        finalHighlight = t.nagai.hitSats.replace("{sats}", String(earned));
      } else if (nextResponses[0]?.skipped) {
        finalHighlight = t.nagai.zeroSatsTest;
      }

      if (!alive(runId)) return;
      setComposer({
        type: "end",
        showContinue: false,
        topics: [],
        satsLine:
          typeof satsBalance === "number"
            ? t.nagai.accountBalance.replace("{sats}", String(satsBalance))
            : null,
        satsHighlight: finalHighlight,
        dashboardOnly: true,
      });
    } catch (e: any) {
      if (!alive(runId)) return;
      setError(e.message ?? "erro ao salvar");
    } finally {
      if (alive(runId)) setBusy(false);
    }
  }

  async function answerMission(optionIndex: number) {
    const runId = runIdRef.current;
    const lesson = lessonsRef.current[0];
    if (!lesson || busy || composer.type !== "mission") return;
    setBusy(true);
    setComposer({ type: "hidden" });
    setError(null);
    pushUser(lesson.options[optionIndex]);

    try {
      const res = await fetch("/api/missions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          lessonIndex: 0,
          answer: optionIndex,
          locale,
          idioma: locale,
        }),
      });
      const check = await res.json();
      if (!alive(runId)) return;
      if (!res.ok) throw new Error(check.error);

      const nextResponses: ResponseSlot[] = [{ answer: optionIndex, skipped: false }];
      setResponses(nextResponses);
      responsesRef.current = nextResponses;

      const feedbackText = check.feedback || (check.correct ? "✓" : "…");
      const sats =
        typeof check.sats === "number"
          ? check.sats
          : check.correct
            ? SATS_CORRECT
            : SATS_TRIED;
      const satsNote = check.correct
        ? t.nagai.hitSats.replace("{sats}", String(SATS_CORRECT))
        : t.nagai.trySats.replace("{sats}", String(SATS_TRIED));
      const highlight = rewardEligible ? satsNote : t.nagai.practiceNoSats;

      if (rewardEligible) {
        setSessionSats(sats);
      }

      try {
        const balRes = await fetch("/api/rewards/balance");
        if (balRes.ok) {
          const bal = await balRes.json();
          if (typeof bal.satsBalance === "number") setAccountBalance(bal.satsBalance);
        }
      } catch {
        /* ignore */
      }
      onBalanceChanged?.();

      await sleep(180);
      await typeAgent(feedbackText, runId, {
        satsNote: highlight,
        sats: rewardEligible ? sats : 0,
      });
      if (!alive(runId)) return;
      // Fim imediato: sem segunda pergunta.
      await endKnowledgeTest(nextResponses, highlight);
    } catch (e: any) {
      if (!alive(runId)) return;
      setError(e.message ?? "erro ao responder");
      setComposer({ type: "mission", options: lesson.options });
      setBusy(false);
    }
  }

  async function skipQuestion() {
    const runId = runIdRef.current;
    if (busy || composer.type !== "mission" || !lessonsRef.current[0]) return;
    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser(t.nagai.skipThisQuestion);
    const nextResponses: ResponseSlot[] = [{ answer: null, skipped: true }];
    setResponses(nextResponses);
    responsesRef.current = nextResponses;
    setSessionSats(0);
    const highlight = t.nagai.zeroSatsTest;
    await sleep(140);
    await typeAgent(t.nagai.zeroSatsQuestion, runId, {
      satsNote: highlight,
      sats: 0,
    });
    if (!alive(runId)) return;
    await endKnowledgeTest(nextResponses, highlight);
  }

  async function skipAll() {
    const runId = runIdRef.current;
    if (busy) return;
    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser(t.nagai.skipTest);
    await typeAgent(t.nagai.skipAllAgent, runId);
    if (!alive(runId)) return;
    await finish({ skipAll: true });
  }

  async function startOptionalTopic(topic: OptionalTopic) {
    const runId = runIdRef.current;
    if (busy) return;
    const localized = localizeTopic(topic, locale as Locale);
    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser(localized.label);
    for (const msg of localized.teach) {
      if (!alive(runId)) return;
      await sleep(220);
      await typeAgent(msg, runId);
    }
    if (!alive(runId)) return;
    await sleep(260);
    await typeAgent(localized.question ?? "", runId);
    if (!alive(runId)) return;
    setComposer({
      type: "topic-q",
      topicId: localized.id,
      options: localized.options ?? [],
    });
    setBusy(false);
  }

  async function answerTopic(optionIndex: number) {
    const runId = runIdRef.current;
    if (composer.type !== "topic-q" || busy) return;
    const raw = OPTIONAL_TOPICS.find((t) => t.id === composer.topicId);
    if (!raw) return;
    const topic = localizeTopic(raw, locale as Locale);
    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser((topic.options ?? [])[optionIndex] ?? "");
    const ok = optionIndex === topic.correct;
    await sleep(180);
    await typeAgent(
      (ok ? topic.feedbackCorrect : topic.feedbackWrong) ?? "",
      runId,
    );
    if (!alive(runId)) return;
    const nextDone = [...doneTopicsRef.current, topic.id];
    setDoneTopics(nextDone);
    doneTopicsRef.current = nextDone;
    const left = remainingTopics(nextDone);
    await sleep(280);
    await typeAgent(
      left.length ? t.mentor.anotherTopicOrDash : t.mentor.extrasDone,
      runId,
    );
    if (!alive(runId)) return;
    setComposer({ type: "end", showContinue: false, topics: left, satsLine: null });
    setBusy(false);
  }

  async function skipTopicQuestion() {
    const runId = runIdRef.current;
    if (composer.type !== "topic-q" || busy) return;
    const raw = OPTIONAL_TOPICS.find((t) => t.id === composer.topicId);
    if (!raw) return;
    const topic = localizeTopic(raw, locale as Locale);
    setBusy(true);
    setComposer({ type: "hidden" });
    pushUser(t.nagai.skipThisQuestion);
    await typeAgent(t.mentor.topicSkipOk, runId);
    if (!alive(runId)) return;
    const nextDone = [...doneTopicsRef.current, topic.id];
    setDoneTopics(nextDone);
    doneTopicsRef.current = nextDone;
    const left = remainingTopics(nextDone);
    await sleep(200);
    await typeAgent(
      left.length ? t.mentor.anotherOptionalOrDash : t.mentor.rereadOrDash,
      runId,
    );
    if (!alive(runId)) return;
    setComposer({ type: "end", showContinue: false, topics: left, satsLine: null });
    setBusy(false);
  }

  const shellClass = embedded ? "sv-mentor sv-mentor--embedded" : "sv-mentor";

  function shellNav() {
    if (embedded && sheetHosted) return null;
    if (embedded) {
      return (
        <div className="sv-mentor-embed-bar">
          <span>{copy.title}</span>
          <button type="button" className="linkish" onClick={leave}>
            {t.a11y.closeDialog}
          </button>
        </div>
      );
    }
    return <SiteNav variant="mentor" onExitMentor={leave} />;
  }

  if (loading) {
    return (
      <div className={shellClass}>
        {shellNav()}
        <div className="sv-mentor-body">
          <p className="sv-mentor-status">{t.nagai.opening}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      {!embedded && <SkipToContent href="#conteudo" />}
      {shellNav()}
      {showGate && (
        <A11yDialog
          open={showGate}
          onClose={() => {
            setShowGate(false);
            setMode("chat");
          }}
          labelledBy="sv-mentor-gate-title"
          className="sv-mentor-gate sv-mentor-gate--modal"
          backdropClassName="sv-mentor-gate-backdrop"
        >
          <img
            src="/satvantage-mentor.png"
            alt=""
            className="sv-mentor-gate-face"
            width={88}
            height={88}
          />
          <h1 id="sv-mentor-gate-title">{copy.title}</h1>
          <p>
            {t.nagai.quizGateBodyBefore}{" "}
            <strong>{t.nagai.quizGateBodyStrong}</strong>
            {t.nagai.quizGateBodyAfter}
          </p>
          <div className="sv-mentor-gate-actions">
            <button
              type="button"
              className="sv-chat-cta"
              onClick={() => {
                setShowGate(false);
                void startTheoreticalQuiz({ practiceConfirmed: true });
              }}
            >
              {t.nagai.quizGateRetry}
            </button>
            <button
              type="button"
              className="sv-chat-cta sv-chat-cta--ghost"
              onClick={() => {
                setShowGate(false);
                setMode("chat");
              }}
            >
              {t.nagai.quizGateBackChat}
            </button>
            <button
              type="button"
              className="sv-chat-cta sv-chat-cta--ghost"
              onClick={onGoDashboard}
            >
              {t.nagai.dashboard}
            </button>
          </div>
        </A11yDialog>
      )}

      <div
        className={`sv-mentor-body${mode === "pratico" ? " sv-mentor-body--sim" : ""}`}
        id={embedded ? undefined : "conteudo"}
        tabIndex={embedded ? undefined : -1}
      >
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
              <h1>{mode === "pratico" ? t.nagai.simTitle : copy.title}</h1>
            </div>
            <div className="sv-mentor-toolbar">
              {mode === "pratico" ? (
                <button type="button" className="sv-toolbar-btn" onClick={exitPracticalSim}>
                  {t.nagai.backToChat}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="sv-toolbar-btn sv-toolbar-btn--ghost"
                    disabled={busy || mode === "quiz"}
                    onClick={startNewConversation}
                  >
                    {t.nagai.historyNew}
                  </button>
                  <button
                    type="button"
                    className="sv-toolbar-btn sv-toolbar-btn--ghost"
                    disabled={busy || mode === "quiz"}
                    onClick={() => setHistoryOpen(true)}
                  >
                    {t.nagai.historyOpen}
                  </button>
                  <button
                    type="button"
                    className="sv-toolbar-btn"
                    disabled={busy}
                    onClick={() => {
                      setShowKnowledgePicker(true);
                      setComposer({ type: "hidden" });
                    }}
                  >
                    {t.nagai.knowledgeTest}
                  </button>
                </>
              )}
              <button
                type="button"
                className="sv-toolbar-btn sv-toolbar-btn--ghost"
                onClick={onGoDashboard}
              >
                {t.nagai.dashboard}
              </button>
            </div>
            {mode === "quiz" && !rewardEligible && (
              <p className="sv-mentor-practice-tag">{t.nagai.practiceMode}</p>
            )}
            {mode === "quiz" && (sessionSats > 0 || accountBalance !== null) && (
              <p className="sv-mentor-sats-bar">
                {sessionSats > 0
                  ? t.nagai.thisTest.replace("{sats}", String(sessionSats))
                  : null}
                {sessionSats > 0 && accountBalance !== null ? " · " : null}
                {accountBalance !== null
                  ? t.nagai.accountBalance.replace("{sats}", String(accountBalance))
                  : null}
              </p>
            )}
            {mode === "pratico" && (
              <p className="sv-mentor-practice-tag">{t.nagai.simTag}</p>
            )}
          </header>
        )}

        {embedded && (
          <div className="sv-mentor-toolbar sv-mentor-toolbar--embed">
            {mode === "pratico" ? (
              <button type="button" className="sv-toolbar-btn" onClick={exitPracticalSim}>
                {t.nagai.backToChat}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="sv-toolbar-btn sv-toolbar-btn--ghost"
                  disabled={busy || mode === "quiz"}
                  onClick={startNewConversation}
                >
                  {t.nagai.historyNew}
                </button>
                <button
                  type="button"
                  className="sv-toolbar-btn sv-toolbar-btn--ghost"
                  disabled={busy || mode === "quiz"}
                  onClick={() => setHistoryOpen(true)}
                >
                  {t.nagai.historyOpen}
                </button>
                <button
                  type="button"
                  className="sv-toolbar-btn"
                  disabled={busy}
                  onClick={() => setShowKnowledgePicker(true)}
                >
                  {t.nagai.knowledgeTest}
                </button>
              </>
            )}
            <button
              type="button"
              className="sv-toolbar-btn sv-toolbar-btn--ghost"
              onClick={onGoDashboard}
            >
              {t.nagai.dashboard}
            </button>
          </div>
        )}

        <NagaiHistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          activeId={conversationId}
          onSelect={loadHistoryConversation}
        />

        {error && <p className="sv-mentor-status">{error}</p>}

        {mode === "pratico" ? (
          <TradeSimulator onExit={exitPracticalSim} />
        ) : (
        <div className="sv-chat-panel">
          <div
            className="sv-chat-scroll"
            ref={scrollRef}
            onScroll={onChatScroll}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="NagAI"
          >
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
                      <SpeakButton
                        text={[line.text, line.satsNote].filter(Boolean).join(" ")}
                        disabled={typing && i === lines.length - 1}
                      />
                    </div>
                    <span className="sv-bubble-text">
                      {line.text}
                      {typing && i === lines.length - 1 ? (
                        <span className="sv-caret" aria-hidden>
                          |
                        </span>
                      ) : null}
                    </span>
                    {line.satsNote ? (
                      <span
                        className={`sv-bubble-sats${
                          (line.sats ?? 0) >= SATS_CORRECT ? " sv-bubble-sats--ok" : " sv-bubble-sats--try"
                        }`}
                      >
                        {line.satsNote}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div key={i} className="sv-bubble sv-bubble--user">
                  <div className="sv-bubble-head">
                    <SpeakButton text={line.text} />
                  </div>
                  <span className="sv-bubble-text">{line.text}</span>
                </div>
              ),
            )}
            <div ref={chatBottomRef} />
          </div>

          <div className="sv-chat-footer">
            {showKnowledgePicker && (
              <div
                ref={knowledgeTrapRef}
                className="sv-knowledge-card"
                role="dialog"
                aria-modal="true"
                aria-label={t.nagai.pickTestTitle}
                tabIndex={-1}
              >
                <p className="sv-knowledge-card-title">{t.nagai.pickTestTitle}</p>
                <p className="sv-knowledge-card-desc">{t.nagai.pickTestDesc}</p>
                <div className="sv-path-cards">
                  <button
                    type="button"
                    className="sv-path-card"
                    disabled={busy}
                    onClick={() => void startTheoreticalQuiz()}
                  >
                    <span className="sv-path-card-title">{t.nagai.theoretical}</span>
                    <span className="sv-path-card-desc">{t.nagai.theoreticalDesc}</span>
                  </button>
                  <button
                    type="button"
                    className="sv-path-card"
                    disabled={busy}
                    onClick={() => startPracticalSim()}
                  >
                    <span className="sv-path-card-title">{t.nagai.practical}</span>
                    <span className="sv-path-card-desc">{t.nagai.practicalDesc}</span>
                  </button>
                </div>
                <button
                  type="button"
                  className="sv-chat-cta sv-chat-cta--ghost"
                  onClick={() => setShowKnowledgePicker(false)}
                >
                  {t.nagai.cancel}
                </button>
              </div>
            )}

            {composer.type === "mission" && (
              <div
                className="sv-chat-actions"
                data-listening={quizSpeech.listening ? "true" : "false"}
              >
                <div className="sv-chat-options">
                  {composer.options.map((opt, oi) => (
                    <div key={oi} className="sv-chat-option-row">
                      <button
                        type="button"
                        className="sv-chat-option"
                        disabled={busy}
                        onClick={() => void answerMission(oi)}
                      >
                        {opt}
                      </button>
                      <SpeakButton text={opt} disabled={busy} />
                    </div>
                  ))}
                </div>

                <div className="sv-quiz-voice">
                  <button
                    type="button"
                    className={`sv-chat-mic${quizSpeech.listening ? " sv-chat-mic--on" : ""}`}
                    data-state={quizSpeech.status}
                    aria-label={
                      quizSpeech.listening ? t.a11y.micStop : t.a11y.micStart
                    }
                    aria-pressed={quizSpeech.listening}
                    disabled={busy}
                    onClick={() => quizSpeech.toggle()}
                    title={
                      quizSpeech.listening ? t.a11y.micStop : t.a11y.micStart
                    }
                  >
                    <span className="sv-chat-mic-rings" aria-hidden>
                      <span className="sv-chat-mic-ring sv-chat-mic-ring--1" />
                      <span className="sv-chat-mic-ring sv-chat-mic-ring--2" />
                      <span className="sv-chat-mic-ring sv-chat-mic-ring--3" />
                    </span>
                    <span className="sv-chat-mic-core" aria-hidden>
                      <span className="sv-chat-mic-waves">
                        <span />
                        <span />
                        <span />
                        <span />
                      </span>
                      <svg
                        className="sv-chat-mic-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7 11a5 5 0 0 0 10 0M12 16v4M9 20h6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                  <p className="sv-quiz-voice-hint">
                    {quizSpeech.listening
                      ? t.nagai.voiceListening
                      : t.nagai.voiceHint}
                  </p>
                </div>
                {quizSpeech.status !== "idle" &&
                quizSpeech.status !== "listening" &&
                quizSpeech.statusMessage ? (
                  <p className="sv-mic-status sv-mic-status--err" role="status">
                    {quizSpeech.statusMessage}
                  </p>
                ) : null}
                {voiceDraft.trim() ? (
                  <p className="sv-quiz-voice-transcript" aria-live="polite">
                    “{voiceDraft.trim()}”
                  </p>
                ) : null}

                <div className="sv-chat-row">
                  <button
                    type="button"
                    className="sv-chat-cta sv-chat-cta--ghost"
                    disabled={busy}
                    onClick={() => void skipQuestion()}
                  >
                    {t.nagai.skipQuestion}
                  </button>
                  <button
                    type="button"
                    className="sv-chat-cta sv-chat-cta--ghost"
                    disabled={busy}
                    onClick={() => void skipAll()}
                  >
                    {t.nagai.skipTest}
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
                <button
                  type="button"
                  className="sv-chat-cta sv-chat-cta--ghost"
                  disabled={busy}
                  onClick={() => void skipTopicQuestion()}
                >
                  {t.nagai.skipQuestion}
                </button>
              </div>
            )}

            {composer.type === "end" && (
              <div className="sv-chat-actions">
                {composer.satsHighlight ? (
                  <div className="sv-quiz-sats-banner" role="status">
                    {composer.satsHighlight}
                  </div>
                ) : null}
                {composer.satsLine && <p className="sv-mentor-status">{composer.satsLine}</p>}
                <button
                  type="button"
                  className="sv-chat-cta sv-chat-cta--dash"
                  onClick={() => {
                    setComposer({ type: "hidden" });
                    setMode("chat");
                    setLessons([]);
                    lessonsRef.current = [];
                    setResponses([]);
                    responsesRef.current = [];
                    setStep(0);
                    stepRef.current = 0;
                    setSessionSats(0);
                    onGoDashboard();
                  }}
                >
                  {t.nagai.backToDashboard}
                </button>
              </div>
            )}

            {!showKnowledgePicker && composer.type === "hidden" && (
              <ChatComposer
                draft={draft}
                setDraft={setDraft}
                disabled={busy || mode === "quiz"}
                placeholder={t.nagai.askPlaceholder}
                onSubmit={() => void sendFreeChat()}
                sendLabel="icon"
              />
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
