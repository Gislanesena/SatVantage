"use client";
// components/LoginNostr.tsx — formulários de acesso (criar / entrar / recuperar).
// A landing com os dois caminhos vive em Landing.tsx.
//
// Caminho senha: identidade Nostr real (NIP-06 / BIP-39), chave cifrada no
//   navegador ("guardamos o cofre, nunca a chave").
// Caminho extensão: ver loginWithExtension — a chave nunca sai da extensão.
//
// Recuperação: 12 palavras BIP-39 (prova por assinatura) + pergunta de
// segurança. As duas juntas. Zero e-mail. Contas antigas (só nsec) ainda
// aceitam nsec1… no mesmo campo, só para não travar recuperação legada.
import { useEffect, useState } from "react";
import {
  getPublicKey,
  finalizeEvent,
  nip19,
  type EventTemplate,
} from "nostr-tools";
import {
  generateSeedWords,
  privateKeyFromSeedWords,
  validateWords,
} from "nostr-tools/nip06";
import { sealVault, openVault, hashAnswer, newSalt } from "@/lib/vault";

const LOGIN_EVENT_KIND = 22242;

type KeyGap = {
  index: number;
  expected: string;
};

type KeyPoolItem = {
  id: string;
  word: string;
};

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Sorteia 3 posições distintas entre as 12 palavras (índices 0–11). */
function pickWordGaps(words: string[]): KeyGap[] {
  const indices = new Set<number>();
  while (indices.size < 3) {
    indices.add(Math.floor(Math.random() * words.length));
  }
  return Array.from(indices)
    .sort((a, b) => a - b)
    .map((index) => ({ index, expected: words[index]! }));
}

function buildWordPool(gaps: KeyGap[]): KeyPoolItem[] {
  return shuffleInPlace(
    gaps.map((g, i) => ({ id: `gap-${i}-${g.index}`, word: g.expected }))
  );
}

function normalizeMnemonic(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Deriva a sk das 12 palavras (NIP-06). Aceita nsec1… só para contas legadas. */
function secretFromRecoveryInput(input: string): Uint8Array {
  const trimmed = input.trim();
  if (trimmed.toLowerCase().startsWith("nsec1")) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type !== "nsec") throw new Error();
      return decoded.data as Uint8Array;
    } catch {
      throw new Error("chave de recuperação inválida");
    }
  }

  const mnemonic = normalizeMnemonic(trimmed);
  const parts = mnemonic.split(" ").filter(Boolean);
  if (parts.length !== 12) {
    throw new Error("informe exatamente as 12 palavras de recuperação");
  }
  if (!validateWords(mnemonic)) {
    throw new Error("frase de recuperação inválida — confira as 12 palavras");
  }
  return privateKeyFromSeedWords(mnemonic);
}

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
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** null = ainda não checou / inválido curto; true/false = resultado do servidor */
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameCheckMsg, setUsernameCheckMsg] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [recoverStep, setRecoverStep] = useState<1 | 2>(1);
  const [recoverInfo, setRecoverInfo] = useState<{ question: string; qaSalt: string } | null>(
    null
  );

  const [pendingKey, setPendingKey] = useState<{
    words: string[];
    mnemonic: string;
    user: any;
  } | null>(null);
  const [keyBackupStep, setKeyBackupStep] = useState<"show" | "confirm">("show");
  /** 3 lacunas sorteadas uma vez; persistem se a pessoa voltar para ver as palavras. */
  const [keyGaps, setKeyGaps] = useState<KeyGap[]>([]);
  /** As 3 palavras que faltam, embaralhadas (ids estáveis). */
  const [keyPool, setKeyPool] = useState<KeyPoolItem[]>([]);
  /** Preenchimento das lacunas, na ordem esquerda → direita (posições sorteadas). */
  const [keyFilled, setKeyFilled] = useState<(string | null)[]>([null, null, null]);
  /** Ids dos botões já usados (removidos/desabilitados). */
  const [keyUsedIds, setKeyUsedIds] = useState<string[]>([]);
  const [keyConfirmError, setKeyConfirmError] = useState<string | null>(null);
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
    setMnemonicInput("");
    setForceCreate(false);
    setUsernameAvailable(null);
    setUsernameCheckMsg(null);
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
      setUsernameAvailable(null);
      setUsernameCheckMsg(null);
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

  // Verifica disponibilidade do usuário ao digitar (criar conta).
  useEffect(() => {
    if (mode !== "create") return;

    const raw = username.trim().toLowerCase();
    setUsernameAvailable(null);
    setUsernameCheckMsg(null);

    if (!raw) {
      setCheckingUsername(false);
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(raw)) {
      setCheckingUsername(false);
      setUsernameAvailable(false);
      setUsernameCheckMsg(
        "Usuário inválido (3-20 caracteres: letras minúsculas, números, _).",
      );
      return;
    }

    let cancelled = false;
    setCheckingUsername(true);
    const t = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch("/api/auth/check-username", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: raw }),
          });
          const data = await res.json().catch(() => ({}));
          if (cancelled) return;
          if (!res.ok) {
            setUsernameAvailable(null);
            setUsernameCheckMsg(
              typeof data.reason === "string" && data.reason
                ? data.reason
                : "Não foi possível verificar o usuário agora.",
            );
            return;
          }
          if (data.available) {
            setUsernameAvailable(true);
            setUsernameCheckMsg("Usuário disponível.");
          } else {
            setUsernameAvailable(false);
            setUsernameCheckMsg(
              data.reason ||
                "Esse usuário já está em uso. Escolha outro nome.",
            );
          }
        } catch {
          if (cancelled) return;
          setUsernameAvailable(null);
          setUsernameCheckMsg("Não foi possível verificar o usuário agora.");
        } finally {
          if (!cancelled) setCheckingUsername(false);
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [username, mode]);

  function npubShort(npub: string) {
    return npub.length > 16 ? `${npub.slice(0, 10)}…${npub.slice(-6)}` : npub;
  }

  function remember(u: string) {
    try {
      localStorage.setItem("sv_username", u);
    } catch {}
  }

  function resetKeyFill() {
    setKeyFilled([null, null, null]);
    setKeyUsedIds([]);
  }

  /** Entra na confirmação; sorteia as 3 posições só na primeira vez. */
  function goToKeyConfirm() {
    if (!pendingKey) return;
    if (keyGaps.length === 0) {
      const gaps = pickWordGaps(pendingKey.words);
      setKeyGaps(gaps);
      setKeyPool(buildWordPool(gaps));
    }
    resetKeyFill();
    setKeyConfirmError(null);
    setKeyBackupStep("confirm");
  }

  function goBackToKeyShow() {
    setKeyBackupStep("show");
    setKeyConfirmError(null);
  }

  function pickPoolWord(item: KeyPoolItem) {
    if (keyUsedIds.includes(item.id) || keyGaps.length < 3) return;
    const nextSlot = keyFilled.findIndex((v) => v === null);
    if (nextSlot < 0) return;
    const expected = keyGaps[nextSlot]!.expected;
    if (item.word !== expected) {
      setKeyConfirmError("Ordem errada — confira as palavras e tente de novo");
      resetKeyFill();
      return;
    }
    setKeyConfirmError(null);
    setKeyFilled((prev) => {
      const next = [...prev];
      next[nextSlot] = item.word;
      return next;
    });
    setKeyUsedIds((prev) => [...prev, item.id]);
  }

  function finishKeyBackup() {
    if (!pendingKey || keyGaps.length < 3) return;
    const ok = keyGaps.every((g, i) => keyFilled[i] === g.expected);
    if (!ok) {
      setKeyConfirmError("Ordem errada — confira as palavras e tente de novo");
      resetKeyFill();
      return;
    }
    const user = pendingKey.user;
    setPendingKey(null);
    setKeyBackupStep("show");
    setKeyGaps([]);
    setKeyPool([]);
    resetKeyFill();
    setKeyConfirmError(null);
    setCopied(false);
    onLogin?.(user);
  }

  const keyConfirmReady =
    keyGaps.length === 3 && keyGaps.every((g, i) => keyFilled[i] === g.expected);

  const gapOrderByIndex = new Map(keyGaps.map((g, i) => [g.index, i]));

  function go(m: AuthMode, opts?: { keepUsername?: boolean }) {
    const keepUser = opts?.keepUsername ? username : undefined;
    setMode(m);
    setError(null);
    setRecoverStep(1);
    setRecoverInfo(null);
    setPassword("");
    setQuestion("");
    setAnswer("");
    setMnemonicInput("");
    setUsernameAvailable(null);
    setUsernameCheckMsg(null);
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
    const userNorm = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(userNorm)) {
      return setError("Usuário inválido (3-20 caracteres: letras minúsculas, números, _).");
    }
    if (password.length < 8) return setError("A senha precisa de pelo menos 8 caracteres.");
    if (question.trim().length < 8)
      return setError("Escreva uma pergunta de segurança (mínimo 8 caracteres).");
    if (answer.trim().length < 2) return setError("Escreva a resposta da sua pergunta.");

    setBusy("create");
    try {
      // Checagem final no servidor antes de gerar chaves
      const check = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userNorm }),
      });
      const checkData = await check.json().catch(() => ({}));
      if (!check.ok) throw new Error(checkData.error ?? "erro ao verificar usuário");
      if (!checkData.available) {
        setUsernameAvailable(false);
        setUsernameCheckMsg(checkData.reason || "Esse usuário já está em uso.");
        throw new Error(
          checkData.reason ||
            "Esse usuário já está em uso. Escolha outro nome.",
        );
      }

      const mnemonic = generateSeedWords();
      const words = mnemonic.split(" ");
      const sk = privateKeyFromSeedWords(mnemonic);
      const { blob, salt } = await sealVault(sk, password);
      const qaSalt = newSalt();
      await postJson("/api/auth/register", {
        username: userNorm,
        pubkey: getPublicKey(sk),
        vaultBlob: blob,
        vaultSalt: salt,
        securityQuestion: question.trim(),
        answerHash: await hashAnswer(answer, qaSalt),
        qaSalt,
      });
      const { user } = await signAndLogin(sk);
      remember(userNorm);
      setKeyBackupStep("show");
      setKeyGaps([]);
      setKeyPool([]);
      setKeyFilled([null, null, null]);
      setKeyUsedIds([]);
      setKeyConfirmError(null);
      setCopied(false);
      setPendingKey({ words, mnemonic, user });
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
      const sk = secretFromRecoveryInput(mnemonicInput);

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
      setMnemonicInput("");
      setAnswer("");
      onLogin?.(user);
    } catch (e: any) {
      setError(e.message ?? "Falha na recuperação");
    } finally {
      setBusy(null);
    }
  }

  if (pendingKey) {
    if (keyBackupStep === "confirm") {
      const nextGapSlot = keyFilled.findIndex((v) => v === null);
      return (
        <div className="sv-auth">
          <button type="button" className="linkish sv-back" onClick={goBackToKeyShow}>
            Voltar para ver as palavras
          </button>
          <h2>Confirme que anotou</h2>
          <p>
            Complete as lacunas na ordem (1 → 2 → 3), clicando nas palavras abaixo.
            As lacunas não mudam se você voltar para conferir a frase.
          </p>
          <ol className="sv-mnemonic sv-mnemonic--gaps" aria-label="Frase com lacunas">
            {pendingKey.words.map((word, i) => {
              const gapSlot = gapOrderByIndex.get(i);
              if (gapSlot === undefined) {
                return (
                  <li key={i} className="sv-mnemonic-item">
                    <span className="sv-mnemonic-num">{i + 1}</span>
                    <span className="sv-mnemonic-word">{word}</span>
                  </li>
                );
              }
              const filled = keyFilled[gapSlot];
              const isNext = gapSlot === nextGapSlot;
              return (
                <li
                  key={i}
                  className={
                    filled
                      ? "sv-mnemonic-item sv-mnemonic-gap sv-mnemonic-gap--filled"
                      : isNext
                        ? "sv-mnemonic-item sv-mnemonic-gap sv-mnemonic-gap--next"
                        : "sv-mnemonic-item sv-mnemonic-gap"
                  }
                  title={`Lacuna ${gapSlot + 1}`}
                >
                  <span className="sv-mnemonic-num">{i + 1}</span>
                  <span className="sv-mnemonic-gap-slot">
                    <span className="sv-mnemonic-gap-num" aria-hidden="true">
                      {gapSlot + 1}
                    </span>
                    <span className="sv-mnemonic-word">{filled ?? ""}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="sv-key-options" role="group" aria-label="Palavras que faltam">
            {keyPool.map((item) => {
              const used = keyUsedIds.includes(item.id);
              if (used) return null;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="sv-key-option sv-key-option--word"
                  onClick={() => pickPoolWord(item)}
                >
                  {item.word}
                </button>
              );
            })}
          </div>
          {keyConfirmError && (
            <p className="sv-error" role="alert">
              {keyConfirmError}
            </p>
          )}
          <button type="button" disabled={!keyConfirmReady} onClick={finishKeyBackup}>
            Continuar para o SatVantage
          </button>
        </div>
      );
    }

    return (
      <div className="sv-auth">
        <h2>Guarde suas 12 palavras</h2>
        <p>
          Esta frase é o documento de posse da sua conta. Você não vai usá-la no
          dia a dia — só se esquecer a senha (junto com a pergunta de segurança).
          Anote fora do computador. Ela não será mostrada de novo.
        </p>
        <ol className="sv-mnemonic" aria-label="Frase de recuperação">
          {pendingKey.words.map((word, i) => (
            <li key={i} className="sv-mnemonic-item">
              <span className="sv-mnemonic-num">{i + 1}</span>
              <span className="sv-mnemonic-word">{word}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(pendingKey.mnemonic);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {}
          }}
        >
          {copied ? "Copiada" : "Copiar palavras"}
        </button>
        <button type="button" onClick={goToKeyConfirm}>
          Já anotei, continuar
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
            : "Duas provas: pergunta de segurança e as 12 palavras de recuperação."}
      </p>

      <input
        placeholder="usuário"
        aria-label="Nome de usuário"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
          if (error) setError(null);
        }}
        autoComplete="username"
        style={inputStyle}
        aria-invalid={mode === "create" && usernameAvailable === false}
      />
      {mode === "create" && (checkingUsername || usernameCheckMsg) && (
        <p
          className="sv-hint"
          role="status"
          style={{
            color:
              usernameAvailable === false
                ? "var(--danger, #ef4444)"
                : usernameAvailable === true
                  ? "var(--ok, #0f766e)"
                  : undefined,
            marginTop: -4,
          }}
        >
          {checkingUsername ? "Verificando usuário…" : usernameCheckMsg}
        </p>
      )}

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
              aria-label="Senha (mínimo 8 caracteres)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
            />
            <input
              placeholder="pergunta de segurança (só você sabe a resposta)"
              aria-label="Pergunta de segurança"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="resposta"
              aria-label="Resposta da pergunta de segurança"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={inputStyle}
            />
            <p className="sv-hint">Evite respostas que estejam nas suas redes sociais.</p>
            <button
              type="button"
              onClick={criarConta}
              disabled={
                busy !== null ||
                !username ||
                !password ||
                checkingUsername ||
                usernameAvailable === false
              }
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
            aria-label="Senha"
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
            Vamos verificar a posse da conta: pergunta de segurança e as 12
            palavras de recuperação.
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
            aria-label="Resposta da pergunta de segurança"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={inputStyle}
          />
          <textarea
            className="sv-mnemonic-input"
            placeholder="12 palavras de recuperação (separadas por espaço)"
            aria-label="12 palavras de recuperação"
            value={mnemonicInput}
            onChange={(e) => setMnemonicInput(e.target.value)}
            rows={3}
            autoComplete="off"
            spellCheck={false}
            style={inputStyle}
          />
          <input
            placeholder="senha nova (mínimo 8 caracteres)"
            aria-label="Nova senha (mínimo 8 caracteres)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={concluirRecuperacao}
            disabled={busy !== null || !answer || !mnemonicInput.trim() || !password}
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
        </div>
      )}
    </div>
  );
}
