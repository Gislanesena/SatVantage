// Mentoria em chat: explica → pergunta → segue.
// Gabarito só no servidor. Sats: acerto 5 · tentativa errada 3 · pular 0.
// NÃO importar este arquivo em componentes cliente — use @/lib/missions para slugs.

import {
  MISSION_1_SLUG,
  MISSION_2_SLUG,
  isMissionSlug,
  type MissionSlug,
} from "@/lib/missions";
import { QUIZ_I18N, type QuizLocale } from "@/lib/quiz-i18n";

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

/** Mentoria 1 — Primeiros Passos no Bitcoin (4 perguntas). */
export const MISSION_1_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    teach:
      "Bitcoin é dinheiro digital que não depende de bancos nem de governos para existir. Funciona numa rede mundial: as regras são públicas e qualquer pessoa pode conferir. É a forma mais autêntica de moeda fora do sistema tradicional — você não precisa pedir permissão para usar.",
    question: "O que descreve melhor o Bitcoin?",
    options: [
      "Um aplicativo de banco que só funciona no Brasil",
      "Dinheiro digital numa rede mundial, sem depender de bancos ou governos",
      "Uma ação de empresa de tecnologia cotada na bolsa",
      "Um cartão de crédito internacional com cashback em ouro",
    ],
    correct: 1,
    feedbackCorrect: "Isso — dinheiro digital com regras públicas, sem intermediário obrigatório.",
    feedbackWrong: "Pense em dinheiro digital global, sem banco no meio do caminho.",
  },
  {
    id: "q2",
    teach:
      "Os golpes mais comuns hoje prometem 'dobrar seu dinheiro', vendem pirâmides disfarçadas de investimento, ou fingem ser suporte pedindo sua chave ou frase seed. Também usam urgência artificial: 'faça agora ou perde'. Proteção simples: desconfie de promessa fácil, nunca compartilhe seed/chave e respire antes de clicar.",
    question:
      "Alguém no chat diz: 'Sou do suporte — me manda sua frase seed agora ou sua conta será bloqueada'. O que fazer?",
    options: [
      "Enviar a seed só se o perfil tiver foto profissional",
      "Enviar um pedaço da seed para 'provar' que é você",
      "Não enviar nada: suporte legítimo nunca pede seed ou chave privada",
      "Pedir o CPF do suporte e, se bater, enviar a seed",
    ],
    correct: 2,
    feedbackCorrect: "Perfeito. Seed e chave privada nunca vão para chat, e-mail ou 'suporte'.",
    feedbackWrong: "Urgência + pedido de seed = golpe. Não envie nunca.",
  },
  {
    id: "q3",
    teach:
      "Uma carteira de Bitcoin não guarda 'moedinhas' como uma carteira de couro. Ela guarda o acesso — as chaves — aos seus bitcoins na rede. Em corretora (custodial), a empresa segura as chaves por você. Na carteira própria, você controla. Abrir uma carteira própria costuma ser: baixar um app confiável, anotar a frase de recuperação offline e nunca compartilhá-la.",
    question: "O que uma carteira de Bitcoin faz de verdade?",
    options: [
      "Guarda moedas físicas de bitcoin num cofre digital",
      "Guarda o acesso (as chaves) aos seus bitcoins na rede",
      "Imprime bitcoins novos toda vez que você abre o app",
      "Substitui o CPF e o banco na Receita Federal",
    ],
    correct: 1,
    feedbackCorrect: "Exato — a carteira é o controle do acesso, não um bauzinho de moedas.",
    feedbackWrong: "A carteira guarda as chaves de acesso — não moedas físicas.",
  },
  {
    id: "q4",
    teach:
      "No Brasil, Bitcoin entra na conversa do Imposto de Renda. Em geral, você declara a posse e os ganhos quando vende ou troca. Há uma ideia prática importante: vendas mensais abaixo de um limite de isenção (valor em reais) podem não gerar imposto sobre o ganho naquele mês — mas a regra muda com o tempo e vale conferir a orientação oficial ou um contador. O ponto: não ignore; organize e declare quando for o caso.",
    question: "Sobre imposto e Bitcoin no Brasil, qual afirmação faz mais sentido?",
    options: [
      "Bitcoin nunca precisa ser declarado, em nenhuma situação",
      "Só declara quem tem mais de 1 bitcoin inteiro",
      "Em geral declara-se posse/ganhos nas vendas; há isenção mensal de vendas até um limite — confira a regra vigente",
      "Imposto só existe se você usar Lightning Network",
    ],
    correct: 2,
    feedbackCorrect: "Isso — organize e declare quando houver posse ou ganho; a isenção mensal tem limite.",
    feedbackWrong: "Bitcoin pode precisar de declaração; a isenção de vendas é mensal e tem teto.",
  },
];

/** Mentoria 2 — Corretoras e Lightning (4 perguntas). */
export const MISSION_2_QUESTIONS: QuizQuestion[] = [
  {
    id: "w1",
    teach:
      "Corretoras são a ponte entre reais (ou outra moeda) e Bitcoin: você deposita dinheiro, compra BTC e pode sacar para uma carteira. No Brasil há várias conhecidas — Mercado Bitcoin, Foxbit, NovaDAX, Binance e outras. Nenhuma é 'a oficial'; o importante é entender o papel delas e os riscos de deixar tudo na corretora.",
    question: "Qual é o papel principal de uma corretora de Bitcoin?",
    options: [
      "Emitir bitcoins novos como um banco central",
      "Servir de ponte entre reais (ou outra moeda) e Bitcoin",
      "Guardar obrigatoriamente a seed de todo mundo",
      "Substituir a Lightning Network no mundo todo",
    ],
    correct: 1,
    feedbackCorrect: "Isso — corretora conecta o dinheiro do dia a dia ao Bitcoin.",
    feedbackWrong: "A corretora é a ponte entre reais e Bitcoin — não emite moeda nova.",
  },
  {
    id: "w2",
    teach:
      "A Lightning Network é a 'via expressa' do Bitcoin: uma camada feita para pagamentos instantâneos e baratos, ideal no dia a dia. Em vez de cada cafezinho ir direto na blockchain principal (mais lenta e cara), a Lightning move sats rápido. Na prática você usa uma carteira Lightning, gera ou cola uma cobrança (invoice) e o pagamento chega em segundos.",
    question: "O que melhor descreve a Lightning Network?",
    options: [
      "Uma corretora brasileira obrigatória para comprar Bitcoin",
      "A via expressa do Bitcoin: pagamentos rápidos e com taxas baixas",
      "Um imposto especial cobrado pela Receita sobre cada sat",
      "Um tipo de carteira fria que nunca se conecta à internet",
    ],
    correct: 1,
    feedbackCorrect: "Exato — Lightning = velocidade e custo baixo no uso diário.",
    feedbackWrong: "Lightning é a camada rápida e barata por cima do Bitcoin.",
  },
  {
    id: "w3",
    teach:
      "Comprar Bitcoin numa corretora é só o primeiro passo. Se o dinheiro ficar sempre lá, você depende da empresa (custódia dela). Autocustódia é sacar para uma carteira em que você controla as chaves. Caminho clássico: comprar → transferir para carteira própria → guardar a seed com cuidado. Assim o Bitcoin é realmente seu.",
    question: "Por que sacar Bitcoin da corretora para uma carteira própria?",
    options: [
      "Porque a corretora apaga o saldo todo mês automaticamente",
      "Para ter autocustódia: você controla as chaves, sem depender da empresa",
      "Porque Bitcoin só existe dentro de carteiras frias de fábrica",
      "Para pagar menos imposto — a Receita não vê carteira própria",
    ],
    correct: 1,
    feedbackCorrect: "Isso — comprar é o começo; autocustódia é você com as chaves.",
    feedbackWrong: "Sacar para carteira própria = você no controle, não a corretora.",
  },
  {
    id: "w4",
    teach:
      "Carteira fria (cold wallet) fica offline — sem conexão constante à internet. Serve para guardar por longo prazo com menos exposição a vírus e invasões online. Carteiras quentes (no celular/computador ligados) são práticas no dia a dia; o frio é o cofre. Muita gente usa os dois: pouco no dia a dia, o restante no frio.",
    question: "O que é uma carteira fria (cold wallet)?",
    options: [
      "Uma carteira que só funciona abaixo de 10 °C",
      "Uma carteira offline, sem conexão à internet, mais segura para guardar a longo prazo",
      "A conta da corretora quando você ativa o modo noturno",
      "Qualquer carteira Lightning usada para pagar café",
    ],
    correct: 1,
    feedbackCorrect: "Perfeito — frio = offline, pensado para guardar com mais segurança.",
    feedbackWrong: "Cold wallet = offline, para custódia de longo prazo.",
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
export function lessonsForClient(slug: MissionSlug, locale: QuizLocale = "pt") {
  return questionsFor(slug).map((q) => {
    const pack = locale === "pt" ? null : QUIZ_I18N[locale]?.[q.id];
    return {
      id: q.id,
      teach: pack?.teach ?? q.teach,
      question: pack?.question ?? q.question,
      options: pack?.options ?? q.options,
    };
  });
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
