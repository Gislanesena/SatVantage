/** Passos do tutorial guiado do simulador prático (boleta + terminal). */

export type ProTourStep = {
  id: string;
  title: string;
  body: string;
  /** Precisa da boleta aberta para destacar o alvo */
  needsBoleta?: boolean;
};

export const PRO_TOUR_STORAGE_KEY = "sv_pro_tour_done";
export const PRO_TOUR_PORTAL_ID = "sv-pro-tour-portal";
export const PRO_TOUR_BODY_CLASS = "sv-pro-tour-on";

export type TourHole = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type TourCardPos = {
  top: number;
  left: number;
  width: number;
  arrow: number;
};

export type TourLayout = {
  place: "above" | "below";
  hole: TourHole;
  card: TourCardPos;
};

const SAFE = 16;
const GAP = 12;
const HOLE_PAD = 4;
const SCROLL_MARGIN = 64;

/** Garante um host exclusivo sob <body> (fora de qualquer overflow/transform). */
export function ensureTourPortalRoot(): HTMLElement {
  let root = document.getElementById(PRO_TOUR_PORTAL_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = PRO_TOUR_PORTAL_ID;
    root.setAttribute("data-sv-tour-portal", "1");
    document.body.appendChild(root);
  }
  return root;
}

/**
 * Spotlight + balão em coordenadas de viewport (position: fixed).
 * Usa apenas getBoundingClientRect — nunca scrollY / offset de documento.
 *
 * @param lockPlace se definido (ex.: durante scroll), mantém o lado e só
 *   atualiza top/left colados ao alvo — evita o balão “pular” de lado.
 */
export function computeTourLayout(
  target: DOMRectReadOnly,
  card: { width: number; height: number },
  viewport: { width: number; height: number },
  lockPlace?: "above" | "below",
): TourLayout {
  const hole: TourHole = {
    top: target.top - HOLE_PAD,
    left: target.left - HOLE_PAD,
    width: Math.max(0, target.width + HOLE_PAD * 2),
    height: Math.max(0, target.height + HOLE_PAD * 2),
  };

  let place: "above" | "below" = lockPlace ?? "below";

  if (!lockPlace) {
    const need = card.height + GAP;
    const spaceBelow = viewport.height - target.bottom - SAFE;
    const spaceAbove = target.top - SAFE;
    if (spaceBelow >= need) place = "below";
    else if (spaceAbove >= need) place = "above";
    else place = spaceBelow >= spaceAbove ? "below" : "above";
  }

  // Ancoragem direta no alvo (viewport coords → position: fixed).
  let top =
    place === "below"
      ? target.bottom + GAP
      : target.top - card.height - GAP;

  let left = target.left + target.width / 2 - card.width / 2;
  // Só margem lateral — sem clamp vertical que “desafixa” do alvo.
  left = Math.min(
    Math.max(SAFE, left),
    Math.max(SAFE, viewport.width - card.width - SAFE),
  );

  const arrow = Math.min(
    88,
    Math.max(12, ((target.left + target.width / 2 - left) / card.width) * 100),
  );

  return {
    place,
    hole,
    card: { top, left, width: card.width, arrow },
  };
}

export function tourLayoutsClose(a: TourLayout | null, b: TourLayout): boolean {
  if (!a) return false;
  const near = (x: number, y: number) => Math.abs(x - y) < 0.75;
  return (
    a.place === b.place &&
    near(a.hole.top, b.hole.top) &&
    near(a.hole.left, b.hole.left) &&
    near(a.hole.width, b.hole.width) &&
    near(a.hole.height, b.hole.height) &&
    near(a.card.top, b.card.top) &&
    near(a.card.left, b.card.left) &&
    near(a.card.width, b.card.width) &&
    near(a.card.arrow, b.card.arrow)
  );
}

/** Altura ocupada pelo nav no topo da viewport. */
export function getTourTopInset(): number {
  const nav = document.querySelector(".sv-nav") as HTMLElement | null;
  if (!nav) return SCROLL_MARGIN;
  const r = nav.getBoundingClientRect();
  if (r.bottom > 0 && r.top < 120) {
    return Math.ceil(r.bottom) + 14;
  }
  return SCROLL_MARGIN;
}

/**
 * Centraliza o alvo na viewport e resolve só depois do scroll assentar
 * (evita medir coordenadas antigas).
 */
export function scrollTourTargetIntoView(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    window.setTimeout(resolve, 360);
  });
}

/** Garante que o retângulo do buraco não cole na borda da viewport. */
export function clampHoleToViewport(
  hole: TourHole,
  viewport: { width: number; height: number },
  inset = 4,
): TourHole {
  const top = Math.max(inset, hole.top);
  const left = Math.max(inset, hole.left);
  const right = Math.min(viewport.width - inset, hole.left + hole.width);
  const bottom = Math.min(viewport.height - inset, hole.top + hole.height);
  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

export const PRO_TOUR_STEPS: ProTourStep[] = [
  {
    id: "mode",
    title: "Simulador × Conta Real",
    body: "Aqui você treina sem risco. Deixe em Simulador: o dinheiro é fictício (começa com R$ 10.000). Conta Real não envia ordens neste terminal — serve só para lembrar que o saldo de verdade fica no dashboard.",
  },
  {
    id: "stats",
    title: "Seu dinheiro no treino",
    body: "Resultado bruto mostra se você está no lucro ou prejuízo neste treino. Patrimônio é o total estimado (dinheiro em caixa + Bitcoin que você comprou, ao preço atual).",
  },
  {
    id: "chart",
    title: "O gráfico (candles)",
    body: "Cada barra (candle) mostra o movimento do preço do Bitcoin em BRL no período escolhido. Verde/ciano = subiu no intervalo. Vermelho = caiu. Use isso só como referência visual — no treino você não precisa prever o mercado perfeitamente.",
  },
  {
    id: "interval",
    title: "Tempo do gráfico",
    body: "Escolhe o tamanho de cada candle: 1, 5 ou 15 minutos. Intervalos menores mostram movimentos mais rápidos; maiores, a tendência com mais calma.",
  },
  {
    id: "side",
    title: "Compra ou Venda",
    body: "Compra: você gasta reais do caixa para obter Bitcoin. Venda: você troca Bitcoin por reais de volta ao caixa. No início do treino, comece pela Compra.",
    needsBoleta: true,
  },
  {
    id: "type",
    title: "Tipo de ordem",
    body: "Mercado: executa já no preço atual (mais simples para começar). Limitada: só executa se o preço chegar no valor que você definir no campo Preço.",
    needsBoleta: true,
  },
  {
    id: "qty",
    title: "Quantidade (BTC)",
    body: "Quanto Bitcoin você quer comprar ou vender. Ex.: 0,001 BTC. Valores menores gastam menos do seu caixa fictício e são ideais para aprender.",
    needsBoleta: true,
  },
  {
    id: "price",
    title: "Preço",
    body: "Na ordem a mercado este campo fica bloqueado (usa o preço ao vivo). Na limitada, você digita o preço em reais em que a ordem pode ser executada.",
    needsBoleta: true,
  },
  {
    id: "gain",
    title: "Objetivo (Gain)",
    body: "Preço alvo de lucro. Se o Bitcoin subir até esse valor, o simulador pode fechar a posição automaticamente para realizar o ganho. Deixe em branco se ainda não quiser usar.",
    needsBoleta: true,
  },
  {
    id: "gainReduce",
    title: "Redução gain (breakeven)",
    body: "Preço intermediário opcional. Quando o mercado passa por aqui, o stop pode ser puxado para o preço de entrada — assim você tenta proteger o capital se o preço voltar. Pode deixar vazio no começo.",
    needsBoleta: true,
  },
  {
    id: "stop",
    title: "Stop Loss",
    body: "Preço de proteção contra prejuízo. Se o Bitcoin cair até esse valor, a posição pode ser fechada para limitar a perda. Também é opcional, mas ajuda a treinar gestão de risco.",
    needsBoleta: true,
  },
  {
    id: "exec",
    title: "Executar a ordem",
    body: "Quando estiver pronto, toque em COMPRAR ou VENDER. A ordem usa saldo fictício. Você pode limpar os campos e tentar de novo quantas vezes quiser — ou usar Zerar Tudo no topo para recomeçar com R$ 10.000.",
    needsBoleta: true,
  },
];
