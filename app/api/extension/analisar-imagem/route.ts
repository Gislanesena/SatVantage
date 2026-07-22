// POST /api/extension/analisar-imagem — Copiloto com visão (screenshot da aba).
// Público para a extensão; sem sessão SatVantage.
import { NextRequest, NextResponse } from "next/server";
import { analisarImagem } from "@/lib/extension-analisar";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    imagemBase64?: string;
    mediaType?: string;
    pergunta?: string;
    paginaTexto?: string;
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

  const imagemBase64 =
    typeof body.imagemBase64 === "string" ? body.imagemBase64.trim() : "";
  if (!imagemBase64) {
    return NextResponse.json(
      { error: "envie imagemBase64 (PNG/JPEG)" },
      { status: 400, headers: corsHeaders },
    );
  }

  // Limite aproximado (~4MB base64) para não derrubar o servidor local
  if (imagemBase64.length > 5_500_000) {
    return NextResponse.json(
      { error: "imagem grande demais — selecione uma área menor" },
      { status: 413, headers: corsHeaders },
    );
  }

  const result = await analisarImagem({
    imagemBase64,
    mediaType: typeof body.mediaType === "string" ? body.mediaType : "image/png",
    pergunta: typeof body.pergunta === "string" ? body.pergunta : "",
    paginaTexto: typeof body.paginaTexto === "string" ? body.paginaTexto : "",
    paginaTitulo:
      typeof body.paginaTitulo === "string" ? body.paginaTitulo : undefined,
    paginaUrl: typeof body.paginaUrl === "string" ? body.paginaUrl : undefined,
  });

  return NextResponse.json(
    {
      tipo: result.tipo,
      risco: result.risco,
      explicacao: result.explicacao,
      proximosPassos: result.proximosPassos,
    },
    { headers: corsHeaders },
  );
}
