"use client";
import { useEffect, useState } from "react";
import Landing from "@/components/Landing";
import LoginNostr, { loginWithExtension, type AuthMode } from "@/components/LoginNostr";
import MentorChat from "@/components/MentorChat";
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
    // Iniciante → mentoria 1 (depois 2). Extensão → dash.
    if (u?.knowledgeLevel === "iniciante") setView("mentor1");
    else setView("dashboard");
  }

  function exitToHome() {
    setUser(null);
    setView("landing");
    void logoutRequest();
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
          slug={MISSION_1_SLUG}
          onExitToHome={exitToHome}
          onContinueMentor={() => setView("mentor2")}
          onGoDashboard={() => setView("dashboard")}
        />
      )}

      {view === "mentor2" && user && (
        <MentorChat
          slug={MISSION_2_SLUG}
          onExitToHome={exitToHome}
          onGoDashboard={() => setView("dashboard")}
        />
      )}

      {view === "dashboard" && user && (
        <Dashboard user={user} onExitToHome={exitToHome} />
      )}
    </>
  );
}
