"use client";
// components/LoginNostr.tsx — formulários de acesso (criar / entrar / recuperar).
// A landing com os dois caminhos vive em Landing.tsx.
//
// Caminho senha: identidade Nostr real, chave cifrada no navegador
//   ("guardamos o cofre, nunca a chave").
// Caminho extensão: ver loginWithExtension — a chave nunca sai da extensão.
//
// Recuperação: chave de recuperação (prova por assinatura) + pergunta de
// segurança. As duas juntas. Zero e-mail.
import { useEffect, useState } from "react";
import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip19,
  type EventTemplate,
} from "nostr-tools";
import { sealVault, openVault, hashAnswer, newSalt } from "@/lib/vault";

const LOGIN_EVENT_KIND = 22242;

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: EventTemplate): Promise<any>;
    };
  }
}

async function fetchChallenge(): Promise<string> {
  const res = await fetch("/api/auth/challenge", { method: "POST" });
  if (!res.ok) throw new Error("Falha ao obter desafio");
  return (await res.json()).challenge;
}

function buildLoginEvent(challenge: string): EventTemplate {
  return {
    kind: LOGIN_EVENT_KIND,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["challenge", challenge],
      ["client", "satvantage"],
    ],
    content: "Login no SatVantage",
  };
}

async function submitLogin(
  signedEvent: unknown,
  via: "extension" | "vault" = "vault"
) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: signedEvent, via }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "erro desconhecido" }));
    throw new Error(error);
  }
  return res.json();
}

async function signAndLogin(sk: Uint8Array) {
  const challenge = await fetchChallenge();
  const signed = finalizeEvent(buildLoginEvent(challenge), sk);
  return submitLogin(signed);
}

async function postJson(url: string, payload: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "erro desconhecido");
  return data;
}

/** Login via NIP-07 (Alby / nos2x). Usado pela landing. */
export async function loginWithExtension() {
  if (!window.nostr) {
    throw new Error(
      "Nenhuma extensão Nostr encontrada. Instale a Alby ou nos2x — ou crie uma conta com usuário e senha."
    );
  }
  const challenge = await fetchChallenge();
  const signed = await window.nostr.signEvent(buildLoginEvent(challenge));
  return submitLogin(signed, "extension");
}

const inputStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid var(--line)",
  background: "var(--bg)",
  color: "var(--ink)",
  caretColor: "var(--ink)",
};

export type AuthMode = "login" | "create" | "recover";

export default function LoginNostr({
  onLogin,
  initialMode = "login",
  onBack,
}: {
  onLogin?: (user: any) => void;
  initialMode?: AuthMode;
  onBack?: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  // Em "criar conta" começa vazio — não reaproveita o último usuário do login
  const [username, setUsername] = useState(() =>
    initialMode === "login" && typeof window !== "undefined"
      ? localStorage.getItem("sv_username") ?? ""
      : ""
  );
  const [password, setPassword] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [nsecInput, setNsecInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [recoverStep, setRecoverStep] = useState<1 | 2>(1);
  const [recoverInfo, setRecoverInfo] = useState<{ question: string; qaSalt: string } | null>(
    null
  );

  const [pendingKey, setPendingKey] = useState<{ nsec: string; user: any } | null>(null);
  const [keySaved, setKeySaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Proteção contra criar conta nova por engano já estando logado:
  // se existir sessão válida, avisa antes de gerar chaves novas.
  const [existingSession, setExistingSession] = useState<any>(null);
  const [forceCreate, setForceCreate] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setRecoverStep(1);
    setRecoverInfo(null);
    setPassword("");
    setQuestion("");
    setAnswer("");
    setNsecInput("");
    setForceCreate(false);
    if (initialMode === "create") {
      setUsername("");
    } else if (initialMode === "login") {
      try {
        setUsername(localStorage.getItem("sv_username") ?? "");
      } catch {
        setUsername("");
      }
    }
  }, [initialMode]);

  useEffect(() => {
    if (mode !== "create") {
      setExistingSession(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json().catch(() => ({ user: null }));
        if (!cancelled) setExistingSession(data.user ?? null);
      } catch {
        if (!cancelled) setExistingSession(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  function npubShort(npub: string) {
    return npub.length > 16 ? `${npub.slice(0, 10)}…${npub.slice(-6)}` : npub;
  }

  function remember(u: string) {
    try {
      localStorage.setItem("sv_username", u);
    } catch {}
  }

  function go(m: AuthMode, opts?: { keepUsername?: boolean }) {
    const keepUser = opts?.keepUsername ? username : undefined;
    setMode(m);
    setError(null);
    setRecoverStep(1);
    setRecoverInfo(null);
    setPassword("");
    setQuestion("");
    setAnswer("");
    setNsecInput("");
    if (m === "create") {
      setUsername(keepUser ?? "");
    } else if (m === "login") {
      if (keepUser) {
        setUsername(keepUser);
      } else {
        try {
          setUsername(localStorage.getItem("sv_username") ?? "");
        } catch {
          setUsername("");
        }
      }
    }
  }

  async function criarConta() {
    setError(null);
    if (password.length < 8) return setError("A senha precisa de pelo menos 8 caracteres.");
    if (question.trim().length < 8)
      return setError("Escreva uma pergunta de segurança (mínimo 8 caracteres).");
    if (answer.trim().length < 2) return setError("Escreva a resposta da sua pergunta.");
    setBusy("create");
    try {
      const sk = generateSecretKey();
      const { blob, salt } = await sealVault(sk, password);
      const qaSalt = newSalt();
      await postJson("/api/auth/register", {
        username,
        pubkey: getPublicKey(sk),
        vaultBlob: blob,
        vaultSalt: salt,
        securityQuestion: question.trim(),
        answerHash: await hashAnswer(answer, qaSalt),
        qaSalt,
      });
      const { user } = await signAndLogin(sk);
      remember(username);
      setPendingKey({ nsec: nip19.nsecEncode(sk), user });
    } catch (e: any) {
      setError(e.message ?? "Falha ao criar conta");
    } finally {
      setBusy(null);
    }
  }

  async function entrar() {
    setError(null);
    setBusy("login");
    try {
      const { vaultBlob, vaultSalt } = await postJson("/api/auth/vault", { username });
      const sk = await openVault(vaultBlob, vaultSalt, password);
      const { user } = await signAndLogin(sk);
      remember(username);
      onLogin?.(user);
    } catch (e: any) {
      setError(e.message ?? "Falha no login");
    } finally {
      setBusy(null);
    }
  }

  async function iniciarRecuperacao() {
    setError(null);
    setBusy("rinfo");
    try {
      const info = await postJson("/api/auth/recovery-info", { username });
      setRecoverInfo(info);
      setRecoverStep(2);
    } catch (e: any) {
      setError(e.message ?? "Não foi possível iniciar a recuperação");
    } finally {
      setBusy(null);
    }
  }

  async function concluirRecuperacao() {
    setError(null);
    if (password.length < 8) return setError("A senha nova precisa de pelo menos 8 caracteres.");
    setBusy("recover");
    try {
      let sk: Uint8Array;
      try {
        const decoded = nip19.decode(nsecInput.trim());
        if (decoded.type !== "nsec") throw new Error();
        sk = decoded.data as Uint8Array;
      } catch {
        throw new Error("chave de recuperação inválida (deve começar com nsec1)");
      }

      const challenge = await fetchChallenge();
      const signed = finalizeEvent(buildLoginEvent(challenge), sk);
      const { blob, salt } = await sealVault(sk, password);

      await postJson("/api/auth/recover", {
        username,
        event: signed,
        answerHash: await hashAnswer(answer, recoverInfo!.qaSalt),
        vaultBlob: blob,
        vaultSalt: salt,
      });

      const { user } = await signAndLogin(sk);
      remember(username);
      setNsecInput("");
      setAnswer("");
      onLogin?.(user);
    } catch (e: any) {
      setError(e.message ?? "Falha na recuperação");
    } finally {
      setBusy(null);
    }
  }

  if (pendingKey) {
    return (
      <div className="sv-auth">
        <h2>Guarde sua chave de recuperação</h2>
        <p>
          Esta chave é o documento de posse da sua conta. Você não vai usá-la no
          dia a dia — só se esquecer a senha (junto com a pergunta de segurança).
          Anote fora do computador. Ela não será mostrada de novo.
        </p>
        <code className="sv-nsec">{pendingKey.nsec}</code>
        <button
          type="button"
          className="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(pendingKey.nsec);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {}
          }}
        >
          {copied ? "Copiada" : "Copiar chave"}
        </button>
        <label className="sv-check">
          <input
            type="checkbox"
            checked={keySaved}
            onChange={(e) => setKeySaved(e.target.checked)}
          />
          Anotei minha chave em local seguro e entendo que, sem ela e sem minha
          senha, a conta não pode ser recuperada.
        </label>
        <button
          type="button"
          disabled={!keySaved}
          onClick={() => {
            const user = pendingKey.user;
            setPendingKey(null);
            onLogin?.(user);
          }}
        >
          Continuar para o SatVantage
        </button>
      </div>
    );
  }

  const titles: Record<AuthMode, string> = {
    create: "Criar conta",
    login: "Entrar",
    recover: "Recuperar acesso",
  };

  return (
    <div className="sv-auth">
      <button type="button" className="linkish sv-back" onClick={onBack}>
        Voltar
      </button>

      <h2>{titles[mode]}</h2>
      <p className="sv-auth-lede">
        {mode === "create"
          ? "Usuário e senha. Por baixo, uma identidade Nostr real — a chave fica cifrada com a sua senha."
          : mode === "login"
            ? "Abra o cofre da sua conta SatVantage."
            : "Duas provas: pergunta de segurança e chave de recuperação."}
      </p>

      <input
        placeholder="usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        style={inputStyle}
      />

      {mode === "create" && existingSession && !forceCreate ? (
        <div className="sv-error-box" role="alert">
          <p className="sv-error" style={{ color: "var(--ink)" }}>
            Você já está conectado como {npubShort(existingSession.npub)}. Criar uma conta
            nova gera uma identidade Nostr diferente — o saldo e o progresso da conta atual
            ficam nela, não passam para a nova.
          </p>
          <button
            type="button"
            className="sv-error-action"
            onClick={() => onLogin?.(existingSession)}
          >
            Ir para minha conta
          </button>
          <button type="button" className="ghost" onClick={() => setForceCreate(true)}>
            Criar conta nova mesmo assim
          </button>
        </div>
      ) : (
        mode === "create" && (
          <>
            <input
              placeholder="senha (mínimo 8 caracteres)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
            />
            <input
              placeholder="pergunta de segurança (só você sabe a resposta)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="resposta"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={inputStyle}
            />
            <p className="sv-hint">Evite respostas que estejam nas suas redes sociais.</p>
            <button
              type="button"
              onClick={criarConta}
              disabled={busy !== null || !username || !password}
            >
              {busy === "create" ? "Criando cofre…" : "Criar conta"}
            </button>
          </>
        )
      )}

      {mode === "login" && (
        <>
          <input
            placeholder="senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={entrar}
            disabled={busy !== null || !username || !password}
          >
            {busy === "login" ? "Abrindo cofre…" : "Entrar"}
          </button>
          <button type="button" className="linkish" onClick={() => go("recover")}>
            Esqueci minha senha
          </button>
        </>
      )}

      {mode === "recover" && recoverStep === 1 && (
        <>
          <p className="sv-hint">
            Vamos verificar a posse da conta: pergunta de segurança e chave de
            recuperação.
          </p>
          <button
            type="button"
            onClick={iniciarRecuperacao}
            disabled={busy !== null || !username}
          >
            {busy === "rinfo" ? "Buscando…" : "Continuar"}
          </button>
        </>
      )}

      {mode === "recover" && recoverStep === 2 && recoverInfo && (
        <>
          <p className="sv-question">
            <strong>{recoverInfo.question}</strong>
          </p>
          <input
            placeholder="sua resposta"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="chave de recuperação (nsec1...)"
            value={nsecInput}
            onChange={(e) => setNsecInput(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="senha nova (mínimo 8 caracteres)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={concluirRecuperacao}
            disabled={busy !== null || !answer || !nsecInput || !password}
          >
            {busy === "recover" ? "Verificando posse…" : "Redefinir senha"}
          </button>
        </>
      )}

      <p className="sv-foot">
        Sua conta é uma identidade Nostr. Guardamos o cofre, nunca a chave.
      </p>

      {error && (
        <div role="alert" className="sv-error-box">
          <p className="sv-error">{error}</p>
          {(error.includes("já está em uso") || error.includes("já existe")) && mode === "create" && (
            <button
              type="button"
              className="sv-error-action"
              onClick={() => go("login", { keepUsername: true })}
            >
              Acessar conta
            </button>
          )}
        </div>
      )}
    </div>
  );
}