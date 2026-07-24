// Conteúdo do tutorial visual "Como investir em Bitcoin" (ramo Teórico).

export type TutorialStep = {
  id: string;
  title: string;
  body: string;
  tip?: string;
};

export const INVEST_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "o-que-e",
    title: "1. O que você está comprando",
    body: "Bitcoin é uma moeda digital sem banco central. Ao investir, você troca reais (ou outra moeda) por frações de BTC — inclusive satoshis, a menor unidade.",
    tip: "Não precisa comprar 1 Bitcoin inteiro. Dá para começar com valores pequenos.",
  },
  {
    id: "carteira",
    title: "2. Tenha um lugar seguro para guardar",
    body: "Antes de comprar, escolha uma carteira. Para começar, uma carteira mobile confiável basta. Depois, para valores maiores, considere carteira fria (offline).",
    tip: "A frase-semente (seed) é a chave da sua soberania. Nunca compartilhe nem fotografe.",
  },
  {
    id: "corretora",
    title: "3. Escolha como comprar",
    body: "Você pode comprar em corretoras (ex.: Mercado Bitcoin, Binance) ou via P2P. Na SatVantage, corretoras integradas ajudam a operar com mais clareza.",
    tip: "Compare taxas e verifique se a corretora permite sacar para a sua carteira.",
  },
  {
    id: "primeiro-aporte",
    title: "4. Faça o primeiro aporte com calma",
    body: "Defina um valor que você pode perder sem desespero. Evite promessas de lucro garantido — isso costuma ser golpe. Compre, retire para a sua carteira quando fizer sentido, e estude o básico de segurança.",
    tip: "Investir ≠ day trade. Para iniciantes, foco em aprender custódia e paciência.",
  },
  {
    id: "proximo",
    title: "5. Pratique e tire dúvidas",
    body: "Agora você pode testar o que aprendeu no quiz da NagAI (ganha satoshis reais de mentoria) ou treinar compras e vendas no simulador prático com dinheiro fictício.",
    tip: "Teórico consolida conceitos. Prático treina decisão — os dois se complementam.",
  },
];
