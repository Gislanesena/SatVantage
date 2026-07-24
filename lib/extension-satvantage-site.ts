// lib/extension-satvantage-site.ts
// Site oficial SatVantage — reconhecimento + mapa + tom empático/comercial.

/** Hosts oficiais (produção + preview antigo + local). */
export const SATVANTAGE_OFFICIAL_HOSTS = [
  "sat-vantage-gislanesena.vercel.app",
  "sat-vantage-iau60jdhv-gislanesena.vercel.app",
  "localhost",
  "127.0.0.1",
] as const;

export const SATVANTAGE_OFFICIAL_URL =
  "https://sat-vantage-gislanesena.vercel.app/";

export function isSatVantageOfficialUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (SATVANTAGE_OFFICIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      return true;
    }
    // Previews Vercel do projeto (ex.: sat-vantage-xxxx.vercel.app)
    if (host.endsWith(".vercel.app") && /sat[-]?vantage/i.test(host)) return true;
    return false;
  } catch {
    return false;
  }
}

/** Onde o usuário está no site oficial (path + texto). */
export function detectarAreaSatVantage(
  url?: string | null,
  paginaTexto?: string,
): { area: string; dica: string } {
  const path = (() => {
    try {
      return new URL(url || "").pathname.toLowerCase();
    } catch {
      return "/";
    }
  })();
  const blob = `${paginaTexto || ""}`.toLowerCase();

  if (/heranca|herança|prova de vida|herdeiro|carimbo/.test(blob) || path.includes("heranca")) {
    return {
      area: "Herança digital",
      dica: "Aqui você organiza herdeiros, carimba o plano e confirma que está bem — sem a gente custodiar suas chaves.",
    };
  }
  if (/conectar carteira|nostr\+walletconnect|enviar|receber|mutinynet|nwc/.test(blob)) {
    return {
      area: "Dashboard · carteira Lightning",
      dica: "Conecte NWC MutinyNet, envie/receba sats de teste ou saque o crédito SatVantage com calma.",
    };
  }
  if (/mentoria|nagai|primeiros passos|mentor/.test(blob)) {
    return {
      area: "Mentoria NagAI",
      dica: "É o nosso guia de primeiros passos — pode seguir ou pular; o chat continua no canto depois.",
    };
  }
  if (/saldo dispon|crédito satvantage|sacar sat|extrato/.test(blob)) {
    return {
      area: "Dashboard financeiro",
      dica: "Seu saldo, créditos da jornada e atalhos para movimentar sats com segurança.",
    };
  }
  if (/criar conta|acessar conta|invest|bitcoin ao vivo|extensão/.test(blob) || path === "/" || path === "") {
    return {
      area: "Início (landing)",
      dica: "Porta de entrada SatVantage: criar/acessar conta, ver Bitcoin ao vivo e conhecer a plataforma.",
    };
  }
  return {
    area: "Site oficial SatVantage",
    dica: "Você está em casa — use o menu ⚙️, o dashboard e o NagAI no canto quando precisar.",
  };
}

/** Resumo curto sem pergunta (botão Analisar página). */
export function resumoPaginaOficial(url?: string | null, paginaTexto?: string): {
  tipo: "guia";
  risco: "baixo";
  explicacao: string;
  proximosPassos: string[];
} {
  const { area, dica } = detectarAreaSatVantage(url, paginaTexto);
  const urlLabel = url?.split("?")[0] || SATVANTAGE_OFFICIAL_URL;
  return {
    tipo: "guia",
    risco: "baixo",
    explicacao:
      `URL oficial reconhecida: ${urlLabel}. ` +
      `Você está em “${area}”. ${dica} ` +
      "A SatVantage existe para te acompanhar no Bitcoin com empatia: mentoria, Lightning de teste e herança sem custódia de chaves. Pode explorar sem medo — estamos do seu lado.",
    proximosPassos: [
      `Confirme na barra: ${urlLabel}`,
      "Se quiser movimentar sats: Conectar carteira (NWC MutinyNet) ou Sacar Sat recebidos no saldo.",
      "Herança e emergência ficam no menu ⚙️.",
      "Dúvida pontual? Escreva abaixo ou use o NagAI no canto do app.",
    ],
  };
}

/** Mapa do site para o Copiloto orientar o usuário com carinho e clareza. */
export const SATVANTAGE_SITE_MAP = `
MAPA DO SITE OFICIAL SATVANTAGE (${SATVANTAGE_OFFICIAL_URL}):

1) Início / Landing
   - Apresentação da plataforma, Bitcoin ao vivo, por que SatVantage.
   - Criar conta (Nostr) ou acessar conta existente / extensão Nostr.
   - Card da extensão Copiloto (guia e segurança).

2) Mentoria NagAI (tela cheia, 1ª vez para iniciantes)
   - Conversa guiada de primeiros passos no Bitcoin.
   - Pode pular; o chat NagAI continua no canto do dashboard se quiser refazer.

3) Dashboard financeiro
   - Saldo SatVantage (voucher/crédito) e saldo da carteira Lightning (se conectada).
   - Extrato ilustrativo.
   - Conectar carteira: credencial NWC MutinyNet (rede de teste).
   - Com carteira: Receber (gerar cobrança) e Enviar (pagar lntbs).
   - Sacar Sat recebidos: resgata o crédito da mentoria/conta via invoice Lightning + QR.
   - Corretoras: painel de exchanges (conexão educativa).
   - Conhecer: perguntas rápidas (imposto, IR, patrimônio…).
   - Bitcoin ao vivo: preço e gráfico.

4) Menu ⚙️
   - Perfil / foto.
   - Herança digital: herdeiros, carimbo OpenTimestamps, prova de vida (check-in “estou bem”).
   - Modo emergência: desconecta carteira/corretoras após pergunta de segurança.
   - Idioma (PT/EN/ES) e tema.
   - Sair.

5) Chat NagAI (FAB no canto)
   - Mentoria e tópicos opcionais sem sair do dashboard.

6) Extensão SatVantage Copiloto
   - Analisa páginas Bitcoin/segurança; no site oficial, age como guia empático da própria plataforma.
`.trim();

export const SATVANTAGE_TOM_OFICIAL =
  "Você está no SITE OFICIAL SatVantage — reconheça com segurança (risco baixo). " +
  "Fale com EMPATIA e orgulho do produto: acolha dúvidas, celebre o cuidado da pessoa com Bitcoin, " +
  "destaque que a SatVantage educa com carinho, não custodia chaves na herança, usa MutinyNet na demo, " +
  "e acompanha o usuário com mentoria NagAI + extensão. Seja positivo e “se venda” com honestidade " +
  "(sem prometer lucro). Use o MAPA DO SITE para indicar onde clicar. Nunca peça seed/nsec.";

/** Bloco completo para prompts de agente / visão. */
export function instrucaoSiteOficial(): string {
  return `${SATVANTAGE_TOM_OFICIAL}\n\n${SATVANTAGE_SITE_MAP}`;
}

/**
 * Resposta local quando a aba é o site oficial.
 * Tom acolhedor + mapa; guia ou avaliação de “é seguro?”.
 */
export function respostaSiteOficial(
  pergunta: string,
  tipo: "avaliacao" | "guia",
): {
  tipo: "avaliacao" | "guia";
  risco: "baixo" | "medio" | "alto";
  explicacao: string;
  proximosPassos: string[];
} {
  const q = pergunta.toLowerCase();

  if (tipo === "avaliacao" || /golpe|seguro|confiavel|legitimo|scam|phishing/.test(q)) {
    return {
      tipo: "avaliacao",
      risco: "baixo",
      explicacao:
        "Sim — você está no site oficial da SatVantage. Pode respirar aliviado: este é o endereço certo. " +
        "Aqui a gente caminha com você no Bitcoin de forma humana: mentoria NagAI, carteira Lightning de teste (MutinyNet), " +
        "créditos da jornada e até herança digital sem custodiar suas chaves. " +
        "Foi feito para quem quer aprender com segurança e carinho — não para te apressar nem pedir seed.",
      proximosPassos: [
        "Confira o cadeado e o domínio sat-vantage-gislanesena.vercel.app na barra.",
        "Crie ou acesse sua conta Nostr e explore o dashboard no seu ritmo.",
        "Conecte uma carteira MutinyNet (NWC) quando quiser enviar/receber sats de teste.",
        "No menu ⚙️, conheça Herança e Modo emergência — proteção de verdade, linguagem clara.",
        "Deixe o Copiloto aberto: no site oficial ele é seu guia empático, passo a passo.",
      ],
    };
  }

  // Guia / mapa / “como uso”
  if (/mapa|onde|menu|heranca|herança|carteira|sacar|mentoria|dashboard|conta|nwc|emergencia|emergência/.test(q)) {
    const passos: string[] = [];
    if (/heranca|herança/.test(q)) {
      passos.push("Abra o menu ⚙️ (engrenagem) → Herança.");
      passos.push("Cadastre herdeiros (e-mail + %), carimbe o plano e use “Confirmar que estou bem” na prova de vida.");
      passos.push("Leia “Como funciona a herança?” — a gente explica com transparência e sem custodiar chaves.");
    } else if (/sacar|voucher|credito|crédito/.test(q)) {
      passos.push("No card de saldo, se houver Crédito SatVantage, toque em “Sacar Sat recebidos”.");
      passos.push("Cole ou escaneie uma cobrança MutinyNet (lntbs) do valor exato.");
      passos.push("Ou conecte a carteira e use o fluxo de Receber/repasse quando preferir.");
    } else if (/carteira|nwc|conectar|enviar|receber/.test(q)) {
      passos.push("No dashboard, toque em “Conectar carteira” e cole a credencial nostr+walletconnect:// (MutinyNet).");
      passos.push("Depois use Receber (gerar cobrança) ou Enviar (pagar lntbs).");
      passos.push("Lembre: nesta demo não usamos cobranças mainnet reais.");
    } else if (/mentoria|nagai|chat/.test(q)) {
      passos.push("Iniciantes veem a mentoria na primeira vez; depois o NagAI fica no botão flutuante do canto.");
      passos.push("Pode pular a tela cheia — o chat continua disponível quando você quiser.");
    } else if (/emergencia|emergência/.test(q)) {
      passos.push("Menu ⚙️ → Modo emergência.");
      passos.push("Responda a pergunta de segurança para desconectar carteira e corretoras deste dispositivo.");
    } else {
      passos.push("Início: criar/acessar conta Nostr.");
      passos.push("Dashboard: saldo, conectar carteira, enviar/receber, sacar créditos.");
      passos.push("Menu ⚙️: Herança, emergência, idioma, sair.");
      passos.push("Canto inferior: chat NagAI para tirar dúvidas com calma.");
    }
    if (passos.length < 4) {
      passos.push("Se travar, pergunte de novo ao Copiloto descrevendo a tela que você vê — estamos juntos nisso.");
    }

    return {
      tipo: "guia",
      risco: "baixo",
      explicacao:
        `Que bom que você está explorando a SatVantage — “${pergunta}”. ` +
        "Este é o nosso cantinho oficial para aprender Bitcoin sem medo: a gente te guia com empatia, " +
        "explica cada passo e celebra cada cuidado seu com a segurança. Use o mapa abaixo.",
      proximosPassos: passos.slice(0, 6),
    };
  }

  return {
    tipo: "guia",
    risco: "baixo",
    explicacao:
      "Você está na casa certa: o site oficial SatVantage. " +
      "Somos a plataforma que une educação Bitcoin, mentoria humana (NagAI), Lightning de teste e herança digital — " +
      "sempre do seu lado, sem custodiar suas chaves e sem pressa. Pode perguntar onde clicar; eu conheço o mapa inteiro.",
    proximosPassos: [
      "Landing: criar conta ou entrar · ver Bitcoin ao vivo e o valor da plataforma.",
      "Dashboard: saldo, conectar carteira NWC, enviar/receber, sacar sats recebidos.",
      "⚙️ Herança digital + Modo emergência · idioma PT/EN/ES.",
      "NagAI no canto: mentoria e dúvidas quando precisar de companhia.",
      "Extensão Copiloto: no site oficial, é seu guia empático — use à vontade.",
    ],
  };
}
