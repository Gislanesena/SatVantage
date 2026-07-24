"use client";
import { useEffect, useState } from "react";
import Landing from "@/components/Landing";
import LoginNostr, { loginWithExtension, type AuthMode } from "@/components/LoginNostr";
import MentorChat, { type MentorIntent } from "@/components/MentorChat";
import Dashboard from "@/components/Dashboard";
import { MISSION_1_SLUG, MISSION_2_SLUG } from "@/lib/missions";
import { useInactivityLogout } from "@/lib/useInactivityLogout";
import { useI18n } from "@/lib/i18n";

type View = "landing" | "auth" | "mentor1" | "mentor2" | "dashboard";

const VIEW_KEY = "sv_active_view";

function persistView(v: View) {
  try {
    if (v === "mentor1" || v === "mentor2" || v === "dashboard") {
      sessionStorage.setItem(VIEW_KEY, v);
    } else {
      sessionStorage.removeItem(VIEW_KEY);
    }
  } catch {
    /* ignore */
  }
}

function readPersistedView(): View | null {
  try {
    const v = sessionStorage.getItem(VIEW_KEY);
    if (v === "mentor1" || v === "mentor2" || v === "dashboard") return v;
  } catch {
    /* ignore */
  }
  return null;
}

function clearPersistedView() {
  try {
    sessionStorage.removeItem(VIEW_KEY);
  } catch {
    /* ignore */
  }
}

function m1StillOpen(status: string | undefined) {
  return !status || status === "disponivel" || status === "em_andamento";
}

function m2StillOpen(status: string | undefined) {
  return status === "disponivel" || status === "em_andamento";
}

function m1Finished(status: string | undefined) {
  return status === "concluida" || status === "pulada";
}

/** Decide mentor1 / mentor2 / dashboard para iniciante. */
async function resolveInicianteView(opts: {
  /** true no F5: respeita se a pessoa saiu pro dash nesta aba */
  preferPersisted: boolean;
}): Promise<View> {
  try {
    const res = await fetch("/api/missions/overview");
    const data = await res.json().catch(() => ({}));
    const s1 = data?.mentoria1?.status as string | undefined;
    const s2 = data?.mentoria2?.status as string | undefined;

    const persisted = opts.preferPersisted ? readPersistedView() : null;

    // Nesta aba a pessoa saiu da mentoria (sem concluir) → fica no dash até o próximo login
    if (persisted === "dashboard") return "dashboard";

    if (persisted === "mentor2" && m1Finished(s1) && m2StillOpen(s2)) {
      return "mentor2";
    }
    if (persisted === "mentor1" && m1StillOpen(s1)) {
      return "mentor1";
    }

    // Login novo / sem persistência: mentoria 1 em tela cheia enquanto não concluiu/pulou
    if (m1StillOpen(s1)) return "mentor1";
    return "dashboard";
  } catch {
    return "dashboard";
  }
}

async function logoutRequest() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* melhor esforço — o cookie tem validade de 12h de qualquer forma */
  }
}

export default function Home() {
  const { t } = useI18n();
  const [view, setViewState] = useState<View>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("create");
  const [user, setUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [extBusy, setExtBusy] = useState(false);
  const [extError, setExtError] = useState<string | null>(null);
  const [mentorIntent, setMentorIntent] = useState<MentorIntent>("chat");
  const [mentorPracticeConfirmed, setMentorPracticeConfirmed] = useState(false);

  function setView(next: View) {
    setViewState(next);
    persistView(next);
  }

  // Restaura a sessão existente (cookie httpOnly de 12h) ao carregar/dar F5
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json().catch(() => ({ user: null }));
        if (!cancelled && data.user) {
          setUser(data.user);
          if (data.user.knowledgeLevel !== "iniciante") {
            setView("dashboard");
          } else {
            const next = await resolveInicianteView({ preferPersisted: true });
            if (!cancelled) setView(next);
          }
        }
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function openAuth(mode: AuthMode) {
    setExtError(null);
    setAuthMode(mode);
    setView("auth");
  }

  function afterLogin(u: any) {
    setUser(u);
    // Extensão / não-iniciante → dash.
    // Iniciante: mentoria 1 em tela cheia enquanto não concluiu/pulou.
    if (u?.knowledgeLevel !== "iniciante") {
      setView("dashboard");
      return;
    }
    void (async () => {
      // Novo login: não herda "saí pro dash" de sessão anterior desta aba
      clearPersistedView();
      const next = await resolveInicianteView({ preferPersisted: false });
      setView(next);
    })();
  }

  function exitToHome() {
    setUser(null);
    clearPersistedView();
    setViewState("landing");
    void logoutRequest();
  }

  function goToDashboard() {
    setMentorIntent("chat");
    setMentorPracticeConfirmed(false);
    setView("dashboard");
    // A mentoria deixa a janela rolada para baixo — ao abrir o dash, começa no saldo.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }

  function openMentorFull(
    step: "m1" | "m2",
    intent: MentorIntent = "chat",
    opts?: { practiceConfirmed?: boolean },
  ) {
    setMentorIntent(intent);
    setMentorPracticeConfirmed(!!opts?.practiceConfirmed);
    setView(step === "m2" ? "mentor2" : "mentor1");
  }

  const loggedIn = view === "mentor1" || view === "mentor2" || view === "dashboard";
  const { warning: inactivityWarning } = useInactivityLogout(loggedIn, exitToHome);

  async function handleExtension() {
    setExtError(null);
    setExtBusy(true);
    try {
      const { user: u } = await loginWithExtension();
      afterLogin(u);
    } catch (e: any) {
      setExtError(e.message ?? "Falha no login com extensão");
    } finally {
      setExtBusy(false);
    }
  }

  if (checkingSession) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "var(--ink-muted)",
        }}
      >
        {t.a11y.loading}
      </main>
    );
  }

  return (
    <>
      {inactivityWarning && (
        <div className="sv-inactivity-banner" role="alert">
          {t.auth.inactivityWarning}
        </div>
      )}

      {view === "landing" && (
        <Landing
          onCreateAccount={() => openAuth("create")}
          onExistingLogin={() => openAuth("login")}
          onExtension={handleExtension}
          extensionBusy={extBusy}
          error={extError}
        />
      )}

      {view === "auth" && (
        <main>
          <LoginNostr
            initialMode={authMode}
            onLogin={afterLogin}
            onBack={() => {
              setExtError(null);
              setView("landing");
            }}
          />
        </main>
      )}

      {view === "mentor1" && user && (
        <MentorChat
          key={`m1-${mentorIntent}-${mentorPracticeConfirmed ? "p" : "r"}`}
          slug={MISSION_1_SLUG}
          initialIntent={mentorIntent}
          startAsPractice={mentorPracticeConfirmed}
          onExitToHome={exitToHome}
          onContinueMentor={() => {
            setMentorIntent("chat");
            setMentorPracticeConfirmed(false);
            setView("mentor2");
          }}
          onGoDashboard={goToDashboard}
        />
      )}

      {view === "mentor2" && user && (
        <MentorChat
          key={`m2-${mentorIntent}-${mentorPracticeConfirmed ? "p" : "r"}`}
          slug={MISSION_2_SLUG}
          initialIntent={mentorIntent}
          startAsPractice={mentorPracticeConfirmed}
          onExitToHome={exitToHome}
          onGoDashboard={goToDashboard}
        />
      )}

      {view === "dashboard" && user && (
        <Dashboard
          user={user}
          onExitToHome={exitToHome}
          onOpenMentorFull={openMentorFull}
        />
      )}
    </>
  );
}
