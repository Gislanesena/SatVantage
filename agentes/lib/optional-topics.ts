/** Tópicos opcionais — conversa educativa SEM sats de missão. */

export type OptionalTopic = {
  id: string;
  label: string;
  teach: string[];
  question: string;
  options: string[];
  correct: number;
  feedbackCorrect: string;
  feedbackWrong: string;
};

export const OPTIONAL_TOPICS: OptionalTopic[] = [
  {
    id: "patrimonio",
    label: "Como conquistar seu primeiro patrimônio",
    teach: [
      "Patrimônio começa pequeno e constante: guardar um pedaço do que entra, antes de gastar o resto. Em Bitcoin, muita gente usa a regra de comprar pouco com frequência (média de preço), em vez de tentar 'acertar o fundo'.",
      "O primeiro patrimônio em sats não precisa ser grande. O que importa é o hábito + segurança: saber onde está a chave, não cair em golpe e não vender tudo no primeiro susto do mercado.",
      "No SatVantage a ideia é educar antes de acelerar. Quando você entende o básico, cada sat que guarda tem mais chance de ficar com você de verdade.",
    ],
    question: "Qual hábito ajuda mais no primeiro patrimônio em Bitcoin?",
    options: [
      "Esperar o preço 'perfeito' para comprar tudo de uma vez",
      "Guardar com frequência, mesmo valores pequenos, e proteger a chave",
      "Seguir tip de desconhecido prometendo lucro garantido",
      "Deixar tudo na corretora para sempre, sem aprender",
    ],
    correct: 1,
    feedbackCorrect: "Isso — constância e custódia consciente.",
    feedbackWrong: "Pense em hábito frequente + segurança da chave.",
  },
  {
    id: "comprar",
    label: "Como comprar bitcoin",
    teach: [
      "O caminho mais comum no Brasil: abrir conta em uma corretora, enviar PIX em reais e comprar bitcoin. É o 'portão de entrada'. Depois, o ideal é aprender a tirar para a sua carteira.",
      "Cuidado com taxas, horários e golpes de 'suporte'. Compre só o que entende. Na rede de teste do SatVantage você treina o vocabulário sem arriscar dinheiro real.",
      "Comprar é só o primeiro passo. Guardar com segurança e não se deixar levar por urgência importa tanto quanto o preço do dia.",
    ],
    question: "Depois de comprar na corretora, o que aumenta sua soberania?",
    options: [
      "Deixar para sempre na corretora e esquecer",
      "Aprender a transferir para uma carteira sob seu controle",
      "Mandar o valor para quem prometeu dobrar",
      "Postar a seed no Instagram para 'backup social'",
    ],
    correct: 1,
    feedbackCorrect: "Exato — corretora compra; carteira própria guarda.",
    feedbackWrong: "Soberania = você com a chave, depois de comprar.",
  },
  {
    id: "geopolitica",
    label: "Geopolítica e por que acompanhar",
    teach: [
      "Bitcoin reage a notícias grandes: juros, guerras, regulamentação, bancos falindo, países adotando ou banindo. Não é mágica — é um ativo global ligado a risco e confiança.",
      "Acompanhar geopolítica não é para 'prever o futuro'. É para entender o clima: por que o preço treme, por que alguém tem pressa em vender, e por que golpes usam manchetes para apressar você.",
      "No SatVantage, a fricção comportamental existe exatamente para quando o mundo grita 'urgente'. A decisão continua sua — só pedimos calma.",
    ],
    question: "Por que faz sentido acompanhar geopolítica se você guarda bitcoin?",
    options: [
      "Porque o Bitcoin só sobe quando há guerra",
      "Para entender o clima de risco e não tomar decisão só no susto",
      "Porque o governo define o preço exato todo dia",
      "Não faz sentido — notícias nunca afetam o mercado",
    ],
    correct: 1,
    feedbackCorrect: "Isso — contexto, não previsões milagrosas.",
    feedbackWrong: "O ponto é clima de risco e decisão com calma.",
  },
  {
    id: "corretora",
    label: "O que é uma corretora",
    teach: [
      "Uma corretora (exchange) é tipo uma loja online de bitcoin: você cria conta, manda reais (PIX) e compra sats. Fácil de começar — mas os bitcoins ficam sob custódia dela, não nas suas chaves.",
      "Isso é útil para comprar e vender. O cuidado: se a corretora travar, for hackeada ou fechar, você depende dela. Por isso muita gente, depois de comprar, transfere para a própria carteira.",
    ],
    question: "Onde ficam seus bitcoins enquanto estão na corretora?",
    options: [
      "Nas suas chaves privadas, no seu celular",
      "Sob custódia da corretora — ela controla as chaves",
      "No banco central, em uma conta especial",
      "Apagados até você sacar em dinheiro",
    ],
    correct: 1,
    feedbackCorrect: "Isso. Na corretora, a custódia é dela.",
    feedbackWrong: "Enquanto está na corretora, a custódia é dela — não suas chaves.",
  },
  {
    id: "transferir",
    label: "Como transferir para a carteira",
    teach: [
      "Depois de comprar na corretora, o passo de soberania é enviar para a sua carteira. Na carteira você gera um endereço (ou invoice Lightning) e cola na corretora em 'sacar' / 'enviar'.",
      "Sempre comece com um valor pequeno de teste. Confira a rede (Bitcoin on-chain vs Lightning) e o endereço com calma — um erro de digitação e o valor pode ir embora.",
    ],
    question: "Qual é o hábito mais seguro ao sacar da corretora para a carteira?",
    options: [
      "Enviar tudo de uma vez no maior valor possível",
      "Mandar primeiro um valor pequeno de teste e conferir se chegou",
      "Pedir para um desconhecido na internet colar o endereço por você",
      "Usar o mesmo endereço que alguém postou no Twitter",
    ],
    correct: 1,
    feedbackCorrect: "Perfeito. Teste pequeno primeiro.",
    feedbackWrong: "Sempre teste com pouco antes de mover o valor grande.",
  },
  {
    id: "fria-quente",
    label: "Carteira quente vs carteira fria",
    teach: [
      "Carteira quente fica ligada à internet — app no celular ou extensão. É prática para o dia a dia e Lightning. O lado frágil: o aparelho pode ser clonado, perdido ou infectado.",
      "Carteira fria fica offline a maior parte do tempo — por exemplo um dispositivo de hardware. Serve melhor para guardar quantias maiores, com menos exposição.",
    ],
    question: "Qual a diferença principal entre carteira quente e fria?",
    options: [
      "Quente é de ouro; fria é de prata",
      "Quente costuma ficar online (dia a dia); fria fica offline (guarda maior)",
      "Fria só funciona em países frios",
      "Não existe diferença — são nomes de marketing",
    ],
    correct: 1,
    feedbackCorrect: "Exato. Online no dia a dia vs offline para guardar.",
    feedbackWrong: "Quente ≈ online/prática; fria ≈ offline/guarda.",
  },
];

/** Sugestões que aparecem no balão do mentor no dashboard */
export const MENTOR_SUGGESTIONS = [
  { id: "patrimonio", label: "Como conquistar seu primeiro patrimônio" },
  { id: "comprar", label: "Como comprar bitcoin" },
  { id: "geopolitica", label: "Geopolítica e por que acompanhar" },
] as const;

export function topicById(id: string): OptionalTopic | undefined {
  return OPTIONAL_TOPICS.find((t) => t.id === id);
}
