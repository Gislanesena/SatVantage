/** Tópicos opcionais — conversa educativa SEM sats de missão. */

export type TopicFaq = {
  /** Palavras/frases que disparam esta resposta */
  keys: string[];
  answer: string;
};

export type OptionalTopic = {
  id: string;
  label: string;
  teach: string[];
  /** quiz = múltipla escolha · converse = bate-papo com dúvidas livres */
  mode?: "quiz" | "converse";
  question?: string;
  options?: string[];
  correct?: number;
  feedbackCorrect?: string;
  feedbackWrong?: string;
  /** Convite após a explicação (modo converse) */
  inviteDoubt?: string;
  /** Banco de respostas por palavras-chave (modo converse) */
  faq?: TopicFaq[];
};

function quiz(
  partial: Omit<OptionalTopic, "mode"> & {
    question: string;
    options: string[];
    correct: number;
    feedbackCorrect: string;
    feedbackWrong: string;
  },
): OptionalTopic {
  return { mode: "quiz", ...partial };
}

function converse(
  partial: Omit<OptionalTopic, "mode"> & {
    inviteDoubt?: string;
    faq: TopicFaq[];
  },
): OptionalTopic {
  return {
    mode: "converse",
    inviteDoubt:
      partial.inviteDoubt ??
      "Ficou alguma dúvida? Pode perguntar com suas palavras — eu respondo com base no que já expliquei.",
    ...partial,
  };
}

export const OPTIONAL_TOPICS: OptionalTopic[] = [
  quiz({
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
  }),
  quiz({
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
  }),
  quiz({
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
  }),
  quiz({
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
  }),
  quiz({
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
  }),
  quiz({
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
    feedbackCorrect: "Exato. Online no dia a dia vs offline para guarda.",
    feedbackWrong: "Quente ≈ online/prática; fria ≈ offline/guarda.",
  }),

  converse({
    id: "imposto-quando",
    label: "A partir de quando eu pago imposto sobre bitcoin?",
    teach: [
      "Isso é orientação educativa, não consultoria tributária — regras mudam e o ideal é confirmar com um contador de confiança.",
      "No Brasil, o ponto que mais aparece na conversa é a alienação: vender bitcoin por reais, trocar por outro ativo ou usar para comprar algo. Ou seja, quando você 'realiza' — não só quando o preço sobe na tela.",
      "Comprar e guardar, por si só, em geral não é o mesmo que realizar um ganho. Muita gente confunde 'ter bitcoin' com 'já ter que pagar imposto na hora'. O cuidado cresce quando há venda, troca ou uso do valor.",
      "Quando há realização, entram temas como ganho de capital, possíveis limites de isenção conforme a regra vigente, e obrigações acessórias. O detalhe exato muda com o tempo — por isso o contador importa.",
      "Na prática, o hábito que mais ajuda: anotar cada compra e cada saída (data, valor em reais, quantidade, onde estava — corretora ou carteira). Sem histórico, fica difícil calcular o ganho com tranquilidade depois.",
    ],
    faq: [
      {
        keys: ["quando", "a partir", "pago", "pagar", "imposto", "fato gerador", "alienação", "vender", "venda", "realizar", "realização"],
        answer:
          "O momento que mais pesa costuma ser a realização: vender, trocar ou usar o bitcoin. Só comprar e guardar, em regra, não é o mesmo gatilho. Confirme o enquadramento atual com um contador — a lei e os limites mudam.",
      },
      {
        keys: ["comprar", "compra", "guardar", "hodl", "só ter", "hold"],
        answer:
          "Comprar e manter na carteira/corretora, por si só, em geral não é tratado como o mesmo evento de 'realizar ganho'. O cuidado aumenta quando você vende, troca ou gasta. Mesmo assim, vale registrar o histórico desde a compra.",
      },
      {
        keys: ["ganho", "capital", "lucro", "prejuízo", "perda", "cálculo", "calcular"],
        answer:
          "Ganho de capital é a diferença entre o que você pagou (custo) e o que recebeu na saída. Por isso o histórico de compras importa. Prejuízo e compensação têm regras próprias — assunto típico de contador.",
      },
      {
        keys: ["isenção", "isento", "limite", "valor", "quanto"],
        answer:
          "Existem discussões e regras sobre limites e isenções em alienações de cripto, mas os números e condições mudam. Não decore um valor de blog antigo: confira a regra vigente no ano da operação com orientação profissional.",
      },
      {
        keys: ["histórico", "extrato", "anotar", "registro", "planilha", "guardar nota"],
        answer:
          "Sim — anote data, quantidade, preço em reais e onde estava o ativo. Extrato da corretora + registros da carteira própria. Isso é a base para declarar e dormir mais tranquilo.",
      },
      {
        keys: ["contador", "contadora", "advogado", "receita", "consulta"],
        answer:
          "Perfeito. Eu te oriento no vocabulário e no hábito de organização; quem fecha o enquadramento legal/tributário é o contador. Leve extratos e um resumo do que comprou e vendeu no ano.",
      },
    ],
  }),

  converse({
    id: "ir-2027",
    label: "Preciso declarar bitcoin no IR 2027?",
    teach: [
      "Orientação educativa — não substitui contador. Na declaração de Imposto de Renda, criptoativos costumam aparecer na ficha de bens e direitos quando você os possui em 31/12.",
      "O IR de 2027, em regra, olha o ano-calendário de 2026: o que você tinha no fim do ano, o que comprou, o que vendeu e se houve ganhos a informar conforme as regras daquele período.",
      "Hábito saudável: saber o saldo em quantidade (BTC/sats) e uma referência em reais na data do balanço, guardar extratos da corretora e anotações da carteira própria.",
      "Operações ao longo do ano podem exigir atenção além da ficha de bens — por exemplo informes de alienação ou ganho de capital, dependendo do caso. O contador monta o que cabe na sua realidade.",
      "Organização antecipada evita susto em março/abril: pasta com PDFs, planilha simples e uma conversa anual com quem entende cripto.",
    ],
    faq: [
      {
        keys: ["preciso", "declarar", "obrigatório", "ir", "2027", "2026", "imposto de renda", "dirpf"],
        answer:
          "Se você tinha cripto de verdade no fim do ano-calendário relevante, em geral entra em bens e direitos. Operações no ano podem pedir mais campos. O 'preciso?' definitivo depende do seu caso — confirme com contador olhando seus saldos e movimentações.",
      },
      {
        keys: ["bens", "direitos", "ficha", "31/12", "saldo", "posição"],
        answer:
          "Na ficha de bens e direitos você costuma informar a posição que tinha em 31/12 (quantidade e valor de referência). Guarde como chegou naquele número: extratos e registros ajudam a justificar.",
      },
      {
        keys: ["venda", "vendi", "operei", "operações", "movimento", "movimentação"],
        answer:
          "Movimentar (vender/trocar) no ano pode gerar obrigações além de só listar o saldo. Por isso o histórico do ano inteiro importa, não só a foto de 31/12.",
      },
      {
        keys: ["extrato", "informe", "corretora", "pdf", "comprovante"],
        answer:
          "Baixe informes/extratos da corretora e guarde. Se tiver self-custody, complete com seus registros. Na hora do IR, isso vira a prova do que você declara.",
      },
      {
        keys: ["contador", "ajuda", "como fazer", "passo a passo"],
        answer:
          "Monte uma pasta do ano (extratos + saldos em 31/12 + lista de vendas). Leve ao contador e pergunte o que vai em bens e direitos e o que vai em ganhos. Eu te ajudo a organizar a pergunta; ele fecha a declaração.",
      },
    ],
  }),

  converse({
    id: "patrimonio-crypto",
    label: "Como o bitcoin entra no meu patrimônio?",
    teach: [
      "Patrimônio, em linguagem simples, é o que você tem menos o que deve. Bitcoin na corretora ou na carteira entra como ativo — um bem seu, com valor que oscila em reais todo dia.",
      "Duas formas úteis de enxergar: (1) quantidade em BTC/sats — o que de fato você controla; (2) referência em reais numa data — para conversar com banco, família ou declaração.",
      "Custódia muda o risco do patrimônio: na corretora, você depende dela; na carteira própria, você depende de proteger a chave/seed. Patrimônio sem plano de recuperação é patrimônio frágil.",
      "Não misture sonho de preço futuro com patrimônio de hoje. Patrimônio consciente responde: quanto tenho, onde está, e se consigo recuperar se perder o celular.",
      "No SatVantage a tese é educar, proteger e organizar — para o patrimônio ficar com você de verdade.",
      "Herança e sucessão também fazem parte do patrimônio familiar: saber quem acessa as chaves (com cuidado) evita drama. Isso é tema que a gente aprofunda depois, com calma.",
    ],
    faq: [
      {
        keys: ["o que é", "patrimônio", "como entra", "ativo", "bem"],
        answer:
          "Bitcoin conta como ativo no seu patrimônio: algo que você tem. Anote quantidade + onde está custodiado + uma referência em reais quando precisar conversar valores.",
      },
      {
        keys: ["reais", "valor", "preço", "cotação", "quanto vale"],
        answer:
          "O valor em reais muda com a cotação. Por isso muita gente controla primeiro a quantidade (sats/BTC) e só depois converte para reais numa data (ex.: 31/12 ou fim do mês).",
      },
      {
        keys: ["carteira", "corretora", "custódia", "onde", "guarda"],
        answer:
          "Na corretora, a custódia é dela. Na sua carteira, a custódia é sua (e a responsabilidade pela seed também). Os dois entram no patrimônio, mas o risco operacional é diferente.",
      },
      {
        keys: ["seed", "chave", "perder", "celular", "recuperar", "segurança"],
        answer:
          "Se a chave/seed se perde e não há backup seguro, o ativo pode ficar inacessível — e aí o 'patrimônio' some na prática. Backup offline, sem foto na nuvem, sem mandar pra desconhecido.",
      },
      {
        keys: ["herança", "morrer", "família", "sucessão", "herdeiro"],
        answer:
          "Patrimônio em bitcoin precisa de plano de sucessão: quem sabe que existe, como acessar com segurança, e documentação. Sem isso, a família pode não conseguir recuperar. É um dos pilares que o SatVantage quer organizar com o tempo.",
      },
      {
        keys: ["dívida", "passivo", "menos o que deve"],
        answer:
          "Patrimônio líquido = ativos − dívidas. Bitcoin aumenta o lado dos ativos; empréstimos e cartão entram no outro lado. Olhe os dois para não se iludir só com o preço do BTC.",
      },
    ],
  }),

  converse({
    id: "informe-corretora",
    label: "A corretora me dá informe para o IR?",
    teach: [
      "Corretoras brasileiras costumam oferecer extratos e, em muitos casos, informes que ajudam na declaração. Isso é apoio — a responsabilidade de declarar continua sendo sua.",
      "O informe da corretora cobre o que passou por ela. Se você tirou para a carteira própria, a exchange não 'vê' esse pedaço depois da saída. Aí o registro é seu.",
      "Fluxo bom no fim do ano: baixar PDFs/CSV, guardar numa pasta 'IR + cripto', anotar saldos em 31/12 e listar vendas importantes.",
      "Se usa mais de uma corretora, junte todos os informes. Se mistura corretora + self-custody, some as duas visões antes de falar com o contador.",
      "Golpe comum: falso 'suporte' pedindo acesso à conta para 'gerar informe'. Informe se baixa na área logada da corretora oficial — nunca por link de mensagem suspeita.",
      "Na dúvida de código de bem, enquadramento ou ganho, contador que entende cripto evita retrabalho e multa. Eu te ajudo a montar as perguntas certas.",
    ],
    faq: [
      {
        keys: ["informe", "extrato", "pdf", "baixar", "onde", "como pegar"],
        answer:
          "Em geral fica na área logada da corretora (relatórios, impostos, extratos). Baixe e arquive. Se não achar, o suporte oficial do app/site — nunca um 'atendente' que te chamou no WhatsApp.",
      },
      {
        keys: ["carteira", "própria", "self", "fria", "saiu", "saquei"],
        answer:
          "Depois que o bitcoin sai da corretora, o informe dela não acompanha o que acontece na sua carteira. Continue o histórico por conta própria (datas, quantidades, valores).",
      },
      {
        keys: ["várias", "mais de uma", "binance", "mercado", "foxbit", "duas corretoras"],
        answer:
          "Junte os informes de cada corretora. O contador precisa da foto completa, não só de uma exchange.",
      },
      {
        keys: ["responsabilidade", "obrigação", "minha", "deles"],
        answer:
          "A corretora facilita com dados; declarar é seu compromisso. Trate o informe como ferramenta, não como 'eles já resolvem tudo'.",
      },
      {
        keys: ["golpe", "suporte", "whatsapp", "telegram", "link"],
        answer:
          "Ninguém de suporte legítimo pede seed, código 2FA ou acesso remoto para 'gerar IR'. Baixe o informe só no site/app oficial após login seu.",
      },
      {
        keys: ["contador", "ajuda", "declarar"],
        answer:
          "Leve os informes + extratos + anotação do que está na carteira própria. Pergunte o que vai em bens e direitos e o que vai em ganhos. Assim a conversa rende.",
      },
    ],
  }),

  converse({
    id: "duvidas-imposto-inflacao",
    label: "Inflação, escassez do Bitcoin e imposto (visão geral)",
    teach: [
      "Inflação, em linguagem simples, é quando o dinheiro perde poder de compra: o mesmo real compra menos com o tempo. Isso acontece, em parte, porque a oferta de moeda fiduciária pode crescer sem um teto fixo igual ao do Bitcoin.",
      "O Bitcoin tem oferta limitada: no máximo cerca de 21 milhões de unidades. Essa escassez programada é uma das razões pelas quais muita gente o vê como forma de proteger valor no longo prazo — não como garantia de preço todo dia.",
      "Proteção de valor não significa 'nunca cai'. Significa entender o ativo, o horizonte de tempo e o risco. Oscilação de curto prazo faz parte; o desenho de escassez é sobre o longo prazo.",
      "Sobre imposto no Brasil: em linhas gerais, o que mais pesa costuma ser o ganho de capital na alienação — vender, trocar ou usar o bitcoin. Comprar e só guardar, em regra, não é o mesmo gatilho. Regras e limites mudam.",
      "Esta conversa é orientação educativa, não conselho fiscal. Para o seu caso concreto (declarar, isenção, cálculo), converse com um contador que entenda cripto.",
    ],
    faq: [
      {
        keys: ["inflação", "poder de compra"],
        answer:
          "Inflação é a perda de poder de compra da moeda: com o tempo, o mesmo dinheiro compra menos. O Bitcoin, com oferta limitada (teto de cerca de 21 milhões), é estudado por muita gente como alternativa de longo prazo — sem prometer que o preço sobe todo mês.",
      },
      {
        keys: ["imposto", "tributação", "ganho de capital"],
        answer:
          "Em orientação geral, o ganho de capital aparece quando você realiza — vende, troca ou gasta o bitcoin — e há diferença entre o que pagou e o que recebeu. Não decore um número de blog: confirme a regra vigente com um contador.",
      },
      {
        keys: ["receita federal", "declarar", "isenção"],
        answer:
          "Pode haver obrigação de informar cripto e regras de isenção em algumas alienações, mas condições mudam. Organize extratos e histórico; a Receita e o contador fecham o enquadramento. Eu oriento o vocabulário — não substituo profissional.",
      },
    ],
  }),

  converse({
    id: "volatilidade-dca",
    label: "Volatilidade do Bitcoin e DCA (compra programada)",
    teach: [
      "Volatilidade é o preço subir e descer com força. No Bitcoin isso é comum: o mercado ainda está em formação, notícias mexem rápido e a liquidez em alguns momentos é menor do que em mercados antigos.",
      "Tentar acertar 'a hora certa' de comprar tudo de uma vez gera ansiedade — e muitas vezes arrependimento. Ninguém tem bola de cristal confiável o tempo todo.",
      "DCA (Dollar-Cost Averaging), ou compra programada, é o hábito de comprar valores pequenos e regulares (ex.: toda semana ou todo mês), em vez de concentrar tudo num único dia.",
      "A ideia do DCA não é garantir o melhor preço. É reduzir o medo de 'comprar na hora errada' e transformar a entrada em rotina, com disciplina e menos drama.",
      "Combine DCA com segurança: só compre o que entende, evite golpe de urgência e tenha plano de custódia. Educação primeiro; pressa nunca.",
    ],
    faq: [
      {
        keys: ["volatilidade", "preço sobe e desce"],
        answer:
          "O preço do Bitcoin oscila porque é um mercado global 24/7, ainda em maturação, sensível a notícias e a fluxos de compra/venda. Volatilidade é o nome disso — sobe e desce com mais amplitude que ativos bem estabelecidos.",
      },
      {
        keys: ["hora certa", "quando comprar", "melhor momento"],
        answer:
          "Esperar o 'melhor momento' absoluto costuma travar a pessoa. Ninguém acerta sempre. Por isso muita gente prefere valores pequenos e regulares em vez de uma aposta única no dia 'perfeito'.",
      },
      {
        keys: ["dca", "compra programada", "medo de perder dinheiro"],
        answer:
          "DCA / compra programada = comprar pouco com frequência. Ajuda a diluir o risco de entrar só no pico e acalma o medo de errar o timing. Não elimina risco de mercado — organiza a forma de entrar.",
      },
    ],
  }),

  converse({
    id: "bitcoin-vs-outras-criptos",
    label: "Bitcoin e outras criptomoedas (altcoins)",
    teach: [
      "Bitcoin foi a primeira criptomoeda amplamente adotada e é a mais conhecida. Em geral é descrita como a mais descentralizada entre as grandes: sem uma empresa ou fundação única 'no comando' do protocolo.",
      "A oferta de novos bitcoins segue regras públicas e um teto aproximado de 21 milhões. Outras criptomoedas (altcoins) têm propósitos, equipes, níveis de descentralização e riscos diferentes.",
      "Ethereum e outras redes, por exemplo, costumam focar em contratos inteligentes e aplicativos — outro desenho, outro conjunto de trade-offs. Isso não torna uma 'melhor' em absoluto; são ferramentas distintas.",
      "Tom neutro e educativo: conhecer a diferença ajuda a não misturar tudo sob o nome 'cripto'. Não é recomendação de compra de nenhuma moeda.",
      "Se alguém promete lucro garantido em 'a próxima moeda', trate como sinal de alerta. Estude o básico, compare riscos e vá no seu ritmo.",
    ],
    faq: [
      {
        keys: ["outras criptomoedas", "altcoin", "ethereum", "criptomoeda", "moeda digital"],
        answer:
          "Altcoin é o nome genérico para criptomoedas que não são Bitcoin. Cada uma tem regras, governança e riscos próprios. Bitcoin é a pioneira, com oferta limitada e forte ênfase em descentralização; outras servem a usos diferentes.",
      },
      {
        keys: ["diferença", "qual é melhor"],
        answer:
          "Não existe 'a melhor' para todo mundo. Bitcoin costuma ser visto como reserva/rede monetária descentralizada; outras moedas podem priorizar apps, velocidade ou outros recursos — com outros riscos. Compare propósito e risco; não compre por moda.",
      },
    ],
  }),

  converse({
    id: "mineracao-bitcoin",
    label: "O que é mineração de Bitcoin",
    teach: [
      "Mineração, em linguagem simples, é o trabalho de computadores que competem para validar blocos de transações e proteger a rede Bitcoin — sem um banco central no meio.",
      "Os mineradores usam energia e hardware para resolver um desafio matemático (prova de trabalho / proof of work). Quem resolve de forma válida ajuda a incluir o próximo bloco e recebe uma recompensa em bitcoin novo + taxas.",
      "Por que isso existe? Para a rede continuar segura e descentralizada: alterar o histórico fica caríssimo em energia e equipamento. Não é 'imprimir dinheiro à toa' — é o custo de proteger o livro-razão público.",
      "Você não precisa minerar para usar Bitcoin. A maioria das pessoas compra, guarda e transaciona; a mineração é a camada de segurança da rede.",
      "Cuidado com golpes de 'mineradora caseira milagrosa' ou apps que pedem depósito para 'minerar por você' com lucro garantido. Educação primeiro.",
    ],
    faq: [
      {
        keys: ["mineração", "minerar", "mineradores"],
        answer:
          "Mineração é o processo em que computadores validam transações e protegem a rede Bitcoin. Mineradores competem para montar o próximo bloco; o trabalho custa energia e hardware, e isso ajuda a manter a segurança descentralizada.",
      },
      {
        keys: ["como é criado", "quem cria bitcoin"],
        answer:
          "Novos bitcoins entram na rede principalmente como recompensa aos mineradores que validam blocos — segundo regras públicas, até o teto aproximado de 21 milhões. Não é um governo 'imprimindo'; é o protocolo incentivando quem protege a rede.",
      },
      {
        keys: ["proof of work", "prova de trabalho"],
        answer:
          "Prova de trabalho (proof of work) é o mecanismo: gasto real de esforço computacional para propor um bloco válido. Isso torna caro atacar a rede e barato para todos verificar se as regras foram seguidas.",
      },
    ],
  }),

  converse({
    id: "geopolitica-e-preco",
    label: "Geopolítica, notícias e o preço do Bitcoin (visão geral)",
    teach: [
      "Esta conversa é educativa e geral: explica COMO certos fatores costumam influenciar o mercado de Bitcoin ao longo do tempo — sem dizer por que o preço subiu ou caiu especificamente hoje, e sem precisar de cotação ao vivo.",
      "Regulação: decisões de governos e reguladores sobre cripto tendem a mover o mercado. Sinais mais favoráveis costumam aumentar confiança; regras muito restritivas costumam pressionar o preço para baixo (e vice-versa, no clima geral).",
      "Adoção institucional: quando grandes empresas, fundos ou países adotam ou facilitam o uso de Bitcoin, isso tende a aumentar demanda e percepção de legitimidade — o que pode sustentar interesse de longo prazo.",
      "Juros nos EUA e força do dólar: juros mais altos costumam reduzir o apetite por ativos de risco (como o Bitcoin). Dólar mais forte tende a pressionar o preço para baixo; o contrário também aparece com frequência no histórico do mercado.",
      "Eventos geopolíticos (guerras, sanções, instabilidade): geram volatilidade. Às vezes o Bitcoin sobe, visto como reserva fora do sistema tradicional; às vezes cai junto com outros ativos de risco. O contexto importa.",
      "Bitcoin é mercado global aberto 24/7: reage rápido a notícias. Oscilação de curto prazo não define sozinha o valor de longo prazo do ativo. Calma e educação batem urgência de manchete.",
    ],
    faq: [
      {
        keys: ["geopolítica", "guerra", "economia mundial"],
        answer:
          "Eventos geopolíticos e o clima da economia mundial costumam aumentar a volatilidade. O Bitcoin pode subir (busca por ativo fora do sistema tradicional) ou cair (aversão geral a risco), dependendo do contexto — não há regra única automática.",
      },
      {
        keys: ["por que caiu", "por que subiu", "notícias"],
        answer:
          "No curto prazo, notícias (regulação, juros, adoção, conflitos) mexem rápido num mercado 24/7. Explicar 'por que hoje' exige o evento específico daquele dia; aqui o foco é o padrão geral: notícia grande → reação rápida → depois o mercado digere.",
      },
      {
        keys: ["juros", "dólar", "banco central"],
        answer:
          "Juros mais altos nos EUA e dólar forte costumam reduzir o apetite por ativos de risco como o Bitcoin. Quando o dinheiro fica 'mais caro' ou o dólar se fortalece, muitos investidores ficam mais seletivos — e o preço pode sentir isso.",
      },
      {
        keys: ["regulação", "adoção institucional"],
        answer:
          "Regulação mais clara/favorável e adoção por instituições (empresas, fundos, países) tendem a aumentar confiança e demanda. Regulação hostil ou incerteza regulatória costumam fazer o oposto no clima de mercado.",
      },
    ],
  }),
];

/** Sugestões que aparecem no balão do mentor no dashboard */
export const MENTOR_SUGGESTIONS = [
  { id: "patrimonio", label: "Como conquistar seu primeiro patrimônio" },
  { id: "comprar", label: "Como comprar bitcoin" },
  { id: "geopolitica", label: "Geopolítica e por que acompanhar" },
] as const;

/** Dúvidas importantes no quadro ao lado do Bitcoin ao vivo */
export const KNOW_QUESTIONS = [
  { id: "imposto-quando", label: "A partir de quando eu pago imposto sobre bitcoin?" },
  { id: "ir-2027", label: "Preciso declarar bitcoin no IR 2027?" },
  { id: "patrimonio-crypto", label: "Como o bitcoin entra no meu patrimônio?" },
  { id: "informe-corretora", label: "A corretora me dá informe para o IR?" },
] as const;

export function topicById(id: string): OptionalTopic | undefined {
  return OPTIONAL_TOPICS.find((t) => t.id === id);
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Escolhe a melhor resposta do FAQ / textos do tópico pela pergunta do usuário. */
export function matchTopicAnswer(
  topic: OptionalTopic,
  userText: string,
  messages?: { empty?: string; noMatch?: string },
): string {
  const q = normalize(userText.trim());
  if (!q) {
    return (
      messages?.empty ??
      "Pode escrever sua dúvida com suas palavras — por exemplo sobre imposto, declaração ou carteira."
    );
  }

  let best: { score: number; answer: string } | null = null;
  for (const item of topic.faq ?? []) {
    let score = 0;
    for (const key of item.keys) {
      const k = normalize(key);
      if (!k) continue;
      if (q.includes(k)) score += 4 + Math.min(k.length, 12);
      for (const w of q.split(/[^a-z0-9]+/).filter((x) => x.length > 2)) {
        if (k === w) score += 3;
        else if (k.includes(w) || w.includes(k)) score += 1;
      }
    }
    if (!best || score > best.score) best = { score, answer: item.answer };
  }

  // Também tenta achar o parágrafo de teach mais próximo
  for (const para of topic.teach) {
    const p = normalize(para);
    let score = 0;
    for (const w of q.split(/[^a-z0-9]+/).filter((x) => x.length > 3)) {
      if (p.includes(w)) score += 2;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: para };
    }
  }

  if (best && best.score >= 3) return best.answer;

  return (
    messages?.noMatch ??
    "Não peguei um encaixe claro com o que tenho neste assunto. Tente perguntar com outras palavras " +
      "(por exemplo: imposto na venda, declarar no IR, extrato da corretora, carteira própria). " +
      "E lembre: sou orientação educativa — para fechar o seu caso, um contador ajuda."
  );
}
