// Mentoria em chat: explica → pergunta → segue.
// Gabarito só no servidor. Sats: acerto 5 · tentativa errada 3 · pular 0.
// NÃO importar este arquivo em componentes cliente — use @/lib/missions para slugs.

import {
  MISSION_1_SLUG,
  MISSION_2_SLUG,
  isMissionSlug,
  type MissionSlug,
} from "@/lib/missions";
import {
  QUIZ_I18N,
  normalizeQuizLocale,
  type QuizLocale,
} from "@/lib/quiz-i18n";

export { MISSION_1_SLUG, MISSION_2_SLUG, isMissionSlug, type MissionSlug };
export type { QuizLocale };

export const SATS_CORRECT = 5;
export const SATS_TRIED = 3;
export const SATS_SKIP = 0;

/** Quantas etapas o Teste de conhecimento apresenta por mentoria. */
export const MENTORSHIP_LESSON_COUNT = 4;

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

/** Mentoria 1 — Primeiros passos no Bitcoin (4 etapas). */
export const MISSION_1_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    teach:
      "Bitcoin é dinheiro digital que funciona numa rede mundial — sem depender de bancos ou governos no meio. As regras são públicas e qualquer um pode verificar. A ideia central: você pode guardar e enviar valor sem pedir licença a uma instituição.",
    question: "O que é o Bitcoin, na essência?",
    options: [
      "Uma empresa de tecnologia com sede nos Estados Unidos",
      "Dinheiro digital numa rede mundial, sem depender de bancos ou governos",
      "Um aplicativo de investimentos criado por uma corretora",
      "Uma moeda física de colecionador banhada a ouro",
    ],
    correct: 1,
    feedbackCorrect: "Isso — rede aberta, sem intermediário obrigatório.",
    feedbackWrong: "Pense em dinheiro digital global, sem banco no meio.",
  },
  {
    id: "q2",
    teach:
      "Golpes em Bitcoin adoram pressa e promessa fácil: 'dobrar' seu dinheiro, pirâmide disfarçada de investimento, falso suporte pedindo chave ou seed, urgência artificial. Se alguém pede segredo da carteira ou garante lucro rápido, desconfie e pare.",
    question:
      "Alguém manda: 'Dobre seus bitcoins! Envie um pouco e receba o dobro'. O que fazer?",
    options: [
      "Enviar um valor pequeno primeiro, para testar se é verdade",
      "Ignorar: promessa de multiplicar dinheiro é golpe clássico",
      "Verificar se o site tem cadeado e, se tiver, enviar",
      "Enviar só se o perfil parecer verificado nas redes",
    ],
    correct: 1,
    feedbackCorrect: "Perfeito. Promessa de multiplicar = bandeira vermelha.",
    feedbackWrong: "Nunca envie para 'dobrar'. Isso é golpe clássico.",
  },
  {
    id: "q3",
    teach:
      "Uma carteira de Bitcoin não guarda 'moedinhas': ela guarda as chaves que controlam seus bitcoins na rede. Na corretora (custodial) a empresa segura por você; na carteira própria (autocustódia) você controla a chave. Abrir uma carteira própria costuma ser instalar o app, anotar a frase de recuperação offline e nunca compartilhá-la.",
    question: "Qual é a diferença central entre carteira na corretora e carteira própria?",
    options: [
      "Na corretora o bitcoin é físico; na própria é só número",
      "Na corretora a empresa guarda as chaves; na própria você controla as chaves",
      "Carteira própria só funciona fora do Brasil",
      "Não há diferença — os dois nomes são a mesma coisa",
    ],
    correct: 1,
    feedbackCorrect: "Exato — custodial vs autocustódia é quem tem a chave.",
    feedbackWrong: "O ponto é: quem controla a chave, controla o bitcoin.",
  },
  {
    id: "q4",
    teach:
      "No Brasil, Bitcoin entra na declaração de imposto quando você tem a obrigação de informar patrimônio ou quando vende e há ganho. Em linhas gerais, vendas mensais pequenas podem cair em faixa de isenção — mas regras mudam e o detalhe técnico fica com contador. A ideia aqui: aprender que existe regra fiscal; não ignore o tema.",
    question: "Sobre imposto e Bitcoin no Brasil, o que faz mais sentido?",
    options: [
      "Bitcoin nunca precisa ser declarado em nenhuma situação",
      "Pode haver obrigação de declarar e regras de isenção em vendas — vale se informar (e, se preciso, um contador)",
      "Só quem tem corretora americana precisa declarar",
      "Imposto só existe se você minerar bitcoin em casa",
    ],
    correct: 1,
    feedbackCorrect: "Isso — existe marco fiscal; informe-se sem pânico.",
    feedbackWrong: "Não é 'nunca declara': há regras e isenções a conhecer.",
  },
];

/** Mentoria 2 — Corretoras e Lightning (4 etapas). */
export const MISSION_2_QUESTIONS: QuizQuestion[] = [
  {
    id: "w1",
    teach:
      "Corretoras (exchanges) são a ponte entre reais e Bitcoin: você deposita em R$, compra BTC e pode sacar para uma carteira. No Brasil há várias conhecidas no mercado — o importante é entender o papel delas (custódia e liquidez), não fazer propaganda de nenhuma marca específica.",
    question: "Qual é o papel principal de uma corretora de Bitcoin?",
    options: [
      "Substituir o Bitcoin por outra moeda oficial",
      "Servir de ponte entre reais e Bitcoin (comprar, vender, liquidez)",
      "Guardar sua seed automaticamente com segurança total",
      "Emitir bitcoins novos como um banco central",
    ],
    correct: 1,
    feedbackCorrect: "Isso — corretora = ponte entre real e BTC.",
    feedbackWrong: "Pense em comprar/vender com liquidez, não em emitir moeda.",
  },
  {
    id: "w2",
    teach:
      "Lightning Network é uma 'via expressa' em cima do Bitcoin: pagamentos quase instantâneos e com taxas baixas — ideal para o dia a dia. Você usa carteiras compatíveis, gera ou cola uma cobrança (invoice) e a rede move os sats rápido.",
    question: "Para que serve a Lightning Network?",
    options: [
      "Substituir o Bitcoin por outra moeda",
      "Pagar com sats de forma rápida e com taxas baixas",
      "Esconder automaticamente todas as transações do governo",
      "Imprimir bitcoins novos mais depressa",
    ],
    correct: 1,
    feedbackCorrect: "Exato — velocidade e taxas baixas no dia a dia.",
    feedbackWrong: "Lightning = pagamentos rápidos e baratos em sats.",
  },
  {
    id: "w3",
    teach:
      "O caminho clássico: comprar Bitcoin na corretora e, quando fizer sentido, sacar para uma carteira de autocustódia. Na corretora você depende da empresa; na carteira própria você controla a chave. 'Não suas chaves, não suas moedas' — por isso a autocustódia importa para quem quer soberania.",
    question: "Por que sacar da corretora para uma carteira própria?",
    options: [
      "Porque a corretora não consegue guardar bitcoin",
      "Para você controlar as chaves — menos dependência da empresa",
      "Porque carteira própria rende juros automaticamente",
      "Só para pagar menos imposto na hora",
    ],
    correct: 1,
    feedbackCorrect: "Isso — autocustódia = você no controle da chave.",
    feedbackWrong: "O motivo central é controle das chaves, não juros ou imposto.",
  },
  {
    id: "w4",
    teach:
      "Carteira fria (cold wallet) fica offline — hardware wallet ou setup desconectado da internet. Serve para guardar por longo prazo com menos exposição a vírus e golpes online. O dia a dia (gastar pouco) pode ficar numa carteira quente; o estoque maior, no frio.",
    question: "O que caracteriza uma carteira fria?",
    options: [
      "Uma carteira só para moedas de países frios",
      "Uma carteira offline, mais segura para guardar a longo prazo",
      "Qualquer carteira dentro de uma corretora",
      "Uma carteira que congela o saldo por 30 dias",
    ],
    correct: 1,
    feedbackCorrect: "Perfeito — offline e pensada para o longo prazo.",
    feedbackWrong: "Fria = offline / menos exposição à internet.",
  },
];

const BY_SLUG: Record<MissionSlug, QuizQuestion[]> = {
  [MISSION_1_SLUG]: MISSION_1_QUESTIONS,
  [MISSION_2_SLUG]: MISSION_2_QUESTIONS,
};

export function questionsFor(slug: MissionSlug): QuizQuestion[] {
  return BY_SLUG[slug];
}

function localizeQuestion(q: QuizQuestion, locale: QuizLocale): QuizQuestion {
  if (locale === "pt") return q;
  const pack = QUIZ_I18N[q.id]?.[locale];
  if (!pack) return q;
  return {
    ...q,
    teach: pack.teach,
    question: pack.question,
    options: [...pack.options],
    feedbackCorrect: pack.feedbackCorrect,
    feedbackWrong: pack.feedbackWrong,
  };
}

/** Conteúdo seguro para o cliente (sem gabarito). 4 etapas por mentoria. */
export function lessonsForClient(slug: MissionSlug, locale: QuizLocale | string = "pt") {
  const lang = normalizeQuizLocale(locale);
  return questionsFor(slug)
    .slice(0, MENTORSHIP_LESSON_COUNT)
    .map((q) => localizeQuestion(q, lang))
    .map(({ id, teach, question, options }) => ({
      id,
      teach,
      question,
      options,
    }));
}

/** Feedback localizado para check/submit (mantém índice correto). */
export function localizedQuestion(
  slug: MissionSlug,
  questionId: string,
  locale: QuizLocale | string = "pt",
): QuizQuestion | null {
  const lang = normalizeQuizLocale(locale);
  const q = questionsFor(slug).find((item) => item.id === questionId);
  if (!q) return null;
  return localizeQuestion(q, lang);
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
