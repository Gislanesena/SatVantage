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
        "Bitcoin is digital money that works without a bank in the middle. Nobody 'prints' it from nothing: the rules are public and anyone can verify them.",
      question: "What is Bitcoin?",
      options: [
        "A technology company headquartered in the United States",
        "Digital money that works without depending on banks or governments",
        "An investment app created by an exchange",
        "A physical collector coin plated in gold",
      ],
      feedbackCorrect: "That's it — sovereignty without asking a bank for permission.",
      feedbackWrong: "Almost. Think of digital money without a mandatory middleman.",
    },
    es: {
      teach:
        "Bitcoin es dinero digital que funciona sin un banco en el medio. Nadie lo 'imprime' de la nada: las reglas son públicas y cualquiera puede verificarlas.",
      question: "¿Qué es Bitcoin?",
      options: [
        "Una empresa de tecnología con sede en Estados Unidos",
        "Un dinero digital que funciona sin depender de bancos o gobiernos",
        "Una app de inversiones creada por un exchange",
        "Una moneda física de coleccionista bañada en oro",
      ],
      feedbackCorrect: "Eso — soberanía sin pedir permiso a un banco.",
      feedbackWrong: "Casi. Piensa en dinero digital sin intermediario obligatorio.",
    },
  },
  q2: {
    en: {
      teach:
        "Your private key is the secret that proves the bitcoins are yours. Whoever has the key controls the money. Never share it.",
      question: "What is a private key?",
      options: [
        "The password of the exchange app",
        "A code the company keeps so you can recover the account",
        "The secret that proves the bitcoins are yours — who has the key has the bitcoins",
        "Your wallet number, which you share to receive payments",
      ],
      feedbackCorrect: "Exactly. The key is ownership.",
      feedbackWrong: "A private key is not for sharing — it is control.",
    },
    es: {
      teach:
        "Tu clave privada es el secreto que prueba que los bitcoins son tuyos. Quien tiene la clave controla el dinero. Nunca la compartas.",
      question: "¿Qué es una clave privada?",
      options: [
        "La contraseña de la app del exchange",
        "Un código que la empresa guarda para recuperar la cuenta",
        "El secreto que prueba que los bitcoins son tuyos — quien tiene la clave, tiene los bitcoins",
        "El número de tu billetera, que compartes para recibir pagos",
      ],
      feedbackCorrect: "Exacto. La clave es la posesión.",
      feedbackWrong: "La clave privada no se comparte — es el control.",
    },
  },
  q3: {
    en: {
      teach:
        "Scams love urgency and 'easy money'. If someone promises to double your bitcoins, be suspicious: it's the classic ecosystem scam.",
      question:
        "You get a message: 'Double your bitcoins! Send 0.01 BTC and get 0.02 back'. What should you do?",
      options: [
        "Send a small amount first to test if it's real",
        "Ignore and report: promising to multiply money is the classic scam",
        "Check if the site has a security padlock and, if so, send",
        "Send only if the message comes from a verified profile",
      ],
      feedbackCorrect: "Perfect. Promise to multiply = red flag.",
      feedbackWrong: "Never send to 'double'. That's a classic scam.",
    },
    es: {
      teach:
        "Las estafas aman la prisa y el 'dinero fácil'. Si alguien promete duplicar tus bitcoins, desconfía: es la estafa clásica del ecosistema.",
      question:
        "Recibes un mensaje: '¡Duplica tus bitcoins! Envía 0,01 BTC y recibe 0,02 de vuelta'. ¿Qué hacer?",
      options: [
        "Enviar un valor pequeño primero para probar si es verdad",
        "Ignorar y denunciar: promete multiplicar dinero es la estafa más clásica",
        "Verificar si el sitio tiene candado de seguridad y, si tiene, enviar",
        "Enviar solo si el mensaje viene de un perfil verificado",
      ],
      feedbackCorrect: "Perfecto. Promesa de multiplicar = bandera roja.",
      feedbackWrong: "Nunca envíes para 'duplicar'. Es estafa clásica.",
    },
  },
  q4: {
    en: {
      teach:
        "Self-custody means you hold your own key — without depending on the exchange. More responsibility, more freedom.",
      question: "What does 'self-custody' mean?",
      options: [
        "Leaving bitcoins on the exchange, which handles everything",
        "Holding the key to your bitcoins yourself, without depending on companies",
        "Hiring a physical bank vault to store coins",
        "Printing bitcoins on paper and keeping them at home",
      ],
      feedbackCorrect: "That's it. You in control of the key.",
      feedbackWrong: "Self-custody = you with the key, not the exchange.",
    },
    es: {
      teach:
        "Autocustodia es guardar tú mismo la clave — sin depender del exchange. Más responsabilidad, más libertad.",
      question: "¿Qué significa 'autocustodia'?",
      options: [
        "Dejar los bitcoins en el exchange, que se encarga de todo",
        "Guardar tú mismo la clave de tus bitcoins, sin depender de empresas",
        "Contratar una caja fuerte física en un banco para guardar monedas",
        "Imprimir los bitcoins en papel y guardarlos en casa",
      ],
      feedbackCorrect: "Eso. Tú con el control de la clave.",
      feedbackWrong: "Autocustodia = tú con la clave, no el exchange.",
    },
  },
  q5: {
    en: {
      teach:
        "One bitcoin divides into satoshis — the smallest unit. That's how you can learn and earn small amounts without needing a whole bitcoin.",
      question: "What is a satoshi?",
      options: [
        "The smallest fraction of a bitcoin — each bitcoin has 100 million satoshis",
        "A cryptocurrency that competes with Bitcoin",
        "The fee exchanges charge on each purchase",
        "The name of the central bank that issues bitcoins",
      ],
      feedbackCorrect: "Nice. Sats are Bitcoin's 'cents'.",
      feedbackWrong: "A satoshi is the smallest fraction of a bitcoin.",
    },
    es: {
      teach:
        "Un bitcoin se divide en satoshis — la unidad más pequeña. Así puedes aprender y ganar valores pequeños sin necesitar un bitcoin entero.",
      question: "¿Qué es un satoshi?",
      options: [
        "La fracción más pequeña del bitcoin — cada bitcoin tiene 100 millones de satoshis",
        "Una criptomoneda competidora de Bitcoin",
        "La comisión que cobran los exchanges en cada compra",
        "El nombre del banco central que emite los bitcoins",
      ],
      feedbackCorrect: "Bien. Los sats son los 'centavos' del Bitcoin.",
      feedbackWrong: "Satoshi es la fracción más pequeña del bitcoin.",
    },
  },
  w1: {
    en: {
      teach:
        "A Bitcoin wallet doesn't hold 'coins' like a leather wallet. It holds the keys that control your bitcoins on the network. Without the key, nobody moves your money — not even us.",
      question: "What does a Bitcoin wallet really store?",
      options: [
        "The physical bitcoin coins you bought",
        "The keys that control your bitcoins on the network",
        "Your bank statement, just in dollars",
        "A tax registry with your ID number",
      ],
      feedbackCorrect: "That's it. The wallet is key control.",
      feedbackWrong: "The wallet stores keys — not physical coins.",
    },
    es: {
      teach:
        "Una billetera de Bitcoin no guarda 'monedas' como una de cuero. Guarda las claves que controlan tus bitcoins en la red. Sin la clave, nadie mueve tu dinero — ni nosotros.",
      question: "¿Qué guarda de verdad una billetera de Bitcoin?",
      options: [
        "Las monedas físicas de bitcoin que compraste",
        "Las claves que controlan tus bitcoins en la red",
        "El extracto de tu banco, solo que en dólares",
        "Un registro fiscal con tu documento",
      ],
      feedbackCorrect: "Eso. La billetera es el control de las claves.",
      feedbackWrong: "La billetera guarda las claves — no moneditas físicas.",
    },
  },
  w2: {
    en: {
      teach:
        "When you create a wallet, a recovery phrase (seed) appears — several words. It's the master backup. Whoever has that phrase can recreate the wallet. Never photograph it, never send it on chat, never type it on a strange site.",
      question: "What should you do with the wallet recovery phrase (seed)?",
      options: [
        "Send it on WhatsApp to a 'trusted' friend to keep",
        "Photograph it and save it in phone cloud storage",
        "Write it offline in a safe place and never share it with anyone",
        "Post it on Instagram Stories to remember later",
      ],
      feedbackCorrect: "Perfect. Offline, safe, only you.",
      feedbackWrong: "Seed never goes to chat, photo, or cloud — it's the master backup.",
    },
    es: {
      teach:
        "Cuando creas una billetera aparece una frase de recuperación (seed) — varias palabras. Es el backup maestro. Quien tiene esa frase puede recrear la billetera. Nunca la fotografíes, nunca la mandes por chat, nunca la escribas en un sitio raro.",
      question: "¿Qué hacer con la frase de recuperación (seed) de la billetera?",
      options: [
        "Mandarla por WhatsApp a un amigo 'de confianza' para guardar",
        "Fotografiarla y guardarla en la nube del celular",
        "Anotarla offline en un lugar seguro y nunca compartirla con nadie",
        "Pegarla en Instagram Stories para recordar después",
      ],
      feedbackCorrect: "Perfecto. Offline, segura, solo tú.",
      feedbackWrong: "La seed nunca va a chat, foto o nube — es el backup maestro.",
    },
  },
  w3: {
    en: {
      teach:
        "The Lightning Network is a 'layer' on top of Bitcoin to pay fast and cheap — like instant payments, but in sats. Ideal for daily use.",
      question: "What is the Lightning Network for?",
      options: [
        "Replacing Bitcoin with another currency",
        "Paying with sats quickly and with low fees",
        "Automatically hiding transactions from the government",
        "Printing new bitcoins faster",
      ],
      feedbackCorrect: "Exactly — speed and low fees day to day.",
      feedbackWrong: "Lightning = fast, cheap payments in sats.",
    },
    es: {
      teach:
        "La red Lightning es una 'capa' sobre Bitcoin para pagar rápido y barato — tipo pagos instantáneos, pero en sats. Ideal para el día a día.",
      question: "¿Para qué sirve la Lightning Network?",
      options: [
        "Sustituir el Bitcoin por otra moneda",
        "Pagar con sats de forma rápida y con comisiones bajas",
        "Ocultar transacciones del gobierno automáticamente",
        "Imprimir bitcoins nuevos más rápido",
      ],
      feedbackCorrect: "Exacto — velocidad y comisiones bajas en el día a día.",
      feedbackWrong: "Lightning = pagos rápidos y baratos en sats.",
    },
  },
  w4: {
    en: {
      teach:
        "To receive sats on Lightning, your wallet creates an invoice — a long code. The payer pastes that code and the network sends. You don't need to memorize an address.",
      question: "How do you receive a Lightning payment?",
      options: [
        "Asking for the payer's tax ID",
        "Creating an invoice in your wallet and giving it to the payer",
        "Calling the exchange and requesting a bank transfer",
        "Sending your SatVantage password to the other person",
      ],
      feedbackCorrect: "That's it. Invoice = charge created by the wallet.",
      feedbackWrong: "The receiver creates the invoice; the payer pastes the code.",
    },
    es: {
      teach:
        "Para recibir sats en Lightning, tu billetera genera un cobro (invoice) — un código largo. Quien paga pega ese código y la red envía. No necesitas memorizar la dirección.",
      question: "¿Cómo recibes un pago Lightning?",
      options: [
        "Pidiendo el documento de quien va a pagar",
        "Generando un cobro (invoice) en tu billetera y pasándolo a quien paga",
        "Llamando al exchange y pidiendo una transferencia bancaria",
        "Enviando tu contraseña de SatVantage a la otra persona",
      ],
      feedbackCorrect: "Eso. Invoice = cobro generado por la billetera.",
      feedbackWrong: "Quien recibe genera el cobro; quien paga pega el código.",
    },
  },
  w5: {
    en: {
      teach:
        "Here on SatVantage we use a test network (MutinyNet). Learning sats are not real money — you can make mistakes and train safely.",
      question: "Why do we use a test network on this platform?",
      options: [
        "Because Lightning doesn't work in Brazil",
        "So you can learn and practice without risking real money",
        "Because test sats are worth more than real bitcoin",
        "So the government can track every click",
      ],
      feedbackCorrect: "Nice. This is a safe lab.",
      feedbackWrong: "Test network = learn without risking real money.",
    },
    es: {
      teach:
        "Aquí en SatVantage estamos en red de prueba (MutinyNet). Los sats de aprendizaje no son dinero de verdad — puedes equivocarte y entrenar sin miedo.",
      question: "¿Por qué usamos red de prueba en esta plataforma?",
      options: [
        "Porque Lightning no funciona en Brasil",
        "Para que aprendas y entrenes sin arriesgar dinero real",
        "Porque los sats de prueba valen más que el bitcoin real",
        "Para que el gobierno siga cada clic",
      ],
      feedbackCorrect: "Bien. Aquí es un laboratorio seguro.",
      feedbackWrong: "Red de prueba = aprender sin riesgo de dinero real.",
    },
  },
};

export function normalizeQuizLocale(raw: string | null | undefined): QuizLocale {
  const v = (raw || "pt").toLowerCase();
  if (v.startsWith("en")) return "en";
  if (v.startsWith("es")) return "es";
  return "pt";
}

/** Aplica tradução EN/ES a uma lição vinda da API (fallback no cliente). */
export function localizeLessonClient<
  T extends { id: string; teach: string; question: string; options: string[] },
>(lesson: T, locale: QuizLocale | string): T {
  const lang = normalizeQuizLocale(locale);
  if (lang === "pt") return lesson;
  const pack = QUIZ_I18N[lesson.id]?.[lang];
  if (!pack) return lesson;
  return {
    ...lesson,
    teach: pack.teach,
    question: pack.question,
    options: [...pack.options],
  };
}
