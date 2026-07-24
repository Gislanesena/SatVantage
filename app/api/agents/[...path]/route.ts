import { NextRequest, NextResponse } from "next/server";
import { replyNagaiLocal } from "@/lib/nagai-local";

const AGENTS_BASE = (process.env.AGENTS_API_URL ?? "").replace(/\/$/, "");
/** Upstream fora do ar não pode travar o chat por 60s. */
const UPSTREAM_TIMEOUT_MS = 8_000;
const IS_PROD =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

type Ctx = { params: { path: string[] } };

type UpstreamFailKind =
  | "not_configured"
  | "localhost_in_prod"
  | "invalid_url"
  | "timeout"
  | "connection_refused"
  | "dns"
  | "http_error"
  | "empty_response"
  | "network"
  | "unknown";

/** Mapeia /api/agents/<rota> → caminho limpo no FastAPI (sem /api/api). */
function upstreamPath(parts: string[]): string {
  const suffix = parts.join("/");
  if (!suffix) return "";
  if (suffix === "health" || suffix.startsWith("health/")) {
    return `/${suffix}`;
  }
  if (suffix === "comportamental" || suffix.startsWith("comportamental/")) {
    return `/${suffix}`;
  }
  // mentor, interact, etc. → /api/<...>
  return `/api/${suffix}`;
}

function chatRoute(parts: string[]): boolean {
  const head = (parts[0] || "").toLowerCase();
  return head === "mentor" || head === "interact";
}

function safeHost(base: string): string {
  try {
    return new URL(base).host;
  } catch {
    return "(URL inválida)";
  }
}

function isLocalAgentsUrl(base: string): boolean {
  try {
    const host = new URL(base).hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local")
    );
  } catch {
    return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(base);
  }
}

function classifyFetchError(e: unknown): {
  kind: UpstreamFailKind;
  detail: string;
} {
  const err = e as Error & {
    cause?: { code?: string; message?: string };
    code?: string;
    name?: string;
  };
  const msg = err?.message || String(e);
  const causeCode = String(err?.cause?.code || err?.code || "");
  const name = err?.name || "";
  const blob = `${name} ${causeCode} ${msg}`;

  if (
    name === "TimeoutError" ||
    name === "AbortError" ||
    /timeout|aborted|AbortError/i.test(blob)
  ) {
    return {
      kind: "timeout",
      detail: `timeout após ${UPSTREAM_TIMEOUT_MS}ms — ${msg}`,
    };
  }
  if (/ECONNREFUSED|connection refused/i.test(blob)) {
    return { kind: "connection_refused", detail: msg };
  }
  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo|DNS/i.test(blob)) {
    return { kind: "dns", detail: msg };
  }
  if (/fetch failed|network|ECONNRESET|EPIPE|UND_ERR/i.test(blob)) {
    return { kind: "network", detail: `${causeCode || name}: ${msg}` };
  }
  return { kind: "unknown", detail: msg };
}

function logAgentsFail(
  kind: UpstreamFailKind,
  info: {
    method: string;
    path: string;
    target?: string;
    status?: number;
    detail?: string;
  },
) {
  const host = AGENTS_BASE ? safeHost(AGENTS_BASE) : "(não configurada)";
  const target = info.target ? ` target=${info.target}` : "";
  const status =
    typeof info.status === "number" ? ` http=${info.status}` : "";
  const detail = info.detail ? ` detail=${info.detail}` : "";
  console.error(
    `[agents-proxy] FALHA kind=${kind} method=${info.method} path=${info.path}` +
      ` AGENTS_API_URL_host=${host}${target}${status}${detail}`,
  );
}

async function localChatReply(
  rawBody: string | undefined,
  meta: { kind: UpstreamFailKind; detail?: string },
) {
  let mensagem = "";
  let locale = "pt";
  try {
    const parsed = rawBody ? JSON.parse(rawBody) : {};
    mensagem =
      typeof parsed.mensagem_usuario === "string"
        ? parsed.mensagem_usuario
        : typeof parsed.mensagem === "string"
          ? parsed.mensagem
          : typeof parsed.message === "string"
            ? parsed.message
            : "";
    locale =
      typeof parsed.idioma === "string"
        ? parsed.idioma
        : typeof parsed.locale === "string"
          ? parsed.locale
          : "pt";
  } catch {
    /* ignore */
  }

  console.warn(
    `[agents-proxy] fallback local — kind=${meta.kind}` +
      (meta.detail ? ` detail=${meta.detail}` : "") +
      ` msg_len=${mensagem.length}`,
  );

  const local = await replyNagaiLocal({
    mensagem,
    locale,
    degradeKind: meta.kind,
  });

  return NextResponse.json({
    ...local,
    resposta: local.resposta_ia,
    status: "chat",
    degraded: true,
    upstream_fail: meta.kind,
  });
}

async function proxy(req: NextRequest, ctx: Ctx) {
  const parts = ctx.params.path || [];
  const path = upstreamPath(parts);
  if (!path || path === "/") {
    return NextResponse.json({ error: "rota de agente inválida" }, { status: 400 });
  }

  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

  if (!AGENTS_BASE) {
    logAgentsFail("not_configured", {
      method: req.method,
      path,
      detail: "defina AGENTS_API_URL no ambiente do servidor Next (ex.: Vercel)",
    });
    if (chatRoute(parts) && req.method === "POST") {
      return localChatReply(body, {
        kind: "not_configured",
        detail: "AGENTS_API_URL vazia",
      });
    }
    return NextResponse.json(
      { error: "AGENTS_API_URL não configurada no servidor Next" },
      { status: 503 },
    );
  }

  let parsedBase: URL;
  try {
    parsedBase = new URL(AGENTS_BASE);
  } catch {
    logAgentsFail("invalid_url", {
      method: req.method,
      path,
      detail: `AGENTS_API_URL inválida: ${AGENTS_BASE.slice(0, 80)}`,
    });
    if (chatRoute(parts) && req.method === "POST") {
      return localChatReply(body, {
        kind: "invalid_url",
        detail: "URL malformada",
      });
    }
    return NextResponse.json(
      { error: "AGENTS_API_URL inválida no servidor Next" },
      { status: 503 },
    );
  }

  // Em produção, localhost/127.0.0.1 nunca alcança o FastAPI — evita 8s de timeout.
  if (IS_PROD && isLocalAgentsUrl(AGENTS_BASE)) {
    logAgentsFail("localhost_in_prod", {
      method: req.method,
      path,
      target: `${parsedBase.protocol}//${parsedBase.host}${path}`,
      detail:
        "AGENTS_API_URL aponta para host local em produção; configure a URL pública do FastAPI",
    });
    if (chatRoute(parts) && req.method === "POST") {
      return localChatReply(body, {
        kind: "localhost_in_prod",
        detail: safeHost(AGENTS_BASE),
      });
    }
    return NextResponse.json(
      {
        error:
          "AGENTS_API_URL aponta para localhost em produção — configure a URL do FastAPI",
      },
      { status: 503 },
    );
  }

  const target = `${AGENTS_BASE}${path}${req.nextUrl.search}`;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const text = await upstream.text();

    if (!upstream.ok) {
      logAgentsFail("http_error", {
        method: req.method,
        path,
        target,
        status: upstream.status,
        detail: text.slice(0, 200) || upstream.statusText,
      });
      if (chatRoute(parts) && req.method === "POST") {
        return localChatReply(body, {
          kind: "http_error",
          detail: `HTTP ${upstream.status}`,
        });
      }
      return new NextResponse(text, {
        status: upstream.status,
        headers: {
          "Content-Type":
            upstream.headers.get("Content-Type") || "application/json",
        },
      });
    }

    if (
      chatRoute(parts) &&
      req.method === "POST" &&
      (!text || !text.trim() || text.trim() === "{}")
    ) {
      logAgentsFail("empty_response", {
        method: req.method,
        path,
        target,
        status: upstream.status,
        detail: "corpo vazio ou {}",
      });
      return localChatReply(body, {
        kind: "empty_response",
        detail: "upstream OK mas sem conteúdo útil",
      });
    }

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (e: unknown) {
    const { kind, detail } = classifyFetchError(e);
    logAgentsFail(kind, {
      method: req.method,
      path,
      target,
      detail,
    });
    if (chatRoute(parts) && req.method === "POST") {
      return localChatReply(body, { kind, detail });
    }
    return NextResponse.json(
      {
        error: detail,
        upstream_fail: kind,
        agents_host: safeHost(AGENTS_BASE),
      },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
