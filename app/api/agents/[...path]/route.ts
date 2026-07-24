import { NextRequest, NextResponse } from "next/server";

const AGENTS_BASE = (process.env.AGENTS_API_URL ?? "").replace(/\/$/, "");

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

async function proxy(req: NextRequest, ctx: Ctx) {
  if (!AGENTS_BASE) {
    return NextResponse.json(
      { error: "AGENTS_API_URL não configurada no servidor Next" },
      { status: 503 },
    );
  }

  const path = upstreamPath(ctx.params.path || []);
  if (!path || path === "/") {
    return NextResponse.json({ error: "rota de agente inválida" }, { status: 400 });
  }

  const target = `${AGENTS_BASE}${path}${req.nextUrl.search}`;
  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
      signal: AbortSignal.timeout(60_000),
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (e: unknown) {
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
