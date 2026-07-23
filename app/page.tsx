"use client";
import { useEffect, useState } from "react";
import Landing from "@/components/Landing";
import LoginNostr, { loginWithExtension, type AuthMode } from "@/components/LoginNostr";
import MentorChat, { type MentorIntent } from "@/components/MentorChat";
import Dashboard from "@/components/Dashboard";
import { MISSION_1_SLUG, MISSION_2_SLUG } from "@/lib/missions";
import { useInactivityLogout } from "@/lib/useInactivityLogout";

type View = "landing" | "auth" | "mentor1" | "mentor2" | "dashboard";

async function logoutRequest() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* melhor esforço — o cookie tem validade de 12h de qualquer forma */
  }
}

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("create");
  const [user, setUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [extBusy, setExtBusy] = useState(false);
  const [extError, setExtError] = useState<string | null>(null);
  const [mentorIntent, setMentorIntent] = useState<MentorIntent>("chat");
  const [mentorPracticeConfirmed, setMentorPracticeConfirmed] = useState(false);

  // Restaura a sessão existente (cookie httpOnly de 12h) ao carregar/dar F5 —
  // sem isso, todo refresh derrubava a pessoa de volta pra landing.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json().catch(() => ({ user: null }));
        if (!cancelled && data.user) {
          setUser(data.user);
          setView("dashboard");
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
    // Iniciante: só abre mentoria em tela cheia na 1ª vez.
    // Se já pulou ou concluiu, vai ao dashboard (refazer fica no chat do canto).
    if (u?.knowledgeLevel !== "iniciante") {
      setView("dashboard");
      return;
    }
    void (async () => {
      try {
        const res = await fetch("/api/missions/overview");
        const data = await res.json().catch(() => ({}));
        const status = data?.mentoria1?.status as string | undefined;
        if (!status || status === "disponivel") {
          setView("mentor1");
        } else {
          setView("dashboard");
        }
      } catch {
        setView("dashboard");
      }
    })();
  }

  function exitToHome() {
    setUser(null);
    setView("landing");
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
        Carregando…
      </main>
    );
  }

  return (
    <>
      {inactivityWarning && (
        <div className="sv-inactivity-banner" role="alert">
          Por inatividade, você vai ser desconectado em instantes — toque na tela para
          continuar conectado.
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
