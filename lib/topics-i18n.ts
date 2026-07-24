import type { OptionalTopic, TopicFaq } from "./optional-topics";

export type TopicLocale = "pt" | "en" | "es";

type TopicPack = {
  label: string;
  teach: string[];
  question?: string;
  options?: string[];
  feedbackCorrect?: string;
  feedbackWrong?: string;
  inviteDoubt?: string;
  faq?: TopicFaq[];
};

export const TOPIC_I18N: Record<"en" | "es", Record<string, TopicPack>> = {
  en: {
    patrimonio: {
      label: "How to build your first wealth",
      teach: [
        "Wealth starts small and steady: save a slice of what comes in before spending the rest. With Bitcoin, many people use the habit of buying a little often (dollar-cost averaging) instead of trying to 'catch the bottom'.",
        "Your first wealth in sats does not need to be large. What matters is the habit plus security: knowing where your key is, not falling for scams, and not selling everything at the first market scare.",
        "At SatVantage the idea is to educate before you accelerate. When you understand the basics, every sat you save has a better chance of truly staying with you.",
      ],
      question: "Which habit helps most when building your first Bitcoin wealth?",
      options: [
        "Waiting for the 'perfect' price to buy everything at once",
        "Saving regularly, even small amounts, and protecting your key",
        "Following a stranger's tip promising guaranteed profit",
        "Leaving everything on the exchange forever without learning",
      ],
      feedbackCorrect: "Exactly — consistency and conscious custody.",
      feedbackWrong: "Think frequent habit plus key security.",
    },
    comprar: {
      label: "How to buy bitcoin",
      teach: [
        "The most common path in Brazil: open an account on an exchange, send PIX in reais, and buy bitcoin. It is the 'entry gate'. After that, the ideal is to learn how to move it to your own wallet.",
        "Watch out for fees, timing, and fake 'support' scams. Only buy what you understand. On SatVantage's test network you practice the vocabulary without risking real money.",
        "Buying is only the first step. Storing safely and not letting urgency drive you matters as much as the price of the day.",
      ],
      question: "After buying on an exchange, what increases your sovereignty?",
      options: [
        "Leaving it on the exchange forever and forgetting about it",
        "Learning to transfer to a wallet under your control",
        "Sending the amount to someone who promised to double it",
        "Posting your seed on Instagram for 'social backup'",
      ],
      feedbackCorrect: "Exactly — the exchange buys; your own wallet holds.",
      feedbackWrong: "Sovereignty = you hold the key, after buying.",
    },
    geopolitica: {
      label: "Geopolitics and why to follow it",
      teach: [
        "Bitcoin reacts to big news: interest rates, wars, regulation, banks failing, countries adopting or banning it. It is not magic — it is a global asset tied to risk and trust.",
        "Following geopolitics is not about 'predicting the future'. It is about understanding the climate: why the price shakes, why someone is in a hurry to sell, and why scams use headlines to rush you.",
        "At SatVantage, behavioral friction exists exactly for when the world screams 'urgent'. The decision is still yours — we just ask for calm.",
      ],
      question: "Why does it make sense to follow geopolitics if you hold bitcoin?",
      options: [
        "Because Bitcoin only goes up when there is war",
        "To understand the risk climate and not decide only out of panic",
        "Because the government sets the exact price every day",
        "It does not make sense — news never affects the market",
      ],
      feedbackCorrect: "Exactly — context, not miracle predictions.",
      feedbackWrong: "The point is risk climate and calm decisions.",
    },
    corretora: {
      label: "What an exchange is",
      teach: [
        "An exchange is like an online bitcoin shop: you create an account, send reais (PIX), and buy sats. Easy to start — but the bitcoin stays under its custody, not your keys.",
        "That is useful for buying and selling. The catch: if the exchange freezes, gets hacked, or shuts down, you depend on it. That is why many people, after buying, transfer to their own wallet.",
      ],
      question: "Where are your bitcoins while they are on the exchange?",
      options: [
        "On your private keys, on your phone",
        "Under the exchange's custody — it controls the keys",
        "At the central bank, in a special account",
        "Erased until you withdraw as cash",
      ],
      feedbackCorrect: "Right. On the exchange, custody is theirs.",
      feedbackWrong: "While on the exchange, custody is theirs — not your keys.",
    },
    transferir: {
      label: "How to transfer to your wallet",
      teach: [
        "After buying on an exchange, the sovereignty step is sending to your wallet. In the wallet you generate an address (or Lightning invoice) and paste it on the exchange under 'withdraw' / 'send'.",
        "Always start with a small test amount. Check the network (Bitcoin on-chain vs Lightning) and the address carefully — a typo and the funds may be gone.",
      ],
      question: "What is the safest habit when withdrawing from an exchange to your wallet?",
      options: [
        "Sending everything at once in the largest amount possible",
        "Sending a small test amount first and checking that it arrived",
        "Asking a stranger online to paste the address for you",
        "Using the same address someone posted on Twitter",
      ],
      feedbackCorrect: "Perfect. Small test first.",
      feedbackWrong: "Always test with a little before moving the large amount.",
    },
    "fria-quente": {
      label: "Hot wallet vs cold wallet",
      teach: [
        "A hot wallet stays connected to the internet — an app on your phone or a browser extension. It is practical for day-to-day use and Lightning. The fragile side: the device can be cloned, lost, or infected.",
        "A cold wallet stays offline most of the time — for example a hardware device. It works better for storing larger amounts, with less exposure.",
      ],
      question: "What is the main difference between a hot and a cold wallet?",
      options: [
        "Hot is gold; cold is silver",
        "Hot is usually online (day-to-day); cold stays offline (long-term storage)",
        "Cold only works in cold countries",
        "There is no difference — they are marketing names",
      ],
      feedbackCorrect: "Exactly. Online for daily use vs offline for storage.",
      feedbackWrong: "Hot ≈ online/practical; cold ≈ offline/storage.",
    },
    "imposto-quando": {
      label: "When do I pay tax on bitcoin?",
      teach: [
        "This is educational guidance, not tax advice — rules change and it is best to confirm with a trusted accountant.",
        "In Brazil, the point that comes up most is disposal: selling bitcoin for reais, swapping for another asset, or using it to buy something. In other words, when you 'realize' — not just when the price rises on screen.",
        "Buying and holding, by itself, is generally not the same as realizing a gain. Many people confuse 'having bitcoin' with 'already owing tax right now'. The concern grows when there is a sale, swap, or use of the value.",
        "When there is realization, topics like capital gains, possible exemption limits under current rules, and ancillary obligations come into play. The exact detail changes over time — that is why an accountant matters.",
        "In practice, the habit that helps most: note every purchase and every exit (date, value in reais, amount, where it was — exchange or wallet). Without history, it is hard to calculate the gain calmly later.",
      ],
      inviteDoubt:
        "Any questions? You can ask in your own words — I answer based on what I have already explained.",
      faq: [
        {
          keys: [
            "quando",
            "a partir",
            "pago",
            "pagar",
            "imposto",
            "fato gerador",
            "alienação",
            "vender",
            "venda",
            "realizar",
            "realização",
            "when",
            "start",
            "pay",
            "tax",
            "taxable",
            "sell",
            "sale",
            "realize",
            "realization",
            "trigger",
            "disposal",
          ],
          answer:
            "The moment that usually matters most is realization: selling, swapping, or spending bitcoin. Just buying and holding, as a rule, is not the same trigger. Confirm the current classification with an accountant — law and limits change.",
        },
        {
          keys: [
            "comprar",
            "compra",
            "guardar",
            "hodl",
            "só ter",
            "hold",
            "buy",
            "buying",
            "keep",
            "holding",
            "just have",
            "only hold",
          ],
          answer:
            "Buying and keeping in a wallet or exchange, by itself, is generally not treated as the same event as 'realizing a gain'. The concern increases when you sell, swap, or spend. Even so, it is worth recording history from the purchase.",
        },
        {
          keys: [
            "ganho",
            "capital",
            "lucro",
            "prejuízo",
            "perda",
            "cálculo",
            "calcular",
            "gain",
            "capital gain",
            "profit",
            "loss",
            "calculate",
            "calculation",
          ],
          answer:
            "Capital gain is the difference between what you paid (cost) and what you received on exit. That is why purchase history matters. Losses and offsetting have their own rules — typical accountant territory.",
        },
        {
          keys: [
            "isenção",
            "isento",
            "limite",
            "valor",
            "quanto",
            "exemption",
            "exempt",
            "limit",
            "amount",
            "how much",
          ],
          answer:
            "There are discussions and rules about limits and exemptions on crypto disposals, but the numbers and conditions change. Do not memorize an old blog figure: check the rule in force for the year of the transaction with professional guidance.",
        },
        {
          keys: [
            "histórico",
            "extrato",
            "anotar",
            "registro",
            "planilha",
            "guardar nota",
            "history",
            "statement",
            "record",
            "spreadsheet",
            "track",
            "log",
          ],
          answer:
            "Yes — note date, amount, price in reais, and where the asset was. Exchange statement plus records from your own wallet. That is the basis for filing and sleeping more peacefully.",
        },
        {
          keys: [
            "contador",
            "contadora",
            "advogado",
            "receita",
            "consulta",
            "accountant",
            "lawyer",
            "tax authority",
            "consultation",
          ],
          answer:
            "Perfect. I guide you on vocabulary and organization habits; the person who closes the legal/tax classification is the accountant. Bring statements and a summary of what you bought and sold in the year.",
        },
      ],
    },
    "ir-2027": {
      label: "Do I need to declare bitcoin on 2027 income tax?",
      teach: [
        "Educational guidance — does not replace an accountant. On the income tax return, crypto assets usually appear on the assets and rights form when you hold them on 12/31.",
        "The 2027 return, as a rule, looks at calendar year 2026: what you had at year-end, what you bought, what you sold, and whether there were gains to report under that period's rules.",
        "Healthy habit: know the balance in quantity (BTC/sats) and a reference in reais on the balance date, keep exchange statements, and notes from your own wallet.",
        "Operations throughout the year may need attention beyond the assets form — for example disposal reports or capital gains, depending on the case. The accountant builds what fits your situation.",
        "Early organization avoids a scare in March/April: a folder with PDFs, a simple spreadsheet, and an annual talk with someone who understands crypto.",
      ],
      inviteDoubt:
        "Any questions? You can ask in your own words — I answer based on what I have already explained.",
      faq: [
        {
          keys: [
            "preciso",
            "declarar",
            "obrigatório",
            "ir",
            "2027",
            "2026",
            "imposto de renda",
            "dirpf",
            "need",
            "declare",
            "mandatory",
            "required",
            "income tax",
            "tax return",
            "filing",
          ],
          answer:
            "If you truly held crypto at the end of the relevant calendar year, it generally goes on assets and rights. Operations during the year may require more fields. The definitive 'do I need to?' depends on your case — confirm with an accountant looking at your balances and movements.",
        },
        {
          keys: [
            "bens",
            "direitos",
            "ficha",
            "31/12",
            "saldo",
            "posição",
            "assets",
            "rights",
            "form",
            "12/31",
            "balance",
            "position",
            "holdings",
          ],
          answer:
            "On the assets and rights form you usually report the position you had on 12/31 (amount and reference value). Keep how you arrived at that number: statements and records help justify it.",
        },
        {
          keys: [
            "venda",
            "vendi",
            "operei",
            "operações",
            "movimento",
            "movimentação",
            "sold",
            "sell",
            "traded",
            "operations",
            "movement",
            "transactions",
          ],
          answer:
            "Moving funds (selling/swapping) during the year can create obligations beyond just listing the balance. That is why the full year's history matters, not only the 12/31 snapshot.",
        },
        {
          keys: [
            "extrato",
            "informe",
            "corretora",
            "pdf",
            "comprovante",
            "statement",
            "report",
            "exchange",
            "receipt",
            "proof",
          ],
          answer:
            "Download reports/statements from the exchange and keep them. If you self-custody, complete with your own records. At tax time, that becomes proof of what you declare.",
        },
        {
          keys: [
            "contador",
            "ajuda",
            "como fazer",
            "passo a passo",
            "accountant",
            "help",
            "how to",
            "step by step",
            "guide",
          ],
          answer:
            "Put together a folder for the year (statements + balances on 12/31 + list of sales). Take it to the accountant and ask what goes on assets and rights and what goes on gains. I help you organize the question; they close the return.",
        },
      ],
    },
    "patrimonio-crypto": {
      label: "How does bitcoin fit into my wealth?",
      teach: [
        "Wealth, in simple terms, is what you have minus what you owe. Bitcoin on an exchange or in a wallet counts as an asset — something you own, with a value that swings in reais every day.",
        "Two useful ways to see it: (1) quantity in BTC/sats — what you actually control; (2) reference in reais on a date — to talk with the bank, family, or on a tax return.",
        "Custody changes the risk of your wealth: on an exchange, you depend on it; in your own wallet, you depend on protecting the key/seed. Wealth without a recovery plan is fragile wealth.",
        "Do not mix a dream of future price with today's wealth. Conscious wealth answers: how much do I have, where is it, and can I recover if I lose my phone.",
        "At SatVantage the thesis is educate, protect, and organize — so wealth truly stays with you.",
        "Inheritance and succession are also part of family wealth: knowing who can access the keys (carefully) avoids drama. That is a topic we go deeper into later, calmly.",
      ],
      inviteDoubt:
        "Any questions? You can ask in your own words — I answer based on what I have already explained.",
      faq: [
        {
          keys: [
            "o que é",
            "patrimônio",
            "como entra",
            "ativo",
            "bem",
            "what is",
            "wealth",
            "net worth",
            "how does it fit",
            "asset",
            "property",
          ],
          answer:
            "Bitcoin counts as an asset in your wealth: something you own. Note quantity + where it is custodied + a reference in reais when you need to discuss values.",
        },
        {
          keys: [
            "reais",
            "valor",
            "preço",
            "cotação",
            "quanto vale",
            "reais",
            "value",
            "price",
            "quote",
            "worth",
            "how much",
          ],
          answer:
            "The value in reais changes with the quote. That is why many people track quantity first (sats/BTC) and only then convert to reais on a date (e.g. 12/31 or month-end).",
        },
        {
          keys: [
            "carteira",
            "corretora",
            "custódia",
            "onde",
            "guarda",
            "wallet",
            "exchange",
            "custody",
            "where",
            "store",
            "hold",
          ],
          answer:
            "On the exchange, custody is theirs. In your wallet, custody is yours (and responsibility for the seed too). Both count in your wealth, but operational risk is different.",
        },
        {
          keys: [
            "seed",
            "chave",
            "perder",
            "celular",
            "recuperar",
            "segurança",
            "key",
            "lose",
            "phone",
            "recover",
            "security",
            "backup",
          ],
          answer:
            "If the key/seed is lost and there is no secure backup, the asset may become inaccessible — and then 'wealth' disappears in practice. Offline backup, no photo in the cloud, never send to strangers.",
        },
        {
          keys: [
            "herança",
            "morrer",
            "família",
            "sucessão",
            "herdeiro",
            "inheritance",
            "die",
            "death",
            "family",
            "succession",
            "heir",
          ],
          answer:
            "Wealth in bitcoin needs a succession plan: who knows it exists, how to access it safely, and documentation. Without that, the family may not recover it. That is one of the pillars SatVantage wants to organize over time.",
        },
        {
          keys: [
            "dívida",
            "passivo",
            "menos o que deve",
            "debt",
            "liability",
            "owe",
            "net",
          ],
          answer:
            "Net wealth = assets − debts. Bitcoin increases the asset side; loans and credit cards go on the other side. Look at both so you do not fool yourself with BTC price alone.",
        },
      ],
    },
    "informe-corretora": {
      label: "Does the exchange give me a tax report?",
      teach: [
        "Brazilian exchanges usually offer statements and, in many cases, reports that help with filing. That is support — the responsibility to declare remains yours.",
        "The exchange report covers what went through it. If you moved to your own wallet, the exchange does not 'see' that portion after withdrawal. Then the record is yours.",
        "Good end-of-year flow: download PDFs/CSV, save in an 'tax + crypto' folder, note balances on 12/31, and list important sales.",
        "If you use more than one exchange, gather all reports. If you mix exchange + self-custody, combine both views before talking to the accountant.",
        "Common scam: fake 'support' asking for account access to 'generate a report'. Download the report only in the official exchange logged-in area — never via a suspicious message link.",
        "When in doubt about asset codes, classification, or gains, an accountant who understands crypto avoids rework and fines. I help you ask the right questions.",
      ],
      inviteDoubt:
        "Any questions? You can ask in your own words — I answer based on what I have already explained.",
      faq: [
        {
          keys: [
            "informe",
            "extrato",
            "pdf",
            "baixar",
            "onde",
            "como pegar",
            "report",
            "statement",
            "download",
            "where",
            "how to get",
          ],
          answer:
            "It is usually in the exchange logged-in area (reports, taxes, statements). Download and archive. If you cannot find it, use official app/site support — never an 'agent' who contacted you on WhatsApp.",
        },
        {
          keys: [
            "carteira",
            "própria",
            "self",
            "fria",
            "saiu",
            "saquei",
            "wallet",
            "own",
            "self-custody",
            "cold",
            "left",
            "withdrew",
            "withdrawal",
          ],
          answer:
            "After bitcoin leaves the exchange, its report does not track what happens in your wallet. Continue the history on your own (dates, amounts, values).",
        },
        {
          keys: [
            "várias",
            "mais de uma",
            "binance",
            "mercado",
            "foxbit",
            "duas corretoras",
            "several",
            "more than one",
            "multiple",
            "two exchanges",
          ],
          answer:
            "Gather reports from each exchange. The accountant needs the full picture, not just one exchange.",
        },
        {
          keys: [
            "responsabilidade",
            "obrigação",
            "minha",
            "deles",
            "responsibility",
            "obligation",
            "mine",
            "theirs",
            "who declares",
          ],
          answer:
            "The exchange helps with data; declaring is your commitment. Treat the report as a tool, not as 'they already handle everything'.",
        },
        {
          keys: [
            "golpe",
            "suporte",
            "whatsapp",
            "telegram",
            "link",
            "scam",
            "support",
            "fake",
            "phishing",
          ],
          answer:
            "No legitimate support asks for seed, 2FA code, or remote access to 'generate a tax report'. Download the report only on the official site/app after your login.",
        },
        {
          keys: [
            "contador",
            "ajuda",
            "declarar",
            "accountant",
            "help",
            "declare",
            "file",
            "filing",
          ],
          answer:
            "Bring reports + statements + notes on what is in your own wallet. Ask what goes on assets and rights and what goes on gains. That makes the conversation productive.",
        },
      ],
    },
  },
  es: {
    patrimonio: {
      label: "Cómo construir tu primer patrimonio",
      teach: [
        "El patrimonio empieza pequeño y constante: guardar una parte de lo que entra antes de gastar el resto. Con Bitcoin, mucha gente usa la regla de comprar poco con frecuencia (promedio de precio), en lugar de intentar 'acertar el fondo'.",
        "El primer patrimonio en sats no tiene que ser grande. Lo que importa es el hábito más la seguridad: saber dónde está la clave, no caer en estafas y no vender todo en el primer susto del mercado.",
        "En SatVantage la idea es educar antes de acelerar. Cuando entiendes lo básico, cada sat que guardas tiene más chance de quedarse contigo de verdad.",
      ],
      question: "¿Qué hábito ayuda más al primer patrimonio en Bitcoin?",
      options: [
        "Esperar el precio 'perfecto' para comprar todo de una vez",
        "Guardar con frecuencia, aunque sean montos pequeños, y proteger la clave",
        "Seguir el tip de un desconocido que promete ganancia garantizada",
        "Dejar todo en el exchange para siempre, sin aprender",
      ],
      feedbackCorrect: "Exacto — constancia y custodia consciente.",
      feedbackWrong: "Piensa en hábito frecuente más seguridad de la clave.",
    },
    comprar: {
      label: "Cómo comprar bitcoin",
      teach: [
        "El camino más común en Brasil: abrir cuenta en un exchange, enviar PIX en reales y comprar bitcoin. Es la 'puerta de entrada'. Después, lo ideal es aprender a sacarlo a tu cartera.",
        "Cuidado con comisiones, horarios y estafas de 'soporte'. Compra solo lo que entiendes. En la red de prueba de SatVantage entrenas el vocabulario sin arriesgar dinero real.",
        "Comprar es solo el primer paso. Guardar con seguridad y no dejarte llevar por la urgencia importa tanto como el precio del día.",
      ],
      question: "Después de comprar en el exchange, ¿qué aumenta tu soberanía?",
      options: [
        "Dejarlo para siempre en el exchange y olvidar",
        "Aprender a transferir a una cartera bajo tu control",
        "Enviar el monto a quien prometió duplicarlo",
        "Publicar la seed en Instagram para 'backup social'",
      ],
      feedbackCorrect: "Exacto — el exchange compra; la cartera propia guarda.",
      feedbackWrong: "Soberanía = tú con la clave, después de comprar.",
    },
    geopolitica: {
      label: "Geopolítica y por qué seguirla",
      teach: [
        "Bitcoin reacciona a noticias grandes: tasas, guerras, regulación, bancos que quiebran, países que adoptan o prohíben. No es magia — es un activo global ligado al riesgo y la confianza.",
        "Seguir la geopolítica no es para 'predecir el futuro'. Es para entender el clima: por qué tiembla el precio, por qué alguien tiene prisa por vender, y por qué las estafas usan titulares para apurarte.",
        "En SatVantage, la fricción conductual existe justamente cuando el mundo grita 'urgente'. La decisión sigue siendo tuya — solo pedimos calma.",
      ],
      question: "¿Por qué tiene sentido seguir la geopolítica si guardas bitcoin?",
      options: [
        "Porque Bitcoin solo sube cuando hay guerra",
        "Para entender el clima de riesgo y no decidir solo por el susto",
        "Porque el gobierno fija el precio exacto cada día",
        "No tiene sentido — las noticias nunca afectan el mercado",
      ],
      feedbackCorrect: "Exacto — contexto, no predicciones milagrosas.",
      feedbackWrong: "El punto es clima de riesgo y decisión con calma.",
    },
    corretora: {
      label: "Qué es un exchange",
      teach: [
        "Un exchange es como una tienda online de bitcoin: creas cuenta, mandas reales (PIX) y compras sats. Fácil para empezar — pero los bitcoins quedan bajo su custodia, no en tus claves.",
        "Eso sirve para comprar y vender. El cuidado: si el exchange se traba, es hackeado o cierra, dependes de él. Por eso mucha gente, después de comprar, transfiere a su propia cartera.",
      ],
      question: "¿Dónde están tus bitcoins mientras están en el exchange?",
      options: [
        "En tus claves privadas, en tu celular",
        "Bajo custodia del exchange — él controla las claves",
        "En el banco central, en una cuenta especial",
        "Borrados hasta que saques en efectivo",
      ],
      feedbackCorrect: "Exacto. En el exchange, la custodia es de ellos.",
      feedbackWrong: "Mientras está en el exchange, la custodia es de ellos — no tus claves.",
    },
    transferir: {
      label: "Cómo transferir a la cartera",
      teach: [
        "Después de comprar en el exchange, el paso de soberanía es enviar a tu cartera. En la cartera generas una dirección (o invoice Lightning) y la pegas en el exchange en 'retirar' / 'enviar'.",
        "Siempre empieza con un monto pequeño de prueba. Revisa la red (Bitcoin on-chain vs Lightning) y la dirección con calma — un error de tipeo y el valor puede irse.",
      ],
      question: "¿Cuál es el hábito más seguro al retirar del exchange a la cartera?",
      options: [
        "Enviar todo de una vez en el mayor monto posible",
        "Mandar primero un monto pequeño de prueba y confirmar que llegó",
        "Pedirle a un desconocido en internet que pegue la dirección por ti",
        "Usar la misma dirección que alguien publicó en Twitter",
      ],
      feedbackCorrect: "Perfecto. Prueba pequeña primero.",
      feedbackWrong: "Siempre prueba con poco antes de mover el monto grande.",
    },
    "fria-quente": {
      label: "Cartera caliente vs cartera fría",
      teach: [
        "La cartera caliente está conectada a internet — app en el celular o extensión. Es práctica para el día a día y Lightning. Lo frágil: el dispositivo puede clonarse, perderse o infectarse.",
        "La cartera fría queda offline la mayor parte del tiempo — por ejemplo un dispositivo hardware. Sirve mejor para guardar montos mayores, con menos exposición.",
      ],
      question: "¿Cuál es la diferencia principal entre cartera caliente y fría?",
      options: [
        "Caliente es de oro; fría es de plata",
        "Caliente suele estar online (día a día); fría queda offline (guarda mayor)",
        "Fría solo funciona en países fríos",
        "No hay diferencia — son nombres de marketing",
      ],
      feedbackCorrect: "Exacto. Online en el día a día vs offline para guardar.",
      feedbackWrong: "Caliente ≈ online/práctica; fría ≈ offline/guarda.",
    },
    "imposto-quando": {
      label: "¿A partir de cuándo pago impuesto sobre bitcoin?",
      teach: [
        "Esto es orientación educativa, no consultoría tributaria — las reglas cambian y lo ideal es confirmar con un contador de confianza.",
        "En Brasil, el punto que más aparece es la enajenación: vender bitcoin por reales, cambiar por otro activo o usarlo para comprar algo. Es decir, cuando 'realizas' — no solo cuando el precio sube en pantalla.",
        "Comprar y guardar, por sí solo, en general no es lo mismo que realizar una ganancia. Mucha gente confunde 'tener bitcoin' con 'ya tener que pagar impuesto ahora'. El cuidado crece cuando hay venta, cambio o uso del valor.",
        "Cuando hay realización, entran temas como ganancia de capital, posibles límites de exención según la regla vigente, y obligaciones accesorias. El detalle exacto cambia con el tiempo — por eso importa el contador.",
        "En la práctica, el hábito que más ayuda: anotar cada compra y cada salida (fecha, valor en reales, cantidad, dónde estaba — exchange o cartera). Sin historial, cuesta calcular la ganancia con tranquilidad después.",
      ],
      inviteDoubt:
        "¿Quedó alguna duda? Puedes preguntar con tus palabras — respondo con base en lo que ya expliqué.",
      faq: [
        {
          keys: [
            "quando",
            "a partir",
            "pago",
            "pagar",
            "imposto",
            "fato gerador",
            "alienação",
            "vender",
            "venda",
            "realizar",
            "realização",
            "cuándo",
            "cuando",
            "desde",
            "pago",
            "pagar",
            "impuesto",
            "vender",
            "venta",
            "realizar",
            "realización",
            "hecho generador",
          ],
          answer:
            "El momento que más pesa suele ser la realización: vender, cambiar o usar el bitcoin. Solo comprar y guardar, por regla, no es el mismo disparador. Confirma el encuadre actual con un contador — la ley y los límites cambian.",
        },
        {
          keys: [
            "comprar",
            "compra",
            "guardar",
            "hodl",
            "só ter",
            "hold",
            "comprar",
            "compra",
            "guardar",
            "mantener",
            "solo tener",
            "hold",
          ],
          answer:
            "Comprar y mantener en cartera/exchange, por sí solo, en general no se trata como el mismo evento de 'realizar ganancia'. El cuidado aumenta cuando vendes, cambias o gastas. Aun así, vale registrar el historial desde la compra.",
        },
        {
          keys: [
            "ganho",
            "capital",
            "lucro",
            "prejuízo",
            "perda",
            "cálculo",
            "calcular",
            "ganancia",
            "capital",
            "lucro",
            "pérdida",
            "cálculo",
            "calcular",
          ],
          answer:
            "La ganancia de capital es la diferencia entre lo que pagaste (costo) y lo que recibiste en la salida. Por eso importa el historial de compras. Pérdida y compensación tienen reglas propias — tema típico de contador.",
        },
        {
          keys: [
            "isenção",
            "isento",
            "limite",
            "valor",
            "quanto",
            "exención",
            "exento",
            "límite",
            "valor",
            "cuánto",
          ],
          answer:
            "Existen discusiones y reglas sobre límites y exenciones en enajenaciones de cripto, pero los números y condiciones cambian. No memorices un valor de blog viejo: confirma la regla vigente en el año de la operación con orientación profesional.",
        },
        {
          keys: [
            "histórico",
            "extrato",
            "anotar",
            "registro",
            "planilha",
            "guardar nota",
            "historial",
            "extracto",
            "anotar",
            "registro",
            "planilla",
            "guardar nota",
          ],
          answer:
            "Sí — anota fecha, cantidad, precio en reales y dónde estaba el activo. Extracto del exchange más registros de la cartera propia. Esa es la base para declarar y dormir más tranquilo.",
        },
        {
          keys: [
            "contador",
            "contadora",
            "advogado",
            "receita",
            "consulta",
            "contador",
            "contadora",
            "abogado",
            "hacienda",
            "consulta",
          ],
          answer:
            "Perfecto. Te oriento en vocabulario y hábito de organización; quien cierra el encuadre legal/tributario es el contador. Lleva extractos y un resumen de lo que compraste y vendiste en el año.",
        },
      ],
    },
    "ir-2027": {
      label: "¿Debo declarar bitcoin en el IR 2027?",
      teach: [
        "Orientación educativa — no sustituye contador. En la declaración de Impuesto sobre la Renta, los criptoactivos suelen aparecer en la ficha de bienes y derechos cuando los posees el 31/12.",
        "El IR de 2027, por regla, mira el año calendario 2026: lo que tenías a fin de año, lo que compraste, lo que vendiste y si hubo ganancias que informar según las reglas de ese período.",
        "Hábito sano: saber el saldo en cantidad (BTC/sats) y una referencia en reales en la fecha del balance, guardar extractos del exchange y anotaciones de la cartera propia.",
        "Operaciones a lo largo del año pueden exigir atención más allá de la ficha de bienes — por ejemplo informes de enajenación o ganancia de capital, según el caso. El contador arma lo que cabe en tu realidad.",
        "Organización anticipada evita susto en marzo/abril: carpeta con PDFs, planilla simple y una charla anual con quien entiende cripto.",
      ],
      inviteDoubt:
        "¿Quedó alguna duda? Puedes preguntar con tus palabras — respondo con base en lo que ya expliqué.",
      faq: [
        {
          keys: [
            "preciso",
            "declarar",
            "obrigatório",
            "ir",
            "2027",
            "2026",
            "imposto de renda",
            "dirpf",
            "debo",
            "declarar",
            "obligatorio",
            "ir",
            "2027",
            "2026",
            "impuesto sobre la renta",
            "declaración",
          ],
          answer:
            "Si tenías cripto de verdad al final del año calendario relevante, en general entra en bienes y derechos. Operaciones en el año pueden pedir más campos. El '¿debo?' definitivo depende de tu caso — confirma con contador mirando tus saldos y movimientos.",
        },
        {
          keys: [
            "bens",
            "direitos",
            "ficha",
            "31/12",
            "saldo",
            "posição",
            "bienes",
            "derechos",
            "ficha",
            "31/12",
            "saldo",
            "posición",
          ],
          answer:
            "En la ficha de bienes y derechos sueles informar la posición que tenías el 31/12 (cantidad y valor de referencia). Guarda cómo llegaste a ese número: extractos y registros ayudan a justificar.",
        },
        {
          keys: [
            "venda",
            "vendi",
            "operei",
            "operações",
            "movimento",
            "movimentação",
            "venta",
            "vendí",
            "operé",
            "operaciones",
            "movimiento",
            "movimentación",
          ],
          answer:
            "Mover (vender/cambiar) en el año puede generar obligaciones más allá de solo listar el saldo. Por eso importa el historial del año entero, no solo la foto del 31/12.",
        },
        {
          keys: [
            "extrato",
            "informe",
            "corretora",
            "pdf",
            "comprovante",
            "extracto",
            "informe",
            "exchange",
            "corretora",
            "pdf",
            "comprobante",
          ],
          answer:
            "Descarga informes/extractos del exchange y guárdalos. Si tienes autocustodia, completa con tus registros. A la hora del IR, eso se vuelve prueba de lo que declaras.",
        },
        {
          keys: [
            "contador",
            "ajuda",
            "como fazer",
            "passo a passo",
            "contador",
            "ayuda",
            "cómo hacer",
            "paso a paso",
          ],
          answer:
            "Arma una carpeta del año (extractos + saldos al 31/12 + lista de ventas). Llévala al contador y pregunta qué va en bienes y derechos y qué va en ganancias. Te ayudo a organizar la pregunta; él cierra la declaración.",
        },
      ],
    },
    "patrimonio-crypto": {
      label: "¿Cómo entra el bitcoin en mi patrimonio?",
      teach: [
        "Patrimonio, en lenguaje simple, es lo que tienes menos lo que debes. Bitcoin en el exchange o en la cartera entra como activo — un bien tuyo, con valor que oscila en reales cada día.",
        "Dos formas útiles de verlo: (1) cantidad en BTC/sats — lo que de verdad controlas; (2) referencia en reales en una fecha — para hablar con banco, familia o declaración.",
        "La custodia cambia el riesgo del patrimonio: en el exchange, dependes de él; en tu cartera, dependes de proteger la clave/seed. Patrimonio sin plan de recuperación es patrimonio frágil.",
        "No mezcles sueño de precio futuro con patrimonio de hoy. Patrimonio consciente responde: cuánto tengo, dónde está, y si puedo recuperar si pierdo el celular.",
        "En SatVantage la tesis es educar, proteger y organizar — para que el patrimonio se quede contigo de verdad.",
        "Herencia y sucesión también forman parte del patrimonio familiar: saber quién accede a las claves (con cuidado) evita drama. Es un tema que profundizamos después, con calma.",
      ],
      inviteDoubt:
        "¿Quedó alguna duda? Puedes preguntar con tus palabras — respondo con base en lo que ya expliqué.",
      faq: [
        {
          keys: [
            "o que é",
            "patrimônio",
            "como entra",
            "ativo",
            "bem",
            "qué es",
            "patrimonio",
            "cómo entra",
            "activo",
            "bien",
          ],
          answer:
            "Bitcoin cuenta como activo en tu patrimonio: algo que tienes. Anota cantidad + dónde está custodiado + una referencia en reales cuando necesites conversar valores.",
        },
        {
          keys: [
            "reais",
            "valor",
            "preço",
            "cotação",
            "quanto vale",
            "reales",
            "valor",
            "precio",
            "cotización",
            "cuánto vale",
          ],
          answer:
            "El valor en reales cambia con la cotización. Por eso mucha gente controla primero la cantidad (sats/BTC) y solo después convierte a reales en una fecha (ej.: 31/12 o fin de mes).",
        },
        {
          keys: [
            "carteira",
            "corretora",
            "custódia",
            "onde",
            "guarda",
            "cartera",
            "exchange",
            "corretora",
            "custodia",
            "dónde",
            "guarda",
          ],
          answer:
            "En el exchange, la custodia es de ellos. En tu cartera, la custodia es tuya (y la responsabilidad de la seed también). Ambos entran en el patrimonio, pero el riesgo operacional es distinto.",
        },
        {
          keys: [
            "seed",
            "chave",
            "perder",
            "celular",
            "recuperar",
            "segurança",
            "seed",
            "clave",
            "perder",
            "celular",
            "recuperar",
            "seguridad",
          ],
          answer:
            "Si la clave/seed se pierde y no hay backup seguro, el activo puede quedar inaccesible — y entonces el 'patrimonio' desaparece en la práctica. Backup offline, sin foto en la nube, sin mandar a desconocidos.",
        },
        {
          keys: [
            "herança",
            "morrer",
            "família",
            "sucessão",
            "herdeiro",
            "herencia",
            "morir",
            "familia",
            "sucesión",
            "heredero",
          ],
          answer:
            "Patrimonio en bitcoin necesita plan de sucesión: quién sabe que existe, cómo acceder con seguridad, y documentación. Sin eso, la familia puede no recuperar. Es uno de los pilares que SatVantage quiere organizar con el tiempo.",
        },
        {
          keys: [
            "dívida",
            "passivo",
            "menos o que deve",
            "deuda",
            "pasivo",
            "menos lo que debes",
          ],
          answer:
            "Patrimonio neto = activos − deudas. Bitcoin aumenta el lado de activos; préstamos y tarjeta entran del otro lado. Mira ambos para no ilusionarte solo con el precio del BTC.",
        },
      ],
    },
    "informe-corretora": {
      label: "¿El exchange me da informe para el IR?",
      teach: [
        "Los exchanges brasileños suelen ofrecer extractos y, en muchos casos, informes que ayudan en la declaración. Eso es apoyo — la responsabilidad de declarar sigue siendo tuya.",
        "El informe del exchange cubre lo que pasó por él. Si sacaste a tu cartera propia, el exchange no 've' ese pedazo después de la salida. Ahí el registro es tuyo.",
        "Buen flujo a fin de año: bajar PDFs/CSV, guardar en carpeta 'IR + cripto', anotar saldos al 31/12 y listar ventas importantes.",
        "Si usas más de un exchange, junta todos los informes. Si mezclas exchange + autocustodia, suma las dos visiones antes de hablar con el contador.",
        "Estafa común: falso 'soporte' pidiendo acceso a la cuenta para 'generar informe'. El informe se baja en el área logueada del exchange oficial — nunca por link de mensaje sospechoso.",
        "En duda de código de bien, encuadre o ganancia, contador que entiende cripto evita retrabajo y multa. Te ayudo a armar las preguntas correctas.",
      ],
      inviteDoubt:
        "¿Quedó alguna duda? Puedes preguntar con tus palabras — respondo con base en lo que ya expliqué.",
      faq: [
        {
          keys: [
            "informe",
            "extrato",
            "pdf",
            "baixar",
            "onde",
            "como pegar",
            "informe",
            "extracto",
            "pdf",
            "bajar",
            "dónde",
            "cómo obtener",
          ],
          answer:
            "En general está en el área logueada del exchange (reportes, impuestos, extractos). Baja y archiva. Si no lo encuentras, soporte oficial del app/sitio — nunca un 'agente' que te escribió por WhatsApp.",
        },
        {
          keys: [
            "carteira",
            "própria",
            "self",
            "fria",
            "saiu",
            "saquei",
            "cartera",
            "propia",
            "self",
            "fría",
            "salió",
            "saqué",
            "retiré",
          ],
          answer:
            "Después de que el bitcoin sale del exchange, su informe no acompaña lo que pasa en tu cartera. Continúa el historial por cuenta propia (fechas, cantidades, valores).",
        },
        {
          keys: [
            "várias",
            "mais de uma",
            "binance",
            "mercado",
            "foxbit",
            "duas corretoras",
            "varias",
            "más de una",
            "binance",
            "mercado",
            "foxbit",
            "dos exchanges",
          ],
          answer:
            "Junta los informes de cada exchange. El contador necesita la foto completa, no solo de un exchange.",
        },
        {
          keys: [
            "responsabilidade",
            "obrigação",
            "minha",
            "deles",
            "responsabilidad",
            "obligación",
            "mía",
            "de ellos",
          ],
          answer:
            "El exchange facilita con datos; declarar es tu compromiso. Trata el informe como herramienta, no como 'ellos ya resuelven todo'.",
        },
        {
          keys: [
            "golpe",
            "suporte",
            "whatsapp",
            "telegram",
            "link",
            "estafa",
            "soporte",
            "whatsapp",
            "telegram",
            "link",
          ],
          answer:
            "Nadie de soporte legítimo pide seed, código 2FA o acceso remoto para 'generar IR'. Baja el informe solo en el sitio/app oficial tras tu login.",
        },
        {
          keys: [
            "contador",
            "ajuda",
            "declarar",
            "contador",
            "ayuda",
            "declarar",
          ],
          answer:
            "Lleva informes + extractos + anotación de lo que está en la cartera propia. Pregunta qué va en bienes y derechos y qué va en ganancias. Así la charla rinde.",
        },
      ],
    },
  },
};

export function parseTopicLocale(raw: string | null | undefined): TopicLocale {
  if (raw === "en" || raw === "es" || raw === "pt") return raw;
  return "pt";
}

export function localizeTopic(topic: OptionalTopic, locale: TopicLocale): OptionalTopic {
  if (locale === "pt") return topic;
  const pack = TOPIC_I18N[locale]?.[topic.id];
  if (!pack) return topic;
  return {
    ...topic,
    label: pack.label,
    teach: pack.teach,
    question: pack.question ?? topic.question,
    options: pack.options ?? topic.options,
    feedbackCorrect: pack.feedbackCorrect ?? topic.feedbackCorrect,
    feedbackWrong: pack.feedbackWrong ?? topic.feedbackWrong,
    inviteDoubt: pack.inviteDoubt ?? topic.inviteDoubt,
    faq: pack.faq ?? topic.faq,
  };
}

export const EMPTY_DOUBT: Record<TopicLocale, string> = {
  pt: "Pode escrever sua dúvida com suas palavras — por exemplo sobre imposto, declaração ou carteira.",
  en: "You can write your question in your own words — for example about tax, filing, or wallets.",
  es: "Puedes escribir tu duda con tus palabras — por ejemplo sobre impuestos, declaración o cartera.",
};

export const NO_MATCH_DOUBT: Record<TopicLocale, string> = {
  pt: "Não peguei um encaixe claro com o que tenho neste assunto. Tente perguntar com outras palavras (por exemplo: imposto na venda, declarar no IR, extrato da corretora, carteira própria). E lembre: sou orientação educativa — para fechar o seu caso, um contador ajuda.",
  en: "I could not clearly match that to this topic. Try other words (for example: tax on sale, filing income tax, exchange statement, your own wallet). Reminder: this is educational guidance — an accountant helps for your specific case.",
  es: "No encontré un encaje claro con este tema. Prueba con otras palabras (por ejemplo: impuesto al vender, declarar en la renta, extracto del exchange, cartera propia). Recuerda: es orientación educativa — un contador ayuda a cerrar tu caso.",
};
