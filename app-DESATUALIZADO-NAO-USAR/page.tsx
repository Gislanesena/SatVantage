"use client";
import { useState } from "react";
import Landing from "@/components/Landing";
import LoginNostr, { loginWithExtension, type AuthMode } from "@/components/LoginNostr";
import MentorChat from "@/components/MentorChat";
import Dashboard from "@/components/Dashboard";
import { MISSION_1_SLUG, MISSION_2_SLUG } from "@/lib/missions";

type View = "landing" | "auth" | "mentor1" | "mentor2" | "dashboard";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("create");
  const [user, setUser] = useState<any>(null);
  const [extBusy, setExtBusy] = useState(false);
  const [extError, setExtError] = useState<string | null>(null);

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
  }

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

  if (view === "landing") {
    return (
      <Landing
        onCreateAccount={() => openAuth("create")}
        onExistingLogin={() => openAuth("login")}
        onExtension={handleExtension}
        extensionBusy={extBusy}
        error={extError}
      />
    );
  }

  if (view === "auth") {
    return (
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
    );
  }

  if (view === "mentor1" && user) {
    return (
      <MentorChat
        slug={MISSION_1_SLUG}
        onExitToHome={exitToHome}
        onContinueMentor={() => setView("mentor2")}
        onGoDashboard={() => setView("dashboard")}
      />
    );
  }

  if (view === "mentor2" && user) {
    return (
      <MentorChat
        slug={MISSION_2_SLUG}
        onExitToHome={exitToHome}
        onGoDashboard={() => setView("dashboard")}
      />
    );
  }

  if (view === "dashboard" && user) {
    return <Dashboard user={user} onExitToHome={exitToHome} />;
  }

  return null;
}
