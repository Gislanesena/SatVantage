import { NextRequest, NextResponse } from "next/server";
import { replyNagaiLocal } from "@/lib/nagai-local";

const AGENTS_BASE = (process.env.AGENTS_API_URL ?? "").replace(/\/$/, "");
/** Upstream fora do ar não pode travar o chat por 60s. */
const UPSTREAM_TIMEOUT_MS = 8_000;

type Ctx = { params: { path: string[] } };

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

async function localChatReply(rawBody: string | undefined) {
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
  const local = await replyNagaiLocal({ mensagem, locale });
  return NextResponse.json({
    ...local,
    resposta: local.resposta_ia,
    status: "chat",
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
    if (chatRoute(parts) && req.method === "POST") {
      return localChatReply(body);
    }
    return NextResponse.json(
      { error: "AGENTS_API_URL não configurada no servidor Next" },
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
    // Se o mentor/interact falhou no FastAPI, responde localmente em vez de silenciar o chat.
    if (!upstream.ok && chatRoute(parts) && req.method === "POST") {
      return localChatReply(body);
    }
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (e: unknown) {
    if (chatRoute(parts) && req.method === "POST") {
      return localChatReply(body);
    }
    const message = e instanceof Error ? e.message : "agents-api indisponível";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
