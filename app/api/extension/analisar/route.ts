// POST /api/extension/analisar — endpoint público do Copiloto (extensão).
// Recebe só { paginaTexto, pergunta } (+ título/URL opcionais).
// Sem autenticação SatVantage: a extensão é ferramenta isolada.
import { NextRequest, NextResponse } from "next/server";
import { analisarPagina } from "@/lib/extension-analisar";
import { isSatVantageOfficialUrl } from "@/lib/extension-satvantage-site";

export const dynamic = "force-dynamic";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  let body: {
    paginaTexto?: string;
    pergunta?: string;
    paginaTitulo?: string;
    paginaUrl?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "JSON inválido" },
      { status: 400, headers: corsHeaders },
    );
  }

  const pergunta = typeof body.pergunta === "string" ? body.pergunta.trim() : "";
  // pergunta vazia = resumo da página (Analisar página sem digitar)

  const paginaUrl = typeof body.paginaUrl === "string" ? body.paginaUrl : undefined;

  const result = await analisarPagina({
    paginaTexto: typeof body.paginaTexto === "string" ? body.paginaTexto : "",
    pergunta,
    paginaTitulo:
      typeof body.paginaTitulo === "string" ? body.paginaTitulo : undefined,
    paginaUrl,
  });

  return NextResponse.json(
    {
      tipo: result.tipo,
      risco: result.risco,
      explicacao: result.explicacao,
      proximosPassos: result.proximosPassos,
      siteOficial: isSatVantageOfficialUrl(paginaUrl),
      paginaUrl: paginaUrl ?? null,
    },
    { headers: corsHeaders },
  );
}
