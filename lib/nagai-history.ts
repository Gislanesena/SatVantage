/**
 * Histórico leve da NagAI (client-side).
 * - Índice: só metadados (data, resumo, locale) — listagem rápida
 * - Mensagens: chave separada por conversa — carregadas sob demanda
 */
import type { Locale } from "@/lib/i18n";

export type NagaiHistoryLine = {
  kind: "agent" | "user";
  text: string;
  satsNote?: string;
  sats?: number;
};

export type NagaiHistoryMeta = {
  id: string;
  createdAt: number;
  updatedAt: number;
  locale: Locale;
  slug: string;
  summary: string;
  messageCount: number;
};

const INDEX_PREFIX = "sv_nagai_hist_idx:";
const MSG_PREFIX = "sv_nagai_hist_msg:";
const SCOPE_CACHE = "sv_nagai_hist_scope";

const MAX_CONVERSATIONS = 30;
const MAX_MESSAGES = 80;
const MAX_TEXT_CHARS = 1800;
const SUMMARY_CHARS = 96;

function indexKey(scope: string) {
  return `${INDEX_PREFIX}${scope}`;
}

function msgKey(scope: string, id: string) {
  return `${MSG_PREFIX}${scope}:${id}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function trimLine(line: NagaiHistoryLine): NagaiHistoryLine {
  const text = (line.text || "").slice(0, MAX_TEXT_CHARS);
  const out: NagaiHistoryLine = { kind: line.kind, text };
  if (line.satsNote) out.satsNote = line.satsNote.slice(0, 200);
  if (typeof line.sats === "number") out.sats = line.sats;
  return out;
}

export function summarizeLines(lines: NagaiHistoryLine[]): string {
  const user = lines.find((l) => l.kind === "user" && l.text.trim());
  const agent = lines.find((l) => l.kind === "agent" && l.text.trim());
  const base = (user?.text || agent?.text || "").replace(/\s+/g, " ").trim();
  if (!base) return "—";
  return base.length > SUMMARY_CHARS ? `${base.slice(0, SUMMARY_CHARS - 1)}…` : base;
}

/** Resolve escopo do usuário (npub) com cache em sessionStorage. */
export async function resolveHistoryScope(): Promise<string> {
  if (typeof window === "undefined") return "guest";
  try {
    const cached = sessionStorage.getItem(SCOPE_CACHE);
    if (cached) return cached;
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch("/api/auth/session");
    const data = await res.json().catch(() => ({}));
    const scope =
      (typeof data?.user?.npub === "string" && data.user.npub) ||
      (typeof data?.user?.id === "string" && data.user.id) ||
      "guest";
    try {
      sessionStorage.setItem(SCOPE_CACHE, scope);
    } catch {
      /* ignore */
    }
    return scope;
  } catch {
    return "guest";
  }
}

export function listHistoryMeta(
  scope: string,
  locale?: Locale,
): NagaiHistoryMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const all = safeParse<NagaiHistoryMeta[]>(
      localStorage.getItem(indexKey(scope)),
      [],
    );
    const filtered = locale ? all.filter((m) => m.locale === locale) : all;
    return filtered
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_CONVERSATIONS);
  } catch {
    return [];
  }
}

/** Carrega mensagens completas só quando o usuário abre uma conversa. */
export function loadHistoryMessages(
  scope: string,
  id: string,
): NagaiHistoryLine[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(msgKey(scope, id));
    if (!raw) return null;
    const lines = safeParse<NagaiHistoryLine[]>(raw, []);
    return Array.isArray(lines) ? lines : null;
  } catch {
    return null;
  }
}

export function upsertHistoryConversation(
  scope: string,
  input: {
    id: string;
    locale: Locale;
    slug: string;
    lines: NagaiHistoryLine[];
    createdAt?: number;
  },
): NagaiHistoryMeta | null {
  if (typeof window === "undefined") return null;
  const usable = input.lines
    .filter((l) => l.text?.trim())
    .map(trimLine)
    .slice(-MAX_MESSAGES);
  if (usable.length < 2) return null;

  const now = Date.now();
  const meta: NagaiHistoryMeta = {
    id: input.id,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    locale: input.locale,
    slug: input.slug,
    summary: summarizeLines(usable),
    messageCount: usable.length,
  };

  try {
    localStorage.setItem(msgKey(scope, meta.id), JSON.stringify(usable));

    const prev = safeParse<NagaiHistoryMeta[]>(
      localStorage.getItem(indexKey(scope)),
      [],
    );
    const without = prev.filter((m) => m.id !== meta.id);
    const next = [meta, ...without]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_CONVERSATIONS);

    // Remove mensagens órfãs além do índice
    const keep = new Set(next.map((m) => m.id));
    for (const old of prev) {
      if (!keep.has(old.id)) {
        try {
          localStorage.removeItem(msgKey(scope, old.id));
        } catch {
          /* ignore */
        }
      }
    }

    localStorage.setItem(indexKey(scope), JSON.stringify(next));
    return meta;
  } catch {
    return null;
  }
}

export function deleteHistoryConversation(scope: string, id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(msgKey(scope, id));
    const prev = safeParse<NagaiHistoryMeta[]>(
      localStorage.getItem(indexKey(scope)),
      [],
    );
    localStorage.setItem(
      indexKey(scope),
      JSON.stringify(prev.filter((m) => m.id !== id)),
    );
  } catch {
    /* ignore */
  }
}

export function newConversationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatHistoryDate(ts: number, locale: Locale): string {
  const tag = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
  try {
    return new Date(ts).toLocaleString(tag, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date(ts).toISOString();
  }
}
