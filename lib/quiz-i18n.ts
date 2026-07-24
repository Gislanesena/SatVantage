export type QuizLocale = "pt" | "en" | "es";

export type QuizTextPack = {
  teach: string;
  question: string;
  options: string[];
  feedbackCorrect: string;
  feedbackWrong: string;
};

/** Overlays by locale then question id. PT is the base in quiz.ts — do NOT include pt here. */
export const QUIZ_I18N: Record<"en" | "es", Record<string, QuizTextPack>> = {
  en: {
    q1: {
      teach:
        "Bitcoin is digital money that doesn't depend on banks or governments to exist. It runs on a worldwide network: the rules are public and anyone can check them. It's the most authentic form of money outside the traditional system — you don't need to ask permission to use it.",
      question: "Which best describes Bitcoin?",
      options: [
        "A banking app that only works in Brazil",
        "Digital money on a worldwide network, without depending on banks or governments",
        "A tech company stock listed on the exchange",
        "An international credit card with gold cashback",
      ],
      feedbackCorrect:
        "That's it — digital money with public rules, no required middleman.",
      feedbackWrong: "Think of global digital money, without a bank in the middle.",
    },
    q2: {
      teach:
        "Today's most common scams promise to 'double your money,' sell pyramids dressed up as investments, or pretend to be support asking for your key or seed phrase. They also use fake urgency: 'do it now or you lose.' Simple protection: distrust easy promises, never share seed/key, and pause before you click.",
      question:
        "Someone in chat says: 'I'm support — send your seed phrase now or your account will be locked.' What should you do?",
      options: [
        "Send the seed only if the profile has a professional photo",
        "Send part of the seed to 'prove' it's you",
        "Send nothing: legitimate support never asks for a seed or private key",
        "Ask for support's ID number and, if it matches, send the seed",
      ],
      feedbackCorrect:
        "Perfect. Seed and private key never go to chat, email, or 'support.'",
      feedbackWrong: "Urgency + asking for a seed = scam. Never send it.",
    },
    q3: {
      teach:
        "A Bitcoin wallet doesn't store 'coins' like a leather wallet. It stores access — the keys — to your bitcoins on the network. At an exchange (custodial), the company holds the keys for you. In your own wallet, you control them. Opening your own wallet usually means: download a trusted app, write the recovery phrase offline, and never share it.",
      question: "What does a Bitcoin wallet actually do?",
      options: [
        "Stores physical bitcoin coins in a digital vault",
        "Stores access (the keys) to your bitcoins on the network",
        "Prints new bitcoins every time you open the app",
        "Replaces your tax ID and bank with the tax authority",
      ],
      feedbackCorrect: "Exactly — the wallet is access control, not a coin chest.",
      feedbackWrong: "The wallet stores access keys — not physical coins.",
    },
    q4: {
      teach:
        "In Brazil, Bitcoin shows up in income-tax conversations. In general, you report holdings and gains when you sell or trade. There's an important practical idea: monthly sales below an exemption limit (in reais) may not trigger tax on the gain that month — but the rule changes over time, so check official guidance or an accountant. The point: don't ignore it; organize and declare when it applies.",
      question: "About tax and Bitcoin in Brazil, which statement makes the most sense?",
      options: [
        "Bitcoin never needs to be declared, in any situation",
        "Only people who hold more than 1 whole bitcoin must declare",
        "In general you declare holdings/gains on sales; there is a monthly sales exemption up to a limit — check the current rule",
        "Tax only exists if you use the Lightning Network",
      ],
      feedbackCorrect:
        "Right — organize and declare when you have holdings or gains; the monthly exemption has a cap.",
      feedbackWrong:
        "Bitcoin may need to be declared; the sales exemption is monthly and capped.",
    },
    w1: {
      teach:
        "Exchanges are the bridge between reais (or another currency) and Bitcoin: you deposit money, buy BTC, and can withdraw to a wallet. In Brazil there are several well-known ones — Mercado Bitcoin, Foxbit, NovaDAX, Binance, and others. None is 'the official' one; what matters is understanding their role and the risks of leaving everything on an exchange.",
      question: "What is the main role of a Bitcoin exchange?",
      options: [
        "Issuing new bitcoins like a central bank",
        "Acting as a bridge between reais (or another currency) and Bitcoin",
        "Mandatorily storing everyone's seed",
        "Replacing the Lightning Network worldwide",
      ],
      feedbackCorrect: "That's it — an exchange connects everyday money to Bitcoin.",
      feedbackWrong: "An exchange bridges reais and Bitcoin — it doesn't mint new coins.",
    },
    w2: {
      teach:
        "The Lightning Network is Bitcoin's 'express lane': a layer built for instant, cheap payments — ideal for everyday use. Instead of every coffee going straight on the main blockchain (slower and costlier), Lightning moves sats fast. In practice you use a Lightning wallet, generate or paste an invoice, and payment arrives in seconds.",
      question: "Which best describes the Lightning Network?",
      options: [
        "A Brazilian exchange required to buy Bitcoin",
        "Bitcoin's express lane: fast payments with low fees",
        "A special tax charged by the tax authority on every sat",
        "A type of cold wallet that never connects to the internet",
      ],
      feedbackCorrect: "Exactly — Lightning = speed and low cost for daily use.",
      feedbackWrong: "Lightning is the fast, cheap layer on top of Bitcoin.",
    },
    w3: {
      teach:
        "Buying Bitcoin on an exchange is only the first step. If the money always stays there, you depend on the company (their custody). Self-custody means withdrawing to a wallet where you control the keys. Classic path: buy → transfer to your own wallet → keep the seed carefully. Then the Bitcoin is truly yours.",
      question: "Why withdraw Bitcoin from an exchange to your own wallet?",
      options: [
        "Because the exchange automatically wipes balances every month",
        "For self-custody: you control the keys, without depending on the company",
        "Because Bitcoin only exists inside factory cold wallets",
        "To pay less tax — the tax authority can't see self-custody wallets",
      ],
      feedbackCorrect: "That's it — buying is the start; self-custody means you hold the keys.",
      feedbackWrong: "Withdrawing to your own wallet = you're in control, not the exchange.",
    },
    w4: {
      teach:
        "A cold wallet stays offline — without a constant internet connection. It's for long-term storage with less exposure to viruses and online attacks. Hot wallets (on a connected phone/computer) are practical day to day; cold is the vault. Many people use both: a little for daily use, the rest in cold storage.",
      question: "What is a cold wallet?",
      options: [
        "A wallet that only works below 10 °C",
        "An offline wallet, with no internet connection, safer for long-term storage",
        "Your exchange account when you turn on night mode",
        "Any Lightning wallet used to pay for coffee",
      ],
      feedbackCorrect: "Perfect — cold = offline, meant for safer long-term storage.",
      feedbackWrong: "Cold wallet = offline, for long-term custody.",
    },
  },
  es: {
    q1: {
      teach:
        "Bitcoin es dinero digital que no depende de bancos ni de gobiernos para existir. Funciona en una red mundial: las reglas son públicas y cualquiera puede verificarlas. Es la forma más auténtica de moneda fuera del sistema tradicional — no necesitas pedir permiso para usarlo.",
      question: "¿Qué describe mejor a Bitcoin?",
      options: [
        "Una app bancaria que solo funciona en Brasil",
        "Dinero digital en una red mundial, sin depender de bancos ni gobiernos",
        "Una acción de empresa tecnológica cotizada en bolsa",
        "Una tarjeta de crédito internacional con cashback en oro",
      ],
      feedbackCorrect:
        "Eso es — dinero digital con reglas públicas, sin intermediario obligatorio.",
      feedbackWrong: "Piensa en dinero digital global, sin un banco en el medio.",
    },
    q2: {
      teach:
        "Las estafas más comunes hoy prometen 'duplicar tu dinero', venden pirámides disfrazadas de inversión, o fingen ser soporte pidiendo tu clave o frase seed. También usan urgencia artificial: 'hazlo ahora o pierdes'. Protección simple: desconfía de promesas fáciles, nunca compartas seed/clave y respira antes de hacer clic.",
      question:
        "Alguien en el chat dice: 'Soy del soporte — envíame tu frase seed ahora o tu cuenta será bloqueada'. ¿Qué hacer?",
      options: [
        "Enviar la seed solo si el perfil tiene foto profesional",
        "Enviar una parte de la seed para 'probar' que eres tú",
        "No enviar nada: el soporte legítimo nunca pide seed ni clave privada",
        "Pedir el documento del soporte y, si coincide, enviar la seed",
      ],
      feedbackCorrect:
        "Perfecto. Seed y clave privada nunca van a chat, correo o 'soporte'.",
      feedbackWrong: "Urgencia + pedido de seed = estafa. Nunca la envíes.",
    },
    q3: {
      teach:
        "Una billetera de Bitcoin no guarda 'moneditas' como una billetera de cuero. Guarda el acceso — las claves — a tus bitcoins en la red. En una corretora (custodial), la empresa guarda las claves por ti. En una billetera propia, tú controlas. Abrir una propia suele ser: bajar una app confiable, anotar la frase de recuperación offline y nunca compartirla.",
      question: "¿Qué hace de verdad una billetera de Bitcoin?",
      options: [
        "Guarda monedas físicas de bitcoin en una bóveda digital",
        "Guarda el acceso (las claves) a tus bitcoins en la red",
        "Imprime bitcoins nuevos cada vez que abres la app",
        "Sustituye el documento de identidad y el banco ante la autoridad fiscal",
      ],
      feedbackCorrect: "Exacto — la billetera es el control del acceso, no un cofre de monedas.",
      feedbackWrong: "La billetera guarda las claves de acceso — no monedas físicas.",
    },
    q4: {
      teach:
        "En Brasil, Bitcoin entra en la conversación del Impuesto sobre la Renta. En general, declares la posesión y las ganancias cuando vendes o intercambias. Hay una idea práctica importante: ventas mensuales por debajo de un límite de exención (en reales) pueden no generar impuesto sobre la ganancia ese mes — pero la regla cambia con el tiempo y conviene revisar la orientación oficial o un contador. El punto: no lo ignores; organízate y declara cuando corresponda.",
      question: "Sobre impuestos y Bitcoin en Brasil, ¿qué afirmación tiene más sentido?",
      options: [
        "Bitcoin nunca necesita declararse, en ninguna situación",
        "Solo declara quien tiene más de 1 bitcoin entero",
        "En general se declara posesión/ganancias en las ventas; hay exención mensual de ventas hasta un límite — revisa la regla vigente",
        "El impuesto solo existe si usas Lightning Network",
      ],
      feedbackCorrect:
        "Eso es — organízate y declara cuando haya posesión o ganancia; la exención mensual tiene tope.",
      feedbackWrong:
        "Bitcoin puede necesitar declaración; la exención de ventas es mensual y tiene tope.",
    },
    w1: {
      teach:
        "Las corretoras son el puente entre reales (u otra moneda) y Bitcoin: depositas dinero, compras BTC y puedes retirar a una billetera. En Brasil hay varias conocidas — Mercado Bitcoin, Foxbit, NovaDAX, Binance y otras. Ninguna es 'la oficial'; lo importante es entender su rol y los riesgos de dejarlo todo en la corretora.",
      question: "¿Cuál es el rol principal de una corretora de Bitcoin?",
      options: [
        "Emitir bitcoins nuevos como un banco central",
        "Servir de puente entre reales (u otra moneda) y Bitcoin",
        "Guardar obligatoriamente la seed de todo el mundo",
        "Sustituir la Lightning Network en todo el mundo",
      ],
      feedbackCorrect: "Eso es — la corretora conecta el dinero del día a día con Bitcoin.",
      feedbackWrong: "La corretora es el puente entre reales y Bitcoin — no emite moneda nueva.",
    },
    w2: {
      teach:
        "La Lightning Network es la 'vía expresa' de Bitcoin: una capa hecha para pagos instantáneos y baratos, ideal en el día a día. En lugar de que cada café vaya directo a la blockchain principal (más lenta y cara), Lightning mueve sats rápido. En la práctica usas una billetera Lightning, generas o pegas una cobranza (invoice) y el pago llega en segundos.",
      question: "¿Qué describe mejor la Lightning Network?",
      options: [
        "Una corretora brasileña obligatoria para comprar Bitcoin",
        "La vía expresa de Bitcoin: pagos rápidos y con comisiones bajas",
        "Un impuesto especial cobrado por la autoridad fiscal sobre cada sat",
        "Un tipo de billetera fría que nunca se conecta a internet",
      ],
      feedbackCorrect: "Exacto — Lightning = velocidad y bajo costo en el uso diario.",
      feedbackWrong: "Lightning es la capa rápida y barata encima de Bitcoin.",
    },
    w3: {
      teach:
        "Comprar Bitcoin en una corretora es solo el primer paso. Si el dinero siempre se queda ahí, dependes de la empresa (su custodia). La autocustodia es retirar a una billetera donde tú controlas las claves. Camino clásico: comprar → transferir a billetera propia → guardar la seed con cuidado. Así el Bitcoin es realmente tuyo.",
      question: "¿Por qué retirar Bitcoin de la corretora a una billetera propia?",
      options: [
        "Porque la corretora borra el saldo todos los meses automáticamente",
        "Para tener autocustodia: tú controlas las claves, sin depender de la empresa",
        "Porque Bitcoin solo existe dentro de billeteras frías de fábrica",
        "Para pagar menos impuestos — la autoridad fiscal no ve la billetera propia",
      ],
      feedbackCorrect:
        "Eso es — comprar es el comienzo; autocustodia es tú con las claves.",
      feedbackWrong: "Retirar a billetera propia = tú en control, no la corretora.",
    },
    w4: {
      teach:
        "Una billetera fría (cold wallet) permanece offline — sin conexión constante a internet. Sirve para guardar a largo plazo con menos exposición a virus e invasiones online. Las billeteras calientes (en celular/computadora conectados) son prácticas en el día a día; el frío es la bóveda. Mucha gente usa ambas: poco para el día a día, el resto en frío.",
      question: "¿Qué es una billetera fría (cold wallet)?",
      options: [
        "Una billetera que solo funciona por debajo de 10 °C",
        "Una billetera offline, sin conexión a internet, más segura para guardar a largo plazo",
        "La cuenta de la corretora cuando activas el modo nocturno",
        "Cualquier billetera Lightning usada para pagar un café",
      ],
      feedbackCorrect: "Perfecto — frío = offline, pensado para guardar con más seguridad.",
      feedbackWrong: "Cold wallet = offline, para custodia a largo plazo.",
    },
  },
};

export function parseQuizLocale(raw: string | null | undefined): QuizLocale {
  if (raw === "en" || raw === "es" || raw === "pt") return raw;
  return "pt";
}
