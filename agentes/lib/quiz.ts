// Mentoria em chat: explica → pergunta → segue.
// Gabarito só no servidor. Sats: acerto 5 · tentativa errada 3 · pular 0.
// NÃO importar este arquivo em componentes cliente — use @/lib/missions para slugs.

import {
  MISSION_1_SLUG,
  MISSION_2_SLUG,
  isMissionSlug,
  type MissionSlug,
} from "@/lib/missions";

export { MISSION_1_SLUG, MISSION_2_SLUG, isMissionSlug, type MissionSlug };

export const SATS_CORRECT = 5;
export const SATS_TRIED = 3;
export const SATS_SKIP = 0;

interface QuizQuestion {
  id: string;
  /** Texto curto que o mentor fala antes da pergunta */
  teach: string;
  question: string;
  options: string[];
  correct: number;
  feedbackCorrect: string;
  feedbackWrong: string;
}

export const MISSION_1_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    teach:
      "Bitcoin é dinheiro digital que funciona sem banco no meio. Ninguém 'imprime' do nada: as regras são públicas e qualquer um pode verificar.",
    question: "O que é o Bitcoin?",
    options: [
      "Uma empresa de tecnologia com sede nos Estados Unidos",
      "Um dinheiro digital que funciona sem depender de bancos ou governos",
      "Um aplicativo de investimentos criado por uma corretora",
      "Uma moeda física de colecionador banhada a ouro",
    ],
      correct: 1,
    feedbackCorrect: "Isso — soberania sem pedir licença a um banco.",
    feedbackWrong: "Quase. Pense em dinheiro digital sem intermediário obrigatório.",
  },
  {
    id: "q2",
    teach:
      "Sua chave privada é o segredo que prova que os bitcoins são seus. Quem tem a chave, controla o dinheiro. Por isso nunca compartilhe.",
    question: "O que é uma chave privada?",
    options: [
      "A senha do aplicativo da corretora",
      "Um código que a empresa guarda para você recuperar a conta",
      "O segredo que prova que os bitcoins são seus — quem tem a chave, tem os bitcoins",
      "O número da sua carteira, que você compartilha para receber pagamentos",
    ],
    correct: 2,
    feedbackCorrect: "Exato. A chave é a posse.",
    feedbackWrong: "A chave privada não é para compartilhar — ela é o controle.",
  },
  {
    id: "q3",
    teach:
      "Golpes adoram pressa e 'dinheiro fácil'. Se alguém promete dobrar seus bitcoins, desconfie: é o golpe mais clássico do ecossistema.",
    question:
      "Você recebe uma mensagem: 'Dobre seus bitcoins! Envie 0,01 BTC e receba 0,02 de volta'. O que fazer?",
    options: [
      "Enviar um valor pequeno primeiro, para testar se é verdade",
      "Ignorar e denunciar: promessa de multiplicar dinheiro é o golpe mais clássico que existe",
      "Verificar se o site tem cadeado de segurança e, se tiver, enviar",
      "Enviar apenas se a mensagem vier de um perfil verificado",
    ],
    correct: 1,
    feedbackCorrect: "Perfeito. Promessa de multiplicar = bandeira vermelha.",
    feedbackWrong: "Nunca envie para 'dobrar'. Isso é golpe clássico.",
  },
  {
    id: "q4",
    teach:
      "Autocustódia é você guardar a própria chave — sem depender da corretora. Mais responsabilidade, mais liberdade.",
    question: "O que significa 'autocustódia'?",
    options: [
      "Deixar os bitcoins guardados na corretora, que cuida de tudo",
      "Guardar você mesmo a chave dos seus bitcoins, sem depender de empresas",
      "Contratar um cofre físico em um banco para guardar as moedas",
      "Imprimir os bitcoins em papel e guardar em casa",
    ],
    correct: 1,
    feedbackCorrect: "Isso. Você no controle da chave.",
    feedbackWrong: "Autocustódia = você com a chave, não a corretora.",
  },
  {
    id: "q5",
    teach:
      "Um bitcoin se divide em satoshis — a menor unidade. É assim que dá para aprender e ganhar valores pequenos sem precisar de um bitcoin inteiro.",
    question: "O que é um satoshi?",
    options: [
      "A menor fração do bitcoin — cada bitcoin tem 100 milhões de satoshis",
      "Uma criptomoeda concorrente do Bitcoin",
      "A taxa cobrada pelas corretoras em cada compra",
      "O nome do banco central que emite os bitcoins",
    ],
    correct: 0,
    feedbackCorrect: "Mandou bem. Sats são os 'centavos' do Bitcoin.",
    feedbackWrong: "Satoshi é a menor fração do bitcoin.",
  },
];

/** Mentoria 2: carteira + Lightning — para quem ainda não sabe nada disso. */
export const MISSION_2_QUESTIONS: QuizQuestion[] = [
  {
    id: "w1",
    teach:
      "Uma carteira de Bitcoin não guarda 'moedas' como uma carteira de couro. Ela guarda as chaves que controlam seus bitcoins na rede. Sem a chave, ninguém move o seu dinheiro — nem a gente.",
    question: "O que uma carteira de Bitcoin guarda de verdade?",
    options: [
      "As moedas físicas de bitcoin que você comprou",
      "As chaves que controlam seus bitcoins na rede",
      "O extrato do seu banco, só que em dólares",
      "Um cadastro da Receita Federal com seu CPF",
    ],
    correct: 1,
    feedbackCorrect: "Isso. A carteira é o controle das chaves.",
    feedbackWrong: "A carteira guarda as chaves — não moedinhas físicas.",
  },
  {
    id: "w2",
    teach:
      "Quando você cria uma carteira, aparece uma frase de recuperação (seed) — várias palavras. É o backup mestre. Quem tem essa frase pode recriar a carteira. Nunca fotografe, nunca mande no WhatsApp, nunca digite em site estranho.",
    question: "O que fazer com a frase de recuperação (seed) da carteira?",
    options: [
      "Mandar no WhatsApp para um amigo 'de confiança' guardar",
      "Fotografar e salvar na nuvem do celular, para não perder",
      "Anotar offline em lugar seguro e nunca compartilhar com ninguém",
      "Colar no Instagram Stories para lembrar depois",
    ],
    correct: 2,
    feedbackCorrect: "Perfeito. Offline, seguro, só você.",
    feedbackWrong: "Seed nunca vai para chat, foto ou nuvem — é o backup mestre.",
  },
  {
    id: "w3",
    teach:
      "A rede Lightning é uma 'camada' em cima do Bitcoin para pagar rápido e barato — tipo pix, mas em sats. Ideal para o dia a dia. Os sats que você ganha aqui podem ir para uma carteira Lightning quando você estiver pronto.",
    question: "Para que serve a Lightning Network?",
    options: [
      "Substituir o Bitcoin por outra moeda",
      "Pagar com sats de forma rápida e com taxas baixas",
      "Esconder transações do governo automaticamente",
      "Imprimir bitcoins novos mais depressa",
    ],
    correct: 1,
    feedbackCorrect: "Exato — velocidade e taxas baixas no dia a dia.",
    feedbackWrong: "Lightning = pagamentos rápidos e baratos em sats.",
  },
  {
    id: "w4",
    teach:
      "Para receber sats na Lightning, sua carteira gera uma cobrança (invoice) — um código longo que começa com letras. Quem vai te pagar cola esse código e a rede envia. Você não precisa 'saber o endereço' de memória.",
    question: "Como você recebe um pagamento Lightning?",
    options: [
      "Pedindo o CPF de quem vai pagar",
      "Gerando uma cobrança (invoice) na sua carteira e passando para quem paga",
      "Ligando para a corretora e pedindo um TED",
      "Enviando sua senha da SatVantage para a outra pessoa",
    ],
    correct: 1,
    feedbackCorrect: "Isso. Invoice = cobrança gerada pela carteira.",
    feedbackWrong: "Quem recebe gera a cobrança; quem paga cola o código.",
  },
  {
    id: "w5",
    teach:
      "Aqui no SatVantage estamos em rede de teste (MutinyNet). Os sats de aprendizado não são dinheiro de verdade — dá para errar, treinar e entender sem medo. Quando for pra vida real, aí sim o cuidado com seed e carteira vale ouro.",
    question: "Por que usamos rede de teste nesta plataforma?",
    options: [
      "Porque a Lightning não funciona no Brasil",
      "Para você aprender e treinar sem arriscar dinheiro de verdade",
      "Porque sats de teste valem mais que bitcoin real",
      "Para o governo acompanhar cada clique",
    ],
    correct: 1,
    feedbackCorrect: "Mandou bem. Aqui é laboratório seguro.",
    feedbackWrong: "Rede de teste = aprender sem risco de dinheiro real.",
  },
];

const BY_SLUG: Record<MissionSlug, QuizQuestion[]> = {
  [MISSION_1_SLUG]: MISSION_1_QUESTIONS,
  [MISSION_2_SLUG]: MISSION_2_QUESTIONS,
};

export function questionsFor(slug: MissionSlug): QuizQuestion[] {
  return BY_SLUG[slug];
}

/** Conteúdo seguro para o cliente (sem gabarito). */
export function lessonsForClient(slug: MissionSlug) {
  return questionsFor(slug).map(({ id, teach, question, options }) => ({
    id,
    teach,
    question,
    options,
  }));
}

export type MentorResponse = {
  answer: number | null;
  skipped: boolean;
};

export type GradeDetail = {
  id: string;
  skipped: boolean;
  correct: boolean | null;
  sats: number;
};

/** Calcula sats por resposta. Não exige nota mínima. */
export function gradeMentor(
  slug: MissionSlug,
  responses: MentorResponse[],
): {
  details: GradeDetail[];
  satsEarned: number;
  correctCount: number;
  triedCount: number;
  skippedCount: number;
} {
  const questions = questionsFor(slug);
  const details: GradeDetail[] = questions.map((q, i) => {
    const r = responses[i] ?? { answer: null, skipped: true };
    if (r.skipped || r.answer === null) {
      return { id: q.id, skipped: true, correct: null, sats: SATS_SKIP };
    }
    const correct = r.answer === q.correct;
    return {
      id: q.id,
      skipped: false,
      correct,
      sats: correct ? SATS_CORRECT : SATS_TRIED,
    };
  });

  return {
    details,
    satsEarned: details.reduce((sum, d) => sum + d.sats, 0),
    correctCount: details.filter((d) => d.correct === true).length,
    triedCount: details.filter((d) => !d.skipped).length,
    skippedCount: details.filter((d) => d.skipped).length,
  };
}
