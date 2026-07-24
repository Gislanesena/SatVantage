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
  {
    id: "q5",
    teach:
      "A frase de recuperação (seed) costuma ter 12 ou 24 palavras. Quem tem a seed controla os fundos — mesmo sem o celular. Por isso ela fica offline, longe de foto, nuvem e 'suporte'.",
    question: "O que acontece se outra pessoa tiver a sua seed phrase?",
    options: [
      "Nada: a seed só serve para lembrar o nome do app",
      "Essa pessoa pode controlar os bitcoins da carteira",
      "O banco bloqueia a conta automaticamente",
      "Só dá para ver o saldo, nunca enviar",
    ],
    correct: 1,
    feedbackCorrect: "Exato — seed = controle total dos fundos.",
    feedbackWrong: "Quem tem a seed controla o bitcoin da carteira.",
  },
  {
    id: "q6",
    teach:
      "Um satoshi (sat) é a menor unidade prática do Bitcoin: 1 BTC = 100.000.000 sats. No dia a dia e em Lightning, a gente fala em sats com frequência.",
    question: "Quantos sats equivalem a 1 bitcoin?",
    options: [
      "1.000",
      "100.000.000",
      "21.000.000",
      "1.000.000",
    ],
    correct: 1,
    feedbackCorrect: "Isso — 100 milhões de sats = 1 BTC.",
    feedbackWrong: "1 BTC = 100.000.000 sats.",
  },
  {
    id: "q7",
    teach:
      "Antes de enviar um valor grande, o hábito seguro é testar com pouco: confira rede (on-chain vs Lightning), endereço/invoice e se o valor chegou. Erro de digitação pode ser irreversível.",
    question: "Qual hábito reduz risco ao enviar bitcoin?",
    options: [
      "Enviar tudo de uma vez para 'não esquecer'",
      "Mandar um valor pequeno de teste e conferir se chegou",
      "Pedir a senha da carteira para um amigo confirmar",
      "Usar qualquer QR sem ler o valor",
    ],
    correct: 1,
    feedbackCorrect: "Perfeito — teste pequeno primeiro.",
    feedbackWrong: "Sempre teste com pouco antes do valor grande.",
  },
  {
    id: "q8",
    teach:
      "Phishing e falso suporte pedem seed, código 2FA ou 'atualização urgente' da carteira. O SatVantage e carteiras sérias nunca pedem sua seed. Pressão + urgência = pare.",
    question: "Se um 'suporte' pedir sua seed por chat, o que fazer?",
    options: [
      "Enviar só as 3 primeiras palavras",
      "Não enviar: é golpe — suporte legítimo não pede seed",
      "Enviar se o perfil tiver muitos seguidores",
      "Tirar foto da seed e mandar por e-mail criptografado",
    ],
    correct: 1,
    feedbackCorrect: "Isso — ninguém de suporte precisa da sua seed.",
    feedbackWrong: "Nunca compartilhe a seed. É golpe clássico.",
  },
  {
    id: "q9",
    teach:
      "Mempool e taxa (fee): quando a rede está congestionada, transações on-chain podem demorar se a taxa for baixa. Esperar ou aumentar a taxa (quando possível) faz parte do jogo — paciência ajuda.",
    question: "Por que uma transferência on-chain pode demorar?",
    options: [
      "Porque o Bitcoin 'fecha' à noite",
      "Porque a rede pode estar congestionada e a taxa escolhida ser baixa",
      "Porque sats não existem em dias úteis",
      "Porque só mineradores brasileiros confirmam blocos",
    ],
    correct: 1,
    feedbackCorrect: "Exato — congestão + fee influenciam o tempo.",
    feedbackWrong: "Pense em mempool, taxa e confirmação na rede.",
  },
  {
    id: "q10",
    teach:
      "Autocustódia significa que você controla as chaves. Isso traz soberania e também responsabilidade: backup da seed, dispositivo seguro e cuidado com golpes. Não é 'mais difícil' — é outro modelo mental.",
    question: "O que é autocustódia?",
    options: [
      "Deixar o banco guardar seu bitcoin",
      "Você controlar as chaves da sua carteira",
      "Um tipo de imposto sobre cripto",
      "Um app que investe automaticamente por você",
    ],
    correct: 1,
    feedbackCorrect: "Isso — suas chaves, suas moedas.",
    feedbackWrong: "Autocustódia = você no controle das chaves.",
  },
  {
    id: "q11",
    teach:
      "Endereços Bitcoin e invoices Lightning são diferentes. Colar um no lugar do outro (ou na rede errada) pode fazer o valor não chegar. Conferir o formato e a rede antes de confirmar é básico de segurança.",
    question: "Antes de pagar, o que conferir com mais cuidado?",
    options: [
      "Só a cor do QR code",
      "Se o destino (endereço/invoice) e a rede estão corretos",
      "Se o site tem anúncio de desconto",
      "Se a Lua está em crescente",
    ],
    correct: 1,
    feedbackCorrect: "Perfeito — destino e rede certos.",
    feedbackWrong: "Confira endereço/invoice e a rede (on-chain vs Lightning).",
  },
  {
    id: "q12",
    teach:
      "Volatilidade: o preço do Bitcoin sobe e desce. Educação e reserva de emergência em moeda local importam tanto quanto 'comprar na emoção'. Aprendizado primeiro reduz decisão impulsiva.",
    question: "Qual postura combina melhor com aprendizado em Bitcoin?",
    options: [
      "Endividar-se para comprar o máximo hoje",
      "Estudar, ir com calma e não arriscar o que não pode perder",
      "Ignorar segurança porque 'sempre sobe'",
      "Compartilhar a seed com a família no grupo do WhatsApp",
    ],
    correct: 1,
    feedbackCorrect: "Isso — calma, estudo e risco consciente.",
    feedbackWrong: "Priorize aprender e só arrisque o que pode perder.",
  },
];

/** Mentoria 2 — Corretoras e Lightning (banco ampliado). */
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
