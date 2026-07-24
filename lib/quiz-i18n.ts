/**
 * Traduções EN/ES das perguntas do quiz (PT fica em quiz.ts).
 * Índices de `options` e `correct` permanecem iguais em todos os idiomas.
 */
export type QuizLocale = "pt" | "en" | "es";

export type QuizTextPack = {
  teach: string;
  question: string;
  options: [string, string, string, string];
  feedbackCorrect: string;
  feedbackWrong: string;
};

export const QUIZ_I18N: Record<
  string,
  Partial<Record<"en" | "es", QuizTextPack>>
> = {
  q1: {
    en: {
      teach:
        "Bitcoin is digital money on a worldwide network — without depending on banks or governments in the middle. The rules are public and anyone can verify them. The core idea: you can hold and send value without asking an institution for permission.",
      question: "What is Bitcoin, at its core?",
      options: [
        "A technology company headquartered in the United States",
        "Digital money on a worldwide network, without depending on banks or governments",
        "An investment app created by an exchange",
        "A physical collector coin plated in gold",
      ],
      feedbackCorrect: "That's it — an open network, no mandatory middleman.",
      feedbackWrong: "Think global digital money, without a bank in the middle.",
    },
    es: {
      teach:
        "Bitcoin es dinero digital en una red mundial — sin depender de bancos o gobiernos en el medio. Las reglas son públicas y cualquiera puede verificarlas. La idea central: puedes guardar y enviar valor sin pedir permiso a una institución.",
      question: "¿Qué es Bitcoin, en esencia?",
      options: [
        "Una empresa de tecnología con sede en Estados Unidos",
        "Dinero digital en una red mundial, sin depender de bancos o gobiernos",
        "Una app de inversiones creada por un exchange",
        "Una moneda física de coleccionista bañada en oro",
      ],
      feedbackCorrect: "Eso — red abierta, sin intermediario obligatorio.",
      feedbackWrong: "Piensa en dinero digital global, sin banco en el medio.",
    },
  },
  q2: {
    en: {
      teach:
        "Bitcoin scams love urgency and easy promises: 'double' your money, pyramids dressed as investments, fake support asking for your key or seed, artificial urgency. If someone asks for wallet secrets or guarantees quick profit, stop and walk away.",
      question:
        "Someone messages: 'Double your bitcoin! Send a little and get twice back.' What should you do?",
      options: [
        "Send a small amount first to test if it's true",
        "Ignore it: promises to multiply money are a classic scam",
        "Check for a padlock on the site and, if it has one, send",
        "Send only if the profile looks verified on social media",
      ],
      feedbackCorrect: "Perfect. Promise to multiply = red flag.",
      feedbackWrong: "Never send to 'double' funds. Classic scam.",
    },
    es: {
      teach:
        "Las estafas con Bitcoin adoran la prisa y la promesa fácil: 'duplicar' tu dinero, pirámides disfrazadas de inversión, falso soporte pidiendo clave o seed, urgencia artificial. Si alguien pide el secreto de la cartera o garantiza ganancia rápida, desconfía y para.",
      question:
        "Alguien escribe: '¡Duplica tus bitcoins! Envía un poco y recibe el doble'. ¿Qué hacer?",
      options: [
        "Enviar un valor pequeño primero, para probar si es verdad",
        "Ignorar: la promesa de multiplicar dinero es estafa clásica",
        "Verificar si el sitio tiene candado y, si lo tiene, enviar",
        "Enviar solo si el perfil parece verificado en redes",
      ],
      feedbackCorrect: "Perfecto. Promesa de multiplicar = bandera roja.",
      feedbackWrong: "Nunca envíes para 'duplicar'. Es estafa clásica.",
    },
  },
  q3: {
    en: {
      teach:
        "A Bitcoin wallet doesn't store 'coins': it stores the keys that control your bitcoin on the network. At an exchange (custodial) the company holds them for you; with your own wallet (self-custody) you control the key. Opening your own wallet usually means installing the app, writing the recovery phrase offline, and never sharing it.",
      question: "What is the key difference between an exchange wallet and your own wallet?",
      options: [
        "At the exchange bitcoin is physical; in your own wallet it's only a number",
        "At the exchange the company holds the keys; in your own wallet you control the keys",
        "Your own wallet only works outside Brazil",
        "There is no difference — both names mean the same thing",
      ],
      feedbackCorrect: "Exactly — custodial vs self-custody is who holds the key.",
      feedbackWrong: "The point is: whoever controls the key controls the bitcoin.",
    },
    es: {
      teach:
        "Una cartera de Bitcoin no guarda 'moneditas': guarda las claves que controlan tus bitcoins en la red. En el exchange (custodia) la empresa las guarda por ti; en una cartera propia (autocustodia) tú controlas la clave. Abrir una propia suele ser instalar la app, anotar la frase de recuperación offline y nunca compartirla.",
      question: "¿Cuál es la diferencia central entre cartera en el exchange y cartera propia?",
      options: [
        "En el exchange el bitcoin es físico; en la propia es solo un número",
        "En el exchange la empresa guarda las claves; en la propia tú controlas las claves",
        "La cartera propia solo funciona fuera de Brasil",
        "No hay diferencia — los dos nombres son lo mismo",
      ],
      feedbackCorrect: "Exacto — custodial vs autocustodia es quién tiene la clave.",
      feedbackWrong: "El punto es: quien controla la clave, controla el bitcoin.",
    },
  },
  q4: {
    en: {
      teach:
        "In Brazil, Bitcoin may need to be reported when you must declare assets or when you sell at a gain. In broad terms, small monthly sales can fall under an exemption band — but rules change and the fine print belongs with an accountant. The idea here: know that tax rules exist; don't ignore the topic.",
      question: "About tax and Bitcoin in Brazil, what makes the most sense?",
      options: [
        "Bitcoin never needs to be declared in any situation",
        "There may be a duty to declare and exemption rules on sales — get informed (and an accountant if needed)",
        "Only people with a US exchange must declare",
        "Tax only exists if you mine bitcoin at home",
      ],
      feedbackCorrect: "That's it — a tax framework exists; learn it without panic.",
      feedbackWrong: "It's not 'never declare': there are rules and exemptions to know.",
    },
    es: {
      teach:
        "En Brasil, Bitcoin entra en la declaración cuando debes informar patrimonio o cuando vendes con ganancia. En líneas generales, ventas mensuales pequeñas pueden caer en una franja de exención — pero las reglas cambian y el detalle técnico es del contador. La idea aquí: saber que hay marco fiscal; no ignores el tema.",
      question: "Sobre impuestos y Bitcoin en Brasil, ¿qué tiene más sentido?",
      options: [
        "Bitcoin nunca necesita declararse en ninguna situación",
        "Puede haber obligación de declarar y reglas de exención en ventas — conviene informarse (y, si hace falta, un contador)",
        "Solo quien tiene exchange estadounidense debe declarar",
        "Impuesto solo existe si minas bitcoin en casa",
      ],
      feedbackCorrect: "Eso — hay marco fiscal; infórmate sin pánico.",
      feedbackWrong: "No es 'nunca declares': hay reglas y exenciones que conocer.",
    },
  },
  w1: {
    en: {
      teach:
        "Exchanges are the bridge between fiat currency and Bitcoin: you deposit money, buy BTC, and can withdraw to a wallet. In Brazil there are several well-known players — what matters is their role (custody and liquidity), not advertising any specific brand.",
      question: "What is the main role of a Bitcoin exchange?",
      options: [
        "Replace Bitcoin with another official currency",
        "Act as a bridge between fiat and Bitcoin (buy, sell, liquidity)",
        "Store your seed automatically with total safety",
        "Issue new bitcoins like a central bank",
      ],
      feedbackCorrect: "That's it — exchange = bridge between fiat and BTC.",
      feedbackWrong: "Think buy/sell with liquidity, not issuing money.",
    },
    es: {
      teach:
        "Los exchanges son el puente entre la moneda local y Bitcoin: depositas dinero, compras BTC y puedes retirar a una cartera. En Brasil hay varios conocidos — lo importante es entender su papel (custodia y liquidez), no hacer propaganda de ninguna marca.",
      question: "¿Cuál es el papel principal de un exchange de Bitcoin?",
      options: [
        "Sustituir el Bitcoin por otra moneda oficial",
        "Servir de puente entre moneda local y Bitcoin (comprar, vender, liquidez)",
        "Guardar tu seed automáticamente con seguridad total",
        "Emitir bitcoins nuevos como un banco central",
      ],
      feedbackCorrect: "Eso — exchange = puente entre moneda local y BTC.",
      feedbackWrong: "Piensa en comprar/vender con liquidez, no en emitir moneda.",
    },
  },
  w2: {
    en: {
      teach:
        "Lightning Network is an 'express lane' on top of Bitcoin: near-instant payments with low fees — ideal for everyday use. You use compatible wallets, create or paste an invoice, and the network moves sats quickly.",
      question: "What is the Lightning Network for?",
      options: [
        "Replace Bitcoin with another currency",
        "Pay with sats quickly and with low fees",
        "Automatically hide every transaction from the government",
        "Print new bitcoins faster",
      ],
      feedbackCorrect: "Exactly — speed and low fees for daily life.",
      feedbackWrong: "Lightning = fast, cheap payments in sats.",
    },
    es: {
      teach:
        "Lightning Network es una 'vía expresa' sobre Bitcoin: pagos casi instantáneos y con comisiones bajas — ideal para el día a día. Usas carteras compatibles, generas o pegas un cobro (invoice) y la red mueve los sats rápido.",
      question: "¿Para qué sirve la Lightning Network?",
      options: [
        "Sustituir el Bitcoin por otra moneda",
        "Pagar con sats de forma rápida y con comisiones bajas",
        "Ocultar automáticamente todas las transacciones del gobierno",
        "Imprimir bitcoins nuevos más rápido",
      ],
      feedbackCorrect: "Exacto — velocidad y comisiones bajas en el día a día.",
      feedbackWrong: "Lightning = pagos rápidos y baratos en sats.",
    },
  },
  w3: {
    en: {
      teach:
        "The classic path: buy Bitcoin on an exchange and, when it makes sense, withdraw to a self-custody wallet. At the exchange you depend on the company; in your own wallet you control the key. 'Not your keys, not your coins' — that's why self-custody matters for sovereignty.",
      question: "Why withdraw from an exchange to your own wallet?",
      options: [
        "Because the exchange cannot store bitcoin",
        "So you control the keys — less dependence on the company",
        "Because your own wallet automatically earns interest",
        "Only to pay less tax right away",
      ],
      feedbackCorrect: "That's it — self-custody = you control the key.",
      feedbackWrong: "The core reason is key control, not interest or tax.",
    },
    es: {
      teach:
        "El camino clásico: comprar Bitcoin en el exchange y, cuando tenga sentido, retirar a una cartera de autocustodia. En el exchange dependes de la empresa; en la cartera propia controlas la clave. 'No tus claves, no tus monedas' — por eso la autocustodia importa para quien quiere soberanía.",
      question: "¿Por qué retirar del exchange a una cartera propia?",
      options: [
        "Porque el exchange no puede guardar bitcoin",
        "Para que tú controles las claves — menos dependencia de la empresa",
        "Porque la cartera propia genera intereses automáticamente",
        "Solo para pagar menos impuestos al momento",
      ],
      feedbackCorrect: "Eso — autocustodia = tú controlas la clave.",
      feedbackWrong: "El motivo central es el control de las claves, no intereses ni impuestos.",
    },
  },
  w4: {
    en: {
      teach:
        "A cold wallet stays offline — a hardware wallet or a setup disconnected from the internet. It's for long-term storage with less exposure to malware and online scams. Everyday spending can stay in a hot wallet; the larger stash goes cold.",
      question: "What defines a cold wallet?",
      options: [
        "A wallet only for coins from cold countries",
        "An offline wallet, safer for long-term storage",
        "Any wallet inside an exchange",
        "A wallet that freezes your balance for 30 days",
      ],
      feedbackCorrect: "Perfect — offline and built for the long term.",
      feedbackWrong: "Cold = offline / less exposure to the internet.",
    },
    es: {
      teach:
        "Una cartera fría (cold wallet) queda offline — hardware wallet o un setup desconectado de internet. Sirve para guardar a largo plazo con menos exposición a virus y estafas online. El día a día (gastar poco) puede quedar en una cartera caliente; el stock mayor, en frío.",
      question: "¿Qué caracteriza una cartera fría?",
      options: [
        "Una cartera solo para monedas de países fríos",
        "Una cartera offline, más segura para guardar a largo plazo",
        "Cualquier cartera dentro de un exchange",
        "Una cartera que congela el saldo por 30 días",
      ],
      feedbackCorrect: "Perfecto — offline y pensada para el largo plazo.",
      feedbackWrong: "Fría = offline / menos exposición a internet.",
    },
  },
};

export function normalizeQuizLocale(raw?: string | null): QuizLocale {
  const v = (raw ?? "pt").toLowerCase();
  if (v.startsWith("en")) return "en";
  if (v.startsWith("es") || v.startsWith("es-")) return "es";
  return "pt";
}

/** Traduz uma lição já sem gabarito (cliente). */
export function localizeLessonClient(
  lesson: { id: string; teach: string; question: string; options: string[] },
  locale: QuizLocale | string,
): { id: string; teach: string; question: string; options: string[] } {
  const lang = normalizeQuizLocale(locale);
  if (lang === "pt") return lesson;
  const pack = QUIZ_I18N[lesson.id]?.[lang];
  if (!pack) return lesson;
  return {
    id: lesson.id,
    teach: pack.teach,
    question: pack.question,
    options: [...pack.options],
  };
}
