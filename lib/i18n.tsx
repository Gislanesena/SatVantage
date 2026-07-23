"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "pt" | "en" | "es";

const STORAGE_KEY = "sv_locale";

export type Dict = {
  nav: {
    platform: string;
    bitcoinLive: string;
    lightning: string;
    learn: string;
    mentor: string;
    about: string;
    support: string;
    start: string;
    sections: string;
    menu: string;
    openMenu: string;
    closeMenu: string;
    exitMentor: string;
    lightMode: string;
    darkMode: string;
    language: string;
  };
  dash: {
    availableBalance: string;
    showBalance: string;
    hideBalance: string;
    lightningWallet: string;
    walletConnected: string;
    connectedNamed: string;
    connectWalletTitle: string;
    connectWalletBody: string;
    connectWalletBtn: string;
    receiveBody: string;
    sendBody: string;
    generateInvoice: string;
    voucherTitle: string;
    voucherBody: string;
    withdrawReceive: string;
    withdrawSats: string;
    receive: string;
    send: string;
    move: string;
    approxIn: string;
    settings: string;
    profile: string;
    emergency: string;
    estate: string;
    logout: string;
    comingSoon: string;
    back: string;
    choosePhoto: string;
    removePhoto: string;
    pickPhotoAria: string;
    myNostrKey: string;
    nostrKeyTitle: string;
    nostrKeyHint: string;
    copyKey: string;
    keyCopied: string;
    closeKeyModal: string;
    estateSoon: string;
    emergencySoon: string;
    emergencyModalTitle: string;
    emergencyModalIntro: string;
    emergencyQuestionLoading: string;
    emergencyNoQuestion: string;
    emergencyAnswerLabel: string;
    emergencyAnswerPlaceholder: string;
    emergencyConfirm: string;
    emergencyConfirming: string;
    emergencyCancel: string;
    emergencyWrongAnswer: string;
    emergencyGenericError: string;
    emergencySuccessTitle: string;
    emergencySuccessBody: string;
    emergencyDone: string;
    emergencyCloseAria: string;
    photoTooBig: string;
    photoSaveFail: string;
    statement: string;
    viewBalance: string;
    statementEmpty: string;
    typeIn: string;
    typeOut: string;
    typeTransfer: string;
    estateHowTitle: string;
    estateHowClose: string;
    estateHowKeysTitle: string;
    estateHowKeysBody: string;
    estateHowDocTitle: string;
    estateHowDocBody: string;
    estateHowPlatformTitle: string;
    estateHowPlatformBody: string;
    estateHowHeirTitle: string;
    estateHowHeirBody: string;
    estateHowContactsTitle: string;
    estateHowContactsBody: string;
    estateHowTimeline: string;
    estateHowExtTip: string;
    satsAlreadyTitle: string;
    satsAlreadyBefore: string;
    satsAlreadyStrong: string;
    satsAlreadyAfter: string;
    satsAlreadyCancel: string;
    satsAlreadyProceed: string;
  };
  btc: {
    live: string;
    chartPeriod: string;
    hint: string;
    loading: string;
    unavailable: string;
    noData: string;
  };
  a11y: {
    readPage: string;
    stopReading: string;
    reading: string;
    voiceUnsupported: string;
    footerLabel: string;
    listenMessage: string;
    listen: string;
    skipToContent: string;
    micStart: string;
    micStop: string;
    sendMessage: string;
    chatInput: string;
    closeDialog: string;
    loading: string;
    optionsLabel: string;
    panelTitle: string;
    panelIntro: string;
    panelTts: string;
    panelVlibras: string;
    panelSkip: string;
    pauseReading: string;
    resumeReading: string;
  };
  exch: {
    title: string;
    lead: string;
    connected: string;
    notConnected: string;
    connect: string;
    connectTitle: string;
    explain: string;
    gotIt: string;
    close: string;
    inBtc: string;
  };
  know: {
    title: string;
    qImpostoQuando: string;
    qIr2027: string;
    qPatrimonio: string;
    qInforme: string;
    suggestions: string;
    sPatrimonio: string;
    sComprar: string;
    sGeopolitica: string;
  };
  landing: {
    nostrNotice: string;
    invest: string;
    haveAccount: string;
    enterAccount: string;
    enterExt: string;
    enterExtBusy: string;
    securityTitle: string;
    securityLede: string;
    eyebrow: string;
    headlineBefore: string;
    headlineEm: string;
    headlineAfter: string;
    knowPlatform: string;
    lede: string;
    ledeLine: string;
    ledeNote: string;
    trustSafe: string;
    trustNostr: string;
    trustContent: string;
    presentation: string;
    bitcoinLive: string;
    vaultTitle: string;
    vaultBody: string;
    extTitle: string;
    extBody: string;
    copilotoEyebrow: string;
    copilotoTitle: string;
    copilotoCopy: string;
    copilotoBtn: string;
    copilotoBtnTitle: string;
    emergencyTitle: string;
    emergencyBody: string;
  };
  platform: {
    eyebrow: string;
    titleBefore: string;
    titleEm: string;
    titleAfter: string;
    lede: string;
    wallet: { title: string; body: string };
    exchanges: { title: string; body: string };
    trade: { title: string; body: string };
    tax: { title: string; body: string };
  };
  why: {
    eyebrow: string;
    title: string;
    lede: string;
    sovereignty: { title: string; body: string };
    reserve: { title: string; body: string };
    tech: { title: string; body: string };
    socialLearn: string;
    tiktok: string;
    instagram: string;
  };
  about: {
    eyebrow: string;
    title: string;
    p1: string;
    p2: string;
    security: { title: string; body: string };
    content: { title: string; body: string };
    community: { title: string; body: string };
  };
  footer: {
    support: string;
    supportTo: string;
    supportPlaceholder: string;
    supportSend: string;
    supportSubject: string;
    copyright: string;
    risk: string;
  };
  tsim: {
    regionLabel: string;
    realAccount: string;
    simulator: string;
    equity: string;
    equityTip: string;
    grossResult: string;
    grossResultTip: string;
    cash: string;
    cashTip: string;
    btcLabel: string;
    btcTip: string;
    statsHoverHint: string;
    resetAll: string;
    backToChat: string;
    tourCta: string;
    requestTour: string;
    closeFlash: string;
    time: string;
    tf1m: string;
    tf5m: string;
    tf15m: string;
    tf1h: string;
    chartAria: string;
    orderTicket: string;
    orderTicketAria: string;
    asset: string;
    buy: string;
    sell: string;
    type: string;
    market: string;
    limit: string;
    validity: string;
    today: string;
    gtc: string;
    qtyBtc: string;
    priceBrl: string;
    takeProfit: string;
    takeProfitPh: string;
    stopLoss: string;
    stopLossPh: string;
    clear: string;
    buyAction: string;
    sellAction: string;
    assetsAria: string;
    assetCodePh: string;
    featuredAssets: string;
    hint: string;
    stepOf: string;
    skipTour: string;
    next: string;
    finish: string;
    flashReset: string;
    flashTourDone: string;
    flashBadQty: string;
    flashBadPrice: string;
    flashNoCash: string;
    flashNoBtc: string;
    flashBuy: string;
    flashSell: string;
    requiredLegend: string;
    requiredMark: string;
    optionalNote: string;
    tour: {
      mode: { title: string; body: string };
      stats: { title: string; body: string };
      chart: { title: string; body: string };
      timeframe: { title: string; body: string };
      ativos: { title: string; body: string };
      side: { title: string; body: string };
      tipo: { title: string; body: string };
      qty: { title: string; body: string };
      price: { title: string; body: string };
      risk: { title: string; body: string };
      order: { title: string; body: string };
    };
  };
  nagai: {
    titleM1: string;
    titleM2: string;
    introM1: string;
    introM2: string;
    opening: string;
    knowledgeTest: string;
    backToChat: string;
    dashboard: string;
    practiceMode: string;
    simTag: string;
    simTitle: string;
    askPlaceholder: string;
    skipQuestion: string;
    skipTest: string;
    voiceHint: string;
    voiceListening: string;
    thisTest: string;
    accountBalance: string;
    pickTestTitle: string;
    pickTestDesc: string;
    theoretical: string;
    theoreticalDesc: string;
    practical: string;
    practicalDesc: string;
    cancel: string;
    agentError: string;
    skipAllAgent: string;
    wantTheoretical: string;
    quizIntroEarn: string;
    quizIntroPractice: string;
    quizGateBodyBefore: string;
    quizGateBodyStrong: string;
    quizGateBodyAfter: string;
    quizGateRetry: string;
    quizGateBackChat: string;
    quizEmpty: string;
    reformulate: string;
    backToDashboard: string;
    hitSats: string;
    trySats: string;
    practiceNoSats: string;
    skipThisQuestion: string;
    zeroSatsTest: string;
    zeroSatsClosed: string;
    zeroSatsQuestion: string;
    helpTitle: string;
    withNagai: string;
    satsAlready: string;
    askNagai: string;
    earnSats: string;
    testKnowledge: string;
    tradeSim: string;
    openFullscreen: string;
    earnTitle: string;
    practiceTitle: string;
    titleM1Short: string;
    titleM2Short: string;
    historyTitle: string;
    historyDesc: string;
    historyEmpty: string;
    historyMessages: string;
    historyDelete: string;
    historyOpen: string;
    historyNew: string;
  };
};

const dictionaries: Record<Locale, Dict> = {
  pt: {
    nav: {
      platform: "Plataforma",
      bitcoinLive: "Bitcoin ao vivo",
      lightning: "Lightning",
      learn: "Aprender",
      mentor: "NagAI",
      about: "Sobre nós",
      support: "Suporte",
      start: "Começar agora",
      sections: "Seções",
      menu: "Menu",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
      exitMentor: "Sair da mentoria",
      lightMode: "Modo claro",
      darkMode: "Modo escuro",
      language: "Idioma",
    },
    dash: {
      availableBalance: "Saldo disponível",
      showBalance: "Mostrar saldo",
      hideBalance: "Ocultar saldo",
      lightningWallet: "Carteira Lightning",
      walletConnected: "Carteira conectada",
      connectedNamed: "Conectado: {name}",
      connectWalletTitle: "Conectar carteira",
      connectWalletBody:
        "Cole a credencial NWC de uma carteira MutinyNet (rede de teste). Nesta demo não usamos cobranças reais (mainnet).",
      connectWalletBtn: "Conectar",
      receiveBody:
        "Gere uma cobrança MutinyNet (lntbs) para receber sats de teste. Não gera cobrança real.",
      sendBody:
        "Cole ou escaneie uma cobrança MutinyNet (começa com lntbs). Cobranças reais (lnbc) não são aceitas.",
      generateInvoice: "Gerar",
      voucherTitle: "Crédito SatVantage (voucher)",
      voucherBody:
        "Ainda não está na carteira Lightning — está garantido na sua conta",
      withdrawReceive: "Sacar Sat recebidos",
      withdrawSats: "Sacar Sat recebidos",
      receive: "Receber",
      send: "Enviar",
      move: "Movimentar",
      approxIn: "Aproximado em",
      settings: "Configurações e perfil",
      profile: "Perfil",
      emergency: "Modo emergência",
      estate: "Herança",
      logout: "Sair",
      comingSoon: "Em breve",
      back: "Voltar",
      choosePhoto: "Escolher foto",
      removePhoto: "Remover",
      pickPhotoAria: "Escolher foto de perfil",
      myNostrKey: "Minha chave Nostr",
      nostrKeyTitle: "Sua chave Nostr (npub)",
      nostrKeyHint:
        "Use esta identidade pública para conferir a conta. Para entrar com extensão (Alby/nos2x) na mesma identidade, importe as 12 palavras geradas no cadastro — elas derivam esta chave (NIP-06).",
      copyKey: "Copiar",
      keyCopied: "Copiada",
      closeKeyModal: "Sair",
      estateSoon: "Herança chega em breve — ainda estamos montando.",
      emergencySoon:
        "Modo Emergência chega em breve — a base NWC já está pronta.",
      emergencyModalTitle: "Confirme sua identidade",
      emergencyModalIntro:
        "Isso desconecta sua carteira Lightning e suas corretoras deste dispositivo. Responda a pergunta de segurança da sua conta para continuar.",
      emergencyQuestionLoading: "Carregando pergunta de segurança…",
      emergencyNoQuestion:
        "Esta conta entrou por extensão Nostr e não tem pergunta de segurança cadastrada — o Modo Emergência não pode confirmar identidade por aqui ainda.",
      emergencyAnswerLabel: "Sua resposta",
      emergencyAnswerPlaceholder: "Resposta da pergunta de segurança",
      emergencyConfirm: "Confirmar e desconectar",
      emergencyConfirming: "Confirmando…",
      emergencyCancel: "Cancelar",
      emergencyWrongAnswer: "Resposta não confere. Tente de novo.",
      emergencyGenericError: "Não foi possível ativar o Modo Emergência agora.",
      emergencySuccessTitle: "Desconectado",
      emergencySuccessBody:
        "Sua carteira Lightning e suas corretoras foram desconectadas deste dispositivo. Pode reconectar quando quiser.",
      emergencyDone: "Concluído",
      emergencyCloseAria: "Fechar",
      photoTooBig: "Use uma foto de até 1,5 MB.",
      photoSaveFail: "Não deu para salvar a foto neste navegador.",
      statement: "Extrato",
      viewBalance: "Ver saldo",
      statementEmpty: "Nenhuma movimentação ainda.",
      typeIn: "Entrada",
      typeOut: "Saída",
      typeTransfer: "Transferência",
      estateHowTitle: "Como funciona a herança?",
      estateHowClose: "Fechar",
      estateHowKeysTitle: "🔒 Nunca custodiamos suas chaves",
      estateHowKeysBody:
        "Só organizamos e provamos. Seus bitcoins continuam sob o seu controle.",
      estateHowDocTitle: "📜 Documento + blockchain",
      estateHowDocBody:
        "Seu plano vira um documento. Provamos com matemática (hash) e a blockchain do Bitcoin que ele existe e não foi alterado — de forma permanente e verificável.",
      estateHowPlatformTitle: "E se eu trocar o uso de plataforma?",
      estateHowPlatformBody:
        "Parar de usar o app não significa que você não está mais vivo. Antes de qualquer coisa, mandamos lembretes por e-mail com chances de confirmar que está tudo bem.",
      estateHowHeirTitle: "📬 Vários caminhos até o herdeiro",
      estateHowHeirBody:
        "E-mail, telefone e (se ele usar Nostr) uma mensagem cifrada — para reduzir o risco de um contato antigo não funcionar.",
      estateHowContactsTitle: "🔄 Contatos vivos",
      estateHowContactsBody:
        "A cada confirmação sua, também perguntamos se os dados do herdeiro continuam corretos — nada fica esquecido.",
      estateHowTimeline:
        "Linha do tempo (demo para testes): sem confirmar por 30 minutos → pedimos prova de vida por e-mail. Sem resposta por mais 20 minutos → enviamos ao e-mail do herdeiro as informações de como acessar a herança.",
      estateHowExtTip:
        "Dica: use nossa extensão SatVantage para te auxiliar como guia no processo — ela ajuda a explicar passos e dúvidas enquanto você configura o plano.",
      satsAlreadyTitle: "Sats já resgatados",
      satsAlreadyBefore: "Os satoshis desta etapa",
      satsAlreadyStrong: "já foram creditados",
      satsAlreadyAfter:
        "nesta conta. Você pode revisar o teste para praticar, mas não ganha sats de novo.",
      satsAlreadyCancel: "Cancelar",
      satsAlreadyProceed: "Prosseguir para revisar",
    },
    btc: {
      live: "Bitcoin ao vivo",
      chartPeriod: "Período do gráfico",
      hint: "Passe o mouse no gráfico para ver valores em tempo real",
      loading: "Carregando preço…",
      unavailable: "Mercado indisponível agora",
      noData: "Sem dados",
    },
    a11y: {
      readPage: "Ler página em voz alta",
      stopReading: "Parar leitura",
      reading: "Lendo…",
      voiceUnsupported: "Leitura por voz não disponível neste navegador",
      footerLabel: "Acessibilidade",
      listenMessage: "Ouvir mensagem",
      listen: "Ouvir",
      skipToContent: "Ir para o conteúdo",
      micStart: "Microfone de voz",
      micStop: "Parar microfone",
      sendMessage: "Enviar mensagem",
      chatInput: "Mensagem para a NagAI",
      closeDialog: "Fechar",
      loading: "Carregando",
      optionsLabel: "Opções de Acessibilidade",
      panelTitle: "Acessibilidade",
      panelIntro:
        "Ferramentas no canto inferior direito: VLibras (Libras) acima e leitura em voz alta abaixo. Use também o símbolo de acessibilidade no topo.",
      panelTts:
        "Leitura em voz alta: o botão 🔊 no canto inferior direito lê o conteúdo principal (play, pausa e parar).",
      panelVlibras:
        "VLibras: o ícone oficial fica imediatamente acima do botão de leitura e traduz o conteúdo para Libras (também no celular).",
      panelSkip:
        "No início de cada página há o link “Ir para o conteúdo” para pular a navegação.",
      pauseReading: "Pausar leitura",
      resumeReading: "Continuar leitura",
    },
    exch: {
      title: "Corretoras",
      lead: "Acompanhe saldos e histórico das suas exchanges",
      connected: "Conectada",
      notConnected: "Não conectada",
      connect: "Conectar",
      connectTitle: "Conectar",
      explain:
        "A conexão com corretoras usa chaves de API somente-leitura, geradas por você na sua conta da corretora. O SatVantage nunca pode mover seus fundos — apenas enxergar saldos e histórico para te acompanhar. Disponível na próxima versão.",
      gotIt: "Entendi",
      close: "Fechar",
      inBtc: "em BTC",
    },
    know: {
      title: "Dúvidas importantes",
      qImpostoQuando: "A partir de quando eu pago imposto sobre bitcoin?",
      qIr2027: "Preciso declarar bitcoin no IR 2027?",
      qPatrimonio: "Como o bitcoin entra no meu patrimônio?",
      qInforme: "A corretora me dá informe para o IR?",
      suggestions: "Sugestões",
      sPatrimonio: "Como conquistar seu primeiro patrimônio",
      sComprar: "Como comprar bitcoin",
      sGeopolitica: "Geopolítica e por que acompanhar",
    },
    landing: {
      nostrNotice:
        "Essa plataforma utiliza login Nostr. Caso não tenha, você pode fazer uma conta conosco de forma simplificada.",
      invest: "Comece a Investir",
      haveAccount: "Já possuo conta",
      enterAccount: "Entrar com conta SatVantage",
      enterExt: "Entrar com extensão Nostr",
      enterExtBusy: "Aguardando a extensão…",
      securityTitle: "Segurança como princípio, não como slogan",
      securityLede:
        "A plataforma acessa só o necessário para autenticar e operar. Sua chave privada não passa pelo nosso servidor.",
      eyebrow: "Aprenda · Opere · Pague com Lightning",
      headlineBefore: "A porta de entrada para o ",
      headlineEm: "Bitcoin",
      headlineAfter: ".",
      knowPlatform: "Conheça a Plataforma",
      lede: "Comece a investir ou conecte suas carteiras e corretoras favoritas, compre, venda e transfira Bitcoin de forma simples, pague o dia a dia via Lightning e ganhe satoshis ao vivo aprendendo.",
      ledeLine: "Para iniciantes e investidores frequentes.",
      ledeNote:
        "Essa plataforma utiliza login Nostr; caso não tenha, você pode fazer uma conta conosco de forma simplificada.",
      trustSafe: "Ambiente seguro",
      trustNostr: "Identidade Nostr",
      trustContent: "Conteúdo atualizado",
      presentation: "Apresentação",
      bitcoinLive: "Bitcoin ao vivo",
      vaultTitle: "Guardamos o cofre, nunca a chave.",
      vaultBody:
        "No caminho com senha, a chave Nostr fica cifrada no seu navegador. Sem e-mail, sem dado pessoal obrigatório.",
      extTitle: "Extensão = a chave não sai do seu dispositivo.",
      extBody:
        "Com Alby ou nos2x, só pedimos uma assinatura. Verificamos a prova — não a chave.",
      copilotoEyebrow: "Extensão Chrome",
      copilotoTitle: "SatVantage Copiloto",
      copilotoCopy:
        "Leve nossa IA para outros sites: peça um guia passo a passo ou uma análise de risco em páginas de carteiras, corretoras e ofertas de Bitcoin.",
      copilotoBtn: "Baixar extensão",
      copilotoBtnTitle: "Em breve",
      emergencyTitle: "Modo emergência e fricção consciente.",
      emergencyBody:
        "Revogue conexões num toque se perder o aparelho. Em operações fora do padrão, alertamos antes — você decide.",
    },
    platform: {
      eyebrow: "Plataforma",
      titleBefore: "Sua ",
      titleEm: "porta de entrada",
      titleAfter: " para o mundo do Bitcoin",
      lede: "Integramos carteiras e corretoras que você já conhece — ou ajudamos a escolher o ideal. Comprar, vender e transferir Bitcoin fica simples, seguro e transparente, para iniciantes e especialistas.",
      wallet: {
        title: "Conecte sua carteira",
        body: "Use uma que você já confia — hardware, celular ou Lightning. Sem migração, sem fricção.",
      },
      exchanges: {
        title: "Integre corretoras",
        body: "Mercado Bitcoin, Binance, Coinbase, Foxbit e mais. Um só painel para tudo.",
      },
      trade: {
        title: "Compre, venda e transfira",
        body: "Operações simplificadas em poucos toques, com melhor cotação em tempo real.",
      },
      tax: {
        title: "Tributário",
        body: "Auxiliamos com questões tributárias e de herança por meio de ensino especializado — para você decidir com clareza.",
      },
    },
    why: {
      eyebrow: "Por que Bitcoin?",
      title: "Entenda o ativo que está redefinindo o dinheiro",
      lede: "Antes de investir, é essencial compreender. Explicamos o Bitcoin de forma simples, sem jargões e com a profundidade que você precisa.",
      sovereignty: {
        title: "Soberania financeira",
        body: "Você é dono do seu dinheiro. Sem intermediários, sem censura, transparente por design.",
      },
      reserve: {
        title: "Reserva de valor digital",
        body: "Oferta limitada em 21 milhões. Uma proteção real contra inflação e desvalorização.",
      },
      tech: {
        title: "Tecnologia que evolui",
        body: "Da rede principal ao Lightning: pagamentos instantâneos e globais, 24 horas por dia, 7 dias por semana.",
      },
      socialLearn: "Aprenda com nossos vídeos no TikTok e Instagram",
      tiktok: "TikTok",
      instagram: "Instagram",
    },
    about: {
      eyebrow: "Sobre nós",
      title: "Educação em Bitcoin com propósito",
      p1: "A SatVantage nasceu para democratizar o acesso ao conhecimento sobre Bitcoin no Brasil. Somos uma equipe de educadores, desenvolvedores e investidores unidos por uma visão: um futuro financeiro mais justo, transparente e soberano para todos.",
      p2: "Acreditamos que aprender deve ser envolvente, seguro e recompensador. Por isso combinamos conteúdo de alta qualidade com gamificação real, onde cada lição concluída se transforma em satoshis na sua carteira.",
      security: {
        title: "Segurança em primeiro lugar",
        body: "Ensinamos autocustódia responsável e boas práticas desde o dia 1.",
      },
      content: {
        title: "Conteúdo",
        body: "Curadoria por especialistas ativos no ecossistema Bitcoin.",
      },
      community: {
        title: "Comunidade",
        body: "Um espaço para tirar dúvidas sem julgamentos, do básico ao avançado.",
      },
    },
    footer: {
      support: "Suporte",
      supportTo: "Envie para",
      supportPlaceholder: "Escreva sua mensagem…",
      supportSend: "Enviar e-mail",
      supportSubject: "Suporte SatVantage",
      copyright: "© 2026 SatVantage. Todos os direitos reservados.",
      risk: "Investir em Bitcoin envolve riscos. Estude antes de investir.",
    },
    tsim: {
      regionLabel: "Simulador de trade Bitcoin",
      realAccount: "CONTA REAL",
      simulator: "SIMULADOR",
      equity: "Patrimônio",
      equityTip:
        "Valor total atual da conta: Caixa + valor de mercado das posições em Bitcoin.",
      grossResult: "Resultado bruto",
      grossResultTip:
        "Lucro ou prejuízo acumulado das operações realizadas e em andamento nesta sessão simulada.",
      cash: "Caixa",
      cashTip:
        "Dinheiro disponível em reais, pronto para novas compras no simulador.",
      btcLabel: "BTC",
      btcTip:
        "Quantidade total de Bitcoins atualmente na carteira simulada.",
      statsHoverHint: "Passe o mouse sobre cada item para entender os detalhes",
      resetAll: "ZERAR TUDO",
      backToChat: "Voltar ao chat",
      tourCta:
        "Novo no terminal? Peça um tour guiado da boleta, do gráfico e dos indicadores.",
      requestTour: "Solicitar tutoria",
      closeFlash: "Fechar aviso",
      time: "Tempo",
      tf1m: "1 minuto",
      tf5m: "5 minutos",
      tf15m: "15 minutos",
      tf1h: "1 hora",
      chartAria: "Gráfico candlestick {asset}",
      orderTicket: "Boleta",
      orderTicketAria: "Boleta de ordens",
      asset: "Ativo",
      buy: "Compra",
      sell: "Venda",
      type: "Tipo",
      market: "Mercado",
      limit: "Limitada",
      validity: "Validade",
      today: "Hoje",
      gtc: "Até executar",
      qtyBtc: "Quantidade (BTC)",
      priceBrl: "Preço (R$)",
      takeProfit: "Objetivo",
      takeProfitPh: "Take profit",
      stopLoss: "Stop loss",
      stopLossPh: "Stop",
      clear: "LIMPAR",
      buyAction: "COMPRAR",
      sellAction: "VENDER",
      assetsAria: "Lista de ativos",
      assetCodePh: "Código do ativo",
      featuredAssets: "Ativos em destaque",
      hint: "Ambiente 100% simulado · patrimônio inicial R$ {cash} · sem sats reais.",
      stepOf: "Passo {current} de {total}",
      skipTour: "Pular tutorial",
      next: "Avançar",
      finish: "Concluir",
      flashReset: "Posição e caixa zerados no simulador.",
      flashTourDone: "Tutorial concluído — boa prática no simulador!",
      flashBadQty: "Informe uma quantidade válida.",
      flashBadPrice: "Informe um preço válido.",
      flashNoCash: "Saldo insuficiente no simulador.",
      flashNoBtc: "Você não tem BTC suficiente para vender.",
      flashBuy:
        "Compra: investiu R$ {notional} ({qty} BTC @ R$ {price}). Saída do caixa. Caixa agora: R$ {cashAfter}. BTC: {btcAfter}.",
      flashSell:
        "Venda: entrou R$ {notional} no caixa ({qty} BTC @ R$ {price}). Caixa agora: R$ {cashAfter}. BTC: {btcAfter}.",
      requiredLegend: "* Campos obrigatórios para enviar a ordem",
      requiredMark: "*",
      optionalNote: "Opcional",
      tour: {
        mode: {
          title: "Modo Simulador",
          body: "Você está em conta simulada — nenhum sat real é movido. O seletor deixa claro que isto não é a carteira real.",
        },
        stats: {
          title: "Patrimônio e resultado",
          body: "Acompanhe caixa em R$, BTC na posição, patrimônio total e o resultado bruto desta sessão fictícia. Passe o mouse nos títulos para ver o significado de cada indicador.",
        },
        chart: {
          title: "Gráfico candlestick",
          body: "As velas mostram abertura, máxima, mínima e fechamento do BTC. Azul sobe; laranja desce. Use para ler o movimento antes de operar.",
        },
        timeframe: {
          title: "Tempo do gráfico",
          body: "Escolha a granularidade (1m, 5m, 15m, 1h). Intervalos menores reagem mais rápido; maiores suavizam o ruído.",
        },
        ativos: {
          title: "Lista de ativos",
          body: "Aqui você alterna o par em destaque (BTC/BRL, sats, etc.). O preço e a variação ajudam a escolher o que observar.",
        },
        side: {
          title: "Compra ou venda",
          body: "Na boleta, escolha Compra para adquirir BTC com o caixa simulado, ou Venda para liquidar uma posição que você já tem.",
        },
        tipo: {
          title: "Tipo de ordem",
          body: "Mercado executa já no preço atual. Limitada só entra se o mercado atingir o preço que você definir.",
        },
        qty: {
          title: "Quantidade",
          body: "Informe quanto BTC deseja negociar. Comece com valores pequenos (ex.: 0,01) para entender o impacto no caixa.",
        },
        price: {
          title: "Preço",
          body: "Em ordem a mercado o preço é o último trade. Em limitada, digite o valor em R$ que você aceita pagar ou receber.",
        },
        risk: {
          title: "Objetivo e stop",
          body: "Campos de gestão de risco: objetivo (take profit) e stop loss. No simulador servem para praticar o hábito — anote suas metas.",
        },
        order: {
          title: "Confirmar ordem",
          body: "LIMPAR zera a boleta. COMPRAR / VENDER executa a ordem simulada e atualiza caixa, BTC e resultado bruto.",
        },
      },
    },
    nagai: {
      titleM1: "NagAI · Primeiros passos",
      titleM2: "NagAI · Carteira e Lightning",
      introM1:
        "Oi! Eu sou a NagAI, do SatVantage. Pode me perguntar sobre Bitcoin, satoshis, Lightning e autocustódia. Quando quiser testar o que aprendeu, toque em Teste de Conhecimento.",
      introM2:
        "Oi! Aqui a gente fala de carteira, frase de recuperação e Lightning no dia a dia. Pergunte o que quiser — ou use Teste de Conhecimento para praticar.",
      opening: "Abrindo NagAI…",
      knowledgeTest: "Teste de Conhecimento",
      backToChat: "Voltar ao chat NagAI",
      dashboard: "Dashboard",
      practiceMode: "Modo prática · sem novos sats",
      simTag: "Terminal simulado · patrimônio fictício · sem saldo real",
      simTitle: "Simulador · Teste Prático",
      askPlaceholder: "Digite sua dúvida sobre Bitcoin aqui...",
      skipQuestion: "Pular pergunta",
      skipTest: "Pular teste",
      voiceHint: "Toque no microfone para responder por voz",
      voiceListening: "Ouvindo… diga a resposta ou o número da opção (1–4)",
      thisTest: "Neste teste: +{sats} sats",
      accountBalance: "Saldo na conta: ⚡ {sats}",
      pickTestTitle: "Como quer testar seus conhecimentos?",
      pickTestDesc:
        "Teórico: uma pergunta estratégica. Prático abre o terminal de simulação de trade Bitcoin.",
      theoretical: "Teórica",
      theoreticalDesc: "Uma pergunta estratégica · acerto 5 sats · erro 3 · pular 0.",
      practical: "Prática",
      practicalDesc: "Simulador de trade Bitcoin com tutorial guiado.",
      cancel: "Cancelar",
      agentError:
        "Não consegui falar com o mentor agora. Tente de novo em instantes — ou use Teste de Conhecimento.",
      skipAllAgent:
        "Tudo bem. Você pode voltar ao dashboard ou continuar no chat livre.",
      wantTheoretical: "Quero o teste teórico",
      quizIntroEarn:
        "Perfeito! Vamos testar seu conhecimento com uma pergunta rápida. Acertando você fatura 5 sats, mas mesmo tentando garante 3 sats de participação.",
      quizIntroPractice:
        "Perfeito! Vamos revisar com uma pergunta rápida — nesta conta é só prática, sem novos sats.",
      quizGateBodyBefore: "Nesta conta os sats deste teste",
      quizGateBodyStrong: "já foram creditados",
      quizGateBodyAfter:
        ". Você pode refazer para praticar, mas não ganha de novo.",
      quizGateRetry: "Refazer sem novos sats",
      quizGateBackChat: "Voltar ao chat",
      quizEmpty: "Ainda não há perguntas nesta trilha. Pode continuar no chat livre.",
      reformulate: "Pode reformular? Falo só de Bitcoin e autocustódia.",
      backToDashboard: "Voltar para Dashboard",
      hitSats: "Você acertou — +{sats} sats!",
      trySats: "Participação registrada — +{sats} sats por tentar.",
      practiceNoSats: "Prática — sem novos sats nesta conta.",
      skipThisQuestion: "Pular esta pergunta",
      zeroSatsTest: "Você ganhou 0 sats neste teste.",
      zeroSatsClosed: "Teste encerrado. Você ganhou 0 sats desta vez.",
      zeroSatsQuestion: "Sem problema. Você ganhou 0 sats nesta pergunta.",
      helpTitle: "Em que posso te ajudar?",
      withNagai: "Com NagAI",
      satsAlready: "(já creditados nesta conta)",
      askNagai: "Tirar Dúvidas com NagAI",
      earnSats: "Ganhar sats respondendo",
      testKnowledge: "Testar conhecimentos",
      tradeSim: "Simulador de Trade",
      openFullscreen: "Abrir em tela grande",
      earnTitle: "Retome o quiz e conquiste sats (5 no acerto · 3 na tentativa)",
      practiceTitle:
        "Revise o teste de conhecimentos — prática sem novos sats nesta conta",
      titleM1Short: "Primeiros passos no Bitcoin",
      titleM2Short: "Carteira e Lightning",
      historyTitle: "Histórico NagAI",
      historyDesc:
        "Conversas anteriores neste idioma. Abrimos só o resumo na lista; as mensagens completas carregam quando você escolhe uma.",
      historyEmpty: "Nenhuma conversa salva ainda neste idioma.",
      historyMessages: "{n} mensagens",
      historyDelete: "Apagar conversa",
      historyOpen: "Histórico",
      historyNew: "Nova conversa",
    },
  },
  en: {
    nav: {
      platform: "Platform",
      bitcoinLive: "Live Bitcoin",
      lightning: "Lightning",
      learn: "Learn",
      mentor: "NagAI",
      about: "About us",
      support: "Support",
      start: "Get started",
      sections: "Sections",
      menu: "Menu",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      exitMentor: "Leave mentorship",
      lightMode: "Light mode",
      darkMode: "Dark mode",
      language: "Language",
    },
    dash: {
      availableBalance: "Available balance",
      showBalance: "Show balance",
      hideBalance: "Hide balance",
      lightningWallet: "Lightning wallet",
      walletConnected: "Wallet connected",
      connectedNamed: "Connected: {name}",
      connectWalletTitle: "Connect wallet",
      connectWalletBody:
        "Paste an NWC credential from a MutinyNet (testnet) wallet. This demo does not use real mainnet invoices.",
      connectWalletBtn: "Connect",
      receiveBody:
        "Generate a MutinyNet (lntbs) invoice to receive test sats. No real invoices.",
      sendBody:
        "Paste or scan a MutinyNet invoice (starts with lntbs). Real invoices (lnbc) are not accepted.",
      generateInvoice: "Generate",
      voucherTitle: "SatVantage credit (voucher)",
      voucherBody:
        "Not yet in your Lightning wallet — guaranteed on your account",
      withdrawReceive: "Withdraw received sats",
      withdrawSats: "Withdraw received sats",
      receive: "Receive",
      send: "Send",
      move: "Move funds",
      approxIn: "Approx. in",
      settings: "Settings and profile",
      profile: "Profile",
      emergency: "Emergency mode",
      estate: "Inheritance",
      logout: "Log out",
      comingSoon: "Coming soon",
      back: "Back",
      choosePhoto: "Choose photo",
      removePhoto: "Remove",
      pickPhotoAria: "Choose profile photo",
      myNostrKey: "My Nostr key",
      nostrKeyTitle: "Your Nostr key (npub)",
      nostrKeyHint:
        "Use this public identity to verify your account. To sign in with an extension (Alby/nos2x) on the same identity, import the 12 words from signup — they derive this key (NIP-06).",
      copyKey: "Copy",
      keyCopied: "Copied",
      closeKeyModal: "Close",
      estateSoon: "Inheritance is coming soon — we’re still building it.",
      emergencySoon:
        "Emergency mode is coming soon — the NWC foundation is ready.",
      emergencyModalTitle: "Confirm your identity",
      emergencyModalIntro:
        "This disconnects your Lightning wallet and your exchanges from this device. Answer your account's security question to continue.",
      emergencyQuestionLoading: "Loading security question…",
      emergencyNoQuestion:
        "This account signed in via Nostr extension and has no security question set — Emergency mode can't confirm identity here yet.",
      emergencyAnswerLabel: "Your answer",
      emergencyAnswerPlaceholder: "Answer to the security question",
      emergencyConfirm: "Confirm and disconnect",
      emergencyConfirming: "Confirming…",
      emergencyCancel: "Cancel",
      emergencyWrongAnswer: "Answer doesn't match. Try again.",
      emergencyGenericError: "Couldn't activate Emergency mode right now.",
      emergencySuccessTitle: "Disconnected",
      emergencySuccessBody:
        "Your Lightning wallet and exchanges were disconnected from this device. Reconnect whenever you want.",
      emergencyDone: "Done",
      emergencyCloseAria: "Close",
      photoTooBig: "Use a photo up to 1.5 MB.",
      photoSaveFail: "Couldn’t save the photo in this browser.",
      statement: "Statement",
      viewBalance: "View balance",
      statementEmpty: "No movements yet.",
      typeIn: "Incoming",
      typeOut: "Outgoing",
      typeTransfer: "Transfer",
      estateHowTitle: "How does inheritance work?",
      estateHowClose: "Close",
      estateHowKeysTitle: "🔒 We never custody your keys",
      estateHowKeysBody:
        "We only organize and prove. Your bitcoin stays under your control.",
      estateHowDocTitle: "📜 Document + blockchain",
      estateHowDocBody:
        "Your plan becomes a document. We prove with math (hash) and the Bitcoin blockchain that it exists and was not altered — permanently and verifiably.",
      estateHowPlatformTitle: "What if I stop using the platform?",
      estateHowPlatformBody:
        "Stopping using the app does not mean you are no longer alive. First we send email reminders with chances to confirm that everything is fine.",
      estateHowHeirTitle: "📬 Several paths to the heir",
      estateHowHeirBody:
        "Email, phone, and (if they use Nostr) an encrypted message — to reduce the risk that an old contact no longer works.",
      estateHowContactsTitle: "🔄 Living contacts",
      estateHowContactsBody:
        "On each confirmation, we also ask if the heir's details are still correct — nothing is left forgotten.",
      estateHowTimeline:
        "Timeline (demo for testing): no confirmation for 30 minutes → we ask for a life check by email. No reply for another 20 minutes → we send the heir's email the information on how to access the inheritance.",
      estateHowExtTip:
        "Tip: use our SatVantage extension as a guide through the process — it helps explain steps and questions while you set up the plan.",
      satsAlreadyTitle: "Sats already claimed",
      satsAlreadyBefore: "The satoshis from this stage",
      satsAlreadyStrong: "have already been credited",
      satsAlreadyAfter:
        "to this account. You can review the test for practice, but you won’t earn sats again.",
      satsAlreadyCancel: "Cancel",
      satsAlreadyProceed: "Continue to review",
    },
    btc: {
      live: "Live Bitcoin",
      chartPeriod: "Chart period",
      hint: "Hover the chart to see live values",
      loading: "Loading price…",
      unavailable: "Market unavailable right now",
      noData: "No data",
    },
    a11y: {
      readPage: "Read page aloud",
      stopReading: "Stop reading",
      reading: "Reading…",
      voiceUnsupported: "Speech readout is not available in this browser",
      footerLabel: "Accessibility",
      listenMessage: "Listen to message",
      listen: "Listen",
      skipToContent: "Skip to content",
      micStart: "Voice microphone",
      micStop: "Stop microphone",
      sendMessage: "Send message",
      chatInput: "Message for NagAI",
      closeDialog: "Close",
      loading: "Loading",
      optionsLabel: "Accessibility options",
      panelTitle: "Accessibility",
      panelIntro:
        "Tools in the bottom-right: VLibras (sign language) above and read-aloud below. You can also use the accessibility symbol in the header.",
      panelTts:
        "Read aloud: the 🔊 button at the bottom-right reads the main page content (play, pause and stop).",
      panelVlibras:
        "VLibras: the official icon sits right above the read-aloud button and translates content to Brazilian Sign Language (also on mobile).",
      panelSkip:
        "At the start of each page there is a “Skip to content” link to bypass navigation.",
      pauseReading: "Pause reading",
      resumeReading: "Resume reading",
    },
    exch: {
      title: "Exchanges",
      lead: "Track balances and history from your exchanges",
      connected: "Connected",
      notConnected: "Not connected",
      connect: "Connect",
      connectTitle: "Connect",
      explain:
        "Exchange connections use read-only API keys that you generate in your exchange account. SatVantage can never move your funds — it only reads balances and history to help you follow along. Available in the next version.",
      gotIt: "Got it",
      close: "Close",
      inBtc: "in BTC",
    },
    know: {
      title: "Important questions",
      qImpostoQuando: "When do I start paying tax on bitcoin?",
      qIr2027: "Do I need to declare bitcoin on the 2027 tax return?",
      qPatrimonio: "How does bitcoin enter my net worth?",
      qInforme: "Does the exchange give me a tax report?",
      suggestions: "Suggestions",
      sPatrimonio: "How to build your first wealth",
      sComprar: "How to buy bitcoin",
      sGeopolitica: "Geopolitics and why to follow it",
    },
    landing: {
      nostrNotice:
        "This platform uses Nostr login. If you don’t have one, you can create a simplified account with us.",
      invest: "Start investing",
      haveAccount: "I already have an account",
      enterAccount: "Sign in with SatVantage",
      enterExt: "Sign in with Nostr extension",
      enterExtBusy: "Waiting for the extension…",
      securityTitle: "Security as a principle, not a slogan",
      securityLede:
        "The platform only accesses what’s needed to authenticate and operate. Your private key never hits our server.",
      eyebrow: "Learn · Trade · Pay with Lightning",
      headlineBefore: "Your gateway to ",
      headlineEm: "Bitcoin",
      headlineAfter: ".",
      knowPlatform: "Explore the platform",
      lede: "Start investing or connect your favorite wallets and exchanges, buy, sell and transfer Bitcoin simply, pay everyday life via Lightning and earn live satoshis while learning.",
      ledeLine: "For beginners and frequent investors.",
      ledeNote:
        "This platform uses Nostr login; if you don’t have one, you can create a simplified account with us.",
      trustSafe: "Safe environment",
      trustNostr: "Nostr identity",
      trustContent: "Updated content",
      presentation: "Introduction",
      bitcoinLive: "Live Bitcoin",
      vaultTitle: "We hold the vault, never the key.",
      vaultBody:
        "On the password path, your Nostr key stays encrypted in your browser. No email, no mandatory personal data.",
      extTitle: "Extension = the key never leaves your device.",
      extBody:
        "With Alby or nos2x, we only ask for a signature. We verify the proof — not the key.",
      copilotoEyebrow: "Chrome extension",
      copilotoTitle: "SatVantage Copilot",
      copilotoCopy:
        "Take our AI to other sites: ask for a step-by-step guide or a risk analysis on wallet pages, exchanges and Bitcoin offers.",
      copilotoBtn: "Download extension",
      copilotoBtnTitle: "Coming soon",
      emergencyTitle: "Emergency mode and mindful friction.",
      emergencyBody:
        "Revoke connections in one tap if you lose your device. On unusual operations, we alert first — you decide.",
    },
    platform: {
      eyebrow: "Platform",
      titleBefore: "Your ",
      titleEm: "gateway",
      titleAfter: " to the world of Bitcoin",
      lede: "We integrate wallets and exchanges you already know — or help you choose the right one. Buying, selling and transferring Bitcoin becomes simple, safe and transparent, for beginners and experts.",
      wallet: {
        title: "Connect your wallet",
        body: "Use one you already trust — hardware, mobile or Lightning. No migration, no friction.",
      },
      exchanges: {
        title: "Integrate exchanges",
        body: "Mercado Bitcoin, Binance, Coinbase, Foxbit and more. One panel for everything.",
      },
      trade: {
        title: "Buy, sell and transfer",
        body: "Simplified operations in a few taps, with better real-time quotes.",
      },
      tax: {
        title: "Tax & estate",
        body: "We help with tax and inheritance topics through specialized education — so you decide with clarity.",
      },
    },
    why: {
      eyebrow: "Why Bitcoin?",
      title: "Understand the asset redefining money",
      lede: "Before investing, understanding comes first. We explain Bitcoin simply, without jargon, and with the depth you need.",
      sovereignty: {
        title: "Financial sovereignty",
        body: "You own your money. No intermediaries, no censorship, transparent by design.",
      },
      reserve: {
        title: "Digital store of value",
        body: "Limited supply of 21 million. Real protection against inflation and devaluation.",
      },
      tech: {
        title: "Technology that evolves",
        body: "From the base layer to Lightning: instant global payments, 24 hours a day, 7 days a week.",
      },
      socialLearn: "Learn with our videos on TikTok and Instagram",
      tiktok: "TikTok",
      instagram: "Instagram",
    },
    about: {
      eyebrow: "About us",
      title: "Bitcoin education with purpose",
      p1: "SatVantage was born to democratize access to Bitcoin knowledge in Brazil. We are a team of educators, developers and investors united by one vision: a fairer, more transparent and sovereign financial future for everyone.",
      p2: "We believe learning should be engaging, safe and rewarding. That’s why we combine high-quality content with real gamification, where every completed lesson turns into satoshis in your wallet.",
      security: {
        title: "Security first",
        body: "We teach responsible self-custody and best practices from day one.",
      },
      content: {
        title: "Content",
        body: "Curated by experts active in the Bitcoin ecosystem.",
      },
      community: {
        title: "Community",
        body: "A space to ask questions without judgment, from basics to advanced.",
      },
    },
    footer: {
      support: "Support",
      supportTo: "Send to",
      supportPlaceholder: "Write your message…",
      supportSend: "Send email",
      supportSubject: "SatVantage Support",
      copyright: "© 2026 SatVantage. All rights reserved.",
      risk: "Investing in Bitcoin involves risks. Study before you invest.",
    },
    tsim: {
      regionLabel: "Bitcoin trade simulator",
      realAccount: "LIVE ACCOUNT",
      simulator: "SIMULATOR",
      equity: "Equity",
      equityTip:
        "Current total account value: Cash + market value of Bitcoin positions.",
      grossResult: "Gross P&L",
      grossResultTip:
        "Accumulated profit or loss from completed and open trades in this simulated session.",
      cash: "Cash",
      cashTip: "Fiat available (BRL) ready for new buys in the simulator.",
      btcLabel: "BTC",
      btcTip: "Total Bitcoin currently held in the simulated wallet.",
      statsHoverHint: "Hover each item to see what it means",
      resetAll: "RESET ALL",
      backToChat: "Back to chat",
      tourCta:
        "New to the terminal? Request a guided tour of the order ticket, chart and indicators.",
      requestTour: "Request tutorial",
      closeFlash: "Dismiss notice",
      time: "Timeframe",
      tf1m: "1 minute",
      tf5m: "5 minutes",
      tf15m: "15 minutes",
      tf1h: "1 hour",
      chartAria: "Candlestick chart {asset}",
      orderTicket: "Order ticket",
      orderTicketAria: "Order ticket",
      asset: "Asset",
      buy: "Buy",
      sell: "Sell",
      type: "Type",
      market: "Market",
      limit: "Limit",
      validity: "Validity",
      today: "Today",
      gtc: "Good till canceled",
      qtyBtc: "Quantity (BTC)",
      priceBrl: "Price (R$)",
      takeProfit: "Target",
      takeProfitPh: "Take profit",
      stopLoss: "Stop loss",
      stopLossPh: "Stop",
      clear: "CLEAR",
      buyAction: "BUY",
      sellAction: "SELL",
      assetsAria: "Asset list",
      assetCodePh: "Asset code",
      featuredAssets: "Featured assets",
      hint: "100% simulated · starting equity R$ {cash} · no real sats.",
      stepOf: "Step {current} of {total}",
      skipTour: "Skip tutorial",
      next: "Next",
      finish: "Finish",
      flashReset: "Position and cash reset in the simulator.",
      flashTourDone: "Tutorial complete — enjoy practicing in the simulator!",
      flashBadQty: "Enter a valid quantity.",
      flashBadPrice: "Enter a valid price.",
      flashNoCash: "Insufficient balance in the simulator.",
      flashNoBtc: "You don’t have enough BTC to sell.",
      flashBuy:
        "Buy: invested R$ {notional} ({qty} BTC @ R$ {price}). Cash out. Cash now: R$ {cashAfter}. BTC: {btcAfter}.",
      flashSell:
        "Sell: R$ {notional} credited to cash ({qty} BTC @ R$ {price}). Cash now: R$ {cashAfter}. BTC: {btcAfter}.",
      requiredLegend: "* Required fields to submit the order",
      requiredMark: "*",
      optionalNote: "Optional",
      tour: {
        mode: {
          title: "Simulator mode",
          body: "You’re on a simulated account — no real sats move. The switch makes clear this is not your live wallet.",
        },
        stats: {
          title: "Equity and P&L",
          body: "Track cash in R$, BTC held, total equity and the gross result of this fictional session. Hover the labels to learn what each metric means.",
        },
        chart: {
          title: "Candlestick chart",
          body: "Candles show open, high, low and close for BTC. Blue is up; orange is down. Use them to read the move before you trade.",
        },
        timeframe: {
          title: "Chart timeframe",
          body: "Pick the granularity (1m, 5m, 15m, 1h). Smaller intervals react faster; larger ones smooth out noise.",
        },
        ativos: {
          title: "Asset list",
          body: "Switch the featured pair here (BTC/BRL, sats, etc.). Price and change help you choose what to watch.",
        },
        side: {
          title: "Buy or sell",
          body: "On the ticket, choose Buy to acquire BTC with simulated cash, or Sell to close a position you already hold.",
        },
        tipo: {
          title: "Order type",
          body: "Market fills now at the current price. Limit only fills if the market reaches the price you set.",
        },
        qty: {
          title: "Quantity",
          body: "Enter how much BTC you want to trade. Start small (e.g. 0.01) to see the impact on cash.",
        },
        price: {
          title: "Price",
          body: "For market orders the price is the last trade. For limit orders, type the R$ amount you’re willing to pay or receive.",
        },
        risk: {
          title: "Target and stop",
          body: "Risk fields: take-profit target and stop loss. In the simulator they help build the habit — write down your goals.",
        },
        order: {
          title: "Confirm order",
          body: "CLEAR resets the ticket. BUY / SELL runs the simulated order and updates cash, BTC and gross P&L.",
        },
      },
    },
    nagai: {
      titleM1: "NagAI · First steps",
      titleM2: "NagAI · Wallet and Lightning",
      introM1:
        "Hi! I'm NagAI from SatVantage. Ask me about Bitcoin, satoshis, Lightning, and self-custody. When you want to check what you learned, tap Knowledge Test.",
      introM2:
        "Hi! Here we talk about wallets, recovery phrases, and Lightning day to day. Ask anything — or use Knowledge Test to practice.",
      opening: "Opening NagAI…",
      knowledgeTest: "Knowledge Test",
      backToChat: "Back to NagAI chat",
      dashboard: "Dashboard",
      practiceMode: "Practice mode · no new sats",
      simTag: "Simulated terminal · fictional portfolio · no real balance",
      simTitle: "Simulator · Practical Test",
      askPlaceholder: "Type your Bitcoin question here...",
      skipQuestion: "Skip question",
      skipTest: "Skip test",
      voiceHint: "Tap the microphone to answer by voice",
      voiceListening: "Listening… say the answer or option number (1–4)",
      thisTest: "This test: +{sats} sats",
      accountBalance: "Account balance: ⚡ {sats}",
      pickTestTitle: "How do you want to test your knowledge?",
      pickTestDesc:
        "Theoretical: one strategic question. Practical opens the Bitcoin trade simulator.",
      theoretical: "Theoretical",
      theoreticalDesc: "One strategic question · correct 5 sats · try 3 · skip 0.",
      practical: "Practical",
      practicalDesc: "Bitcoin trade simulator with guided tutorial.",
      cancel: "Cancel",
      agentError:
        "I couldn't reach the mentor right now. Try again in a moment — or use Knowledge Test.",
      skipAllAgent:
        "That's fine. You can go back to the dashboard or keep chatting.",
      wantTheoretical: "I want the theoretical test",
      quizIntroEarn:
        "Perfect! Let's test your knowledge with a quick question. A correct answer earns 5 sats; even trying earns 3 participation sats.",
      quizIntroPractice:
        "Perfect! Let's review with a quick question — on this account it's practice only, no new sats.",
      quizGateBodyBefore: "On this account the sats from this test",
      quizGateBodyStrong: "have already been credited",
      quizGateBodyAfter:
        ". You can retake it for practice, but you won’t earn again.",
      quizGateRetry: "Retake without new sats",
      quizGateBackChat: "Back to chat",
      quizEmpty: "There are no questions on this trail yet. You can continue in free chat.",
      reformulate: "Can you rephrase? I only talk about Bitcoin and self-custody.",
      backToDashboard: "Back to Dashboard",
      hitSats: "Correct — +{sats} sats!",
      trySats: "Participation recorded — +{sats} sats for trying.",
      practiceNoSats: "Practice — no new sats on this account.",
      skipThisQuestion: "Skip this question",
      zeroSatsTest: "You earned 0 sats on this test.",
      zeroSatsClosed: "Test closed. You earned 0 sats this time.",
      zeroSatsQuestion: "No problem. You earned 0 sats on this question.",
      helpTitle: "How can I help you?",
      withNagai: "With NagAI",
      satsAlready: "(already credited on this account)",
      askNagai: "Ask NagAI",
      earnSats: "Earn sats by answering",
      testKnowledge: "Test your knowledge",
      tradeSim: "Trade Simulator",
      openFullscreen: "Open fullscreen",
      earnTitle: "Resume the quiz and earn sats (5 correct · 3 for trying)",
      practiceTitle:
        "Review the knowledge test — practice with no new sats on this account",
      titleM1Short: "Bitcoin first steps",
      titleM2Short: "Wallet and Lightning",
      historyTitle: "NagAI history",
      historyDesc:
        "Previous chats in this language. The list shows only a summary; full messages load when you pick one.",
      historyEmpty: "No saved chats in this language yet.",
      historyMessages: "{n} messages",
      historyDelete: "Delete conversation",
      historyOpen: "History",
      historyNew: "New chat",
    },
  },
  es: {
    nav: {
      platform: "Plataforma",
      bitcoinLive: "Bitcoin en vivo",
      lightning: "Lightning",
      learn: "Aprender",
      mentor: "NagAI",
      about: "Sobre nosotros",
      support: "Soporte",
      start: "Empezar ahora",
      sections: "Secciones",
      menu: "Menú",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      exitMentor: "Salir de la mentoría",
      lightMode: "Modo claro",
      darkMode: "Modo oscuro",
      language: "Idioma",
    },
    dash: {
      availableBalance: "Saldo disponible",
      showBalance: "Mostrar saldo",
      hideBalance: "Ocultar saldo",
      lightningWallet: "Cartera Lightning",
      walletConnected: "Cartera conectada",
      connectedNamed: "Conectado: {name}",
      connectWalletTitle: "Conectar cartera",
      connectWalletBody:
        "Pega una credencial NWC de una cartera MutinyNet (red de prueba). Esta demo no usa cobros reales (mainnet).",
      connectWalletBtn: "Conectar",
      receiveBody:
        "Genera un cobro MutinyNet (lntbs) para recibir sats de prueba. No genera cobros reales.",
      sendBody:
        "Pega o escanea un cobro MutinyNet (empieza con lntbs). Los cobros reales (lnbc) no se aceptan.",
      generateInvoice: "Generar",
      voucherTitle: "Crédito SatVantage (voucher)",
      voucherBody:
        "Aún no está en tu cartera Lightning — está garantizado en tu cuenta",
      withdrawReceive: "Retirar sats recibidos",
      withdrawSats: "Retirar sats recibidos",
      receive: "Recibir",
      send: "Enviar",
      move: "Movimientos",
      approxIn: "Aprox. en",
      settings: "Configuración y perfil",
      profile: "Perfil",
      emergency: "Modo emergencia",
      estate: "Herencia",
      logout: "Salir",
      comingSoon: "Pronto",
      back: "Volver",
      choosePhoto: "Elegir foto",
      removePhoto: "Quitar",
      pickPhotoAria: "Elegir foto de perfil",
      myNostrKey: "Mi clave Nostr",
      nostrKeyTitle: "Tu clave Nostr (npub)",
      nostrKeyHint:
        "Usa esta identidad pública para verificar la cuenta. Para entrar con extensión (Alby/nos2x) en la misma identidad, importa las 12 palabras del registro — derivan esta clave (NIP-06).",
      copyKey: "Copiar",
      keyCopied: "Copiada",
      closeKeyModal: "Salir",
      estateSoon: "Herencia llega pronto — aún lo estamos armando.",
      emergencySoon:
        "Modo emergencia llega pronto — la base NWC ya está lista.",
      emergencyModalTitle: "Confirma tu identidad",
      emergencyModalIntro:
        "Esto desconecta tu cartera Lightning y tus exchanges de este dispositivo. Responde la pregunta de seguridad de tu cuenta para continuar.",
      emergencyQuestionLoading: "Cargando pregunta de seguridad…",
      emergencyNoQuestion:
        "Esta cuenta entró con extensión Nostr y no tiene pregunta de seguridad configurada — el Modo emergencia aún no puede confirmar identidad aquí.",
      emergencyAnswerLabel: "Tu respuesta",
      emergencyAnswerPlaceholder: "Respuesta de la pregunta de seguridad",
      emergencyConfirm: "Confirmar y desconectar",
      emergencyConfirming: "Confirmando…",
      emergencyCancel: "Cancelar",
      emergencyWrongAnswer: "La respuesta no coincide. Intenta de nuevo.",
      emergencyGenericError: "No se pudo activar el Modo emergencia ahora.",
      emergencySuccessTitle: "Desconectado",
      emergencySuccessBody:
        "Tu cartera Lightning y tus exchanges fueron desconectados de este dispositivo. Reconecta cuando quieras.",
      emergencyDone: "Listo",
      emergencyCloseAria: "Cerrar",
      photoTooBig: "Usa una foto de hasta 1,5 MB.",
      photoSaveFail: "No se pudo guardar la foto en este navegador.",
      statement: "Extracto",
      viewBalance: "Ver saldo",
      statementEmpty: "Aún no hay movimientos.",
      typeIn: "Entrada",
      typeOut: "Salida",
      typeTransfer: "Transferencia",
      estateHowTitle: "¿Cómo funciona la herencia?",
      estateHowClose: "Cerrar",
      estateHowKeysTitle: "🔒 Nunca custodiamos tus claves",
      estateHowKeysBody:
        "Solo organizamos y probamos. Tus bitcoins siguen bajo tu control.",
      estateHowDocTitle: "📜 Documento + blockchain",
      estateHowDocBody:
        "Tu plan se convierte en un documento. Probamos con matemática (hash) y la blockchain de Bitcoin que existe y no fue alterado — de forma permanente y verificable.",
      estateHowPlatformTitle: "¿Y si dejo de usar la plataforma?",
      estateHowPlatformBody:
        "Dejar de usar la app no significa que ya no estés vivo. Antes de cualquier cosa, enviamos recordatorios por correo con oportunidades de confirmar que todo está bien.",
      estateHowHeirTitle: "📬 Varios caminos hasta el heredero",
      estateHowHeirBody:
        "Correo, teléfono y (si usa Nostr) un mensaje cifrado — para reducir el riesgo de que un contacto antiguo no funcione.",
      estateHowContactsTitle: "🔄 Contactos vivos",
      estateHowContactsBody:
        "En cada confirmación tuya, también preguntamos si los datos del heredero siguen correctos — nada queda olvidado.",
      estateHowTimeline:
        "Línea de tiempo (demo para pruebas): sin confirmar por 30 minutos → pedimos prueba de vida por correo. Sin respuesta por otros 20 minutos → enviamos al correo del heredero la información de cómo acceder a la herencia.",
      estateHowExtTip:
        "Consejo: usa nuestra extensión SatVantage como guía en el proceso — ayuda a explicar pasos y dudas mientras configuras el plan.",
      satsAlreadyTitle: "Sats ya canjeados",
      satsAlreadyBefore: "Los satoshis de esta etapa",
      satsAlreadyStrong: "ya fueron acreditados",
      satsAlreadyAfter:
        "en esta cuenta. Puedes revisar el test para practicar, pero no ganas sats de nuevo.",
      satsAlreadyCancel: "Cancelar",
      satsAlreadyProceed: "Continuar para revisar",
    },
    btc: {
      live: "Bitcoin en vivo",
      chartPeriod: "Periodo del gráfico",
      hint: "Pasa el cursor por el gráfico para ver valores en tiempo real",
      loading: "Cargando precio…",
      unavailable: "Mercado no disponible ahora",
      noData: "Sin datos",
    },
    a11y: {
      readPage: "Leer la página en voz alta",
      stopReading: "Detener lectura",
      reading: "Leyendo…",
      voiceUnsupported: "La lectura por voz no está disponible en este navegador",
      footerLabel: "Accesibilidad",
      listenMessage: "Escuchar mensaje",
      listen: "Escuchar",
      skipToContent: "Ir al contenido",
      micStart: "Micrófono de voz",
      micStop: "Detener micrófono",
      sendMessage: "Enviar mensaje",
      chatInput: "Mensaje para NagAI",
      closeDialog: "Cerrar",
      loading: "Cargando",
      optionsLabel: "Opciones de accesibilidad",
      panelTitle: "Accesibilidad",
      panelIntro:
        "Herramientas abajo a la derecha: VLibras (señas) arriba y lectura en voz alta abajo. También puedes usar el símbolo de accesibilidad arriba.",
      panelTts:
        "Lectura en voz alta: el botón 🔊 abajo a la derecha lee el contenido principal (play, pausa y parar).",
      panelVlibras:
        "VLibras: el icono oficial queda justo encima del botón de lectura y traduce el contenido a lengua de señas (también en móvil).",
      panelSkip:
        "Al inicio de cada página hay el enlace “Ir al contenido” para saltar la navegación.",
      pauseReading: "Pausar lectura",
      resumeReading: "Continuar lectura",
    },
    exch: {
      title: "Exchanges",
      lead: "Sigue saldos e historial de tus exchanges",
      connected: "Conectada",
      notConnected: "No conectada",
      connect: "Conectar",
      connectTitle: "Conectar",
      explain:
        "La conexión con exchanges usa claves de API de solo lectura, generadas por ti en tu cuenta del exchange. SatVantage nunca puede mover tus fondos — solo ver saldos e historial para acompañarte. Disponible en la próxima versión.",
      gotIt: "Entendido",
      close: "Cerrar",
      inBtc: "en BTC",
    },
    know: {
      title: "Dudas importantes",
      qImpostoQuando: "¿Desde cuándo pago impuestos sobre bitcoin?",
      qIr2027: "¿Debo declarar bitcoin en el IR 2027?",
      qPatrimonio: "¿Cómo entra el bitcoin en mi patrimonio?",
      qInforme: "¿El exchange me da informe para el IR?",
      suggestions: "Sugerencias",
      sPatrimonio: "Cómo conquistar tu primer patrimonio",
      sComprar: "Cómo comprar bitcoin",
      sGeopolitica: "Geopolítica y por qué seguirla",
    },
    landing: {
      nostrNotice:
        "Esta plataforma usa inicio de sesión Nostr. Si no tienes una, puedes crear una cuenta simplificada con nosotros.",
      invest: "Empieza a invertir",
      haveAccount: "Ya tengo cuenta",
      enterAccount: "Entrar con cuenta SatVantage",
      enterExt: "Entrar con extensión Nostr",
      enterExtBusy: "Esperando la extensión…",
      securityTitle: "Seguridad como principio, no como eslogan",
      securityLede:
        "La plataforma solo accede a lo necesario para autenticar y operar. Tu clave privada no pasa por nuestro servidor.",
      eyebrow: "Aprende · Opera · Paga con Lightning",
      headlineBefore: "La puerta de entrada al ",
      headlineEm: "Bitcoin",
      headlineAfter: ".",
      knowPlatform: "Conoce la plataforma",
      lede: "Empieza a invertir o conecta tus carteras y exchanges favoritos, compra, vende y transfiere Bitcoin de forma simple, paga el día a día vía Lightning y gana satoshis en vivo aprendiendo.",
      ledeLine: "Para principiantes e inversores frecuentes.",
      ledeNote:
        "Esta plataforma usa login Nostr; si no tienes una, puedes crear una cuenta simplificada con nosotros.",
      trustSafe: "Entorno seguro",
      trustNostr: "Identidad Nostr",
      trustContent: "Contenido actualizado",
      presentation: "Presentación",
      bitcoinLive: "Bitcoin en vivo",
      vaultTitle: "Guardamos la bóveda, nunca la clave.",
      vaultBody:
        "En el camino con contraseña, la clave Nostr queda cifrada en tu navegador. Sin correo, sin dato personal obligatorio.",
      extTitle: "Extensión = la clave no sale de tu dispositivo.",
      extBody:
        "Con Alby o nos2x, solo pedimos una firma. Verificamos la prueba — no la clave.",
      copilotoEyebrow: "Extensión Chrome",
      copilotoTitle: "SatVantage Copiloto",
      copilotoCopy:
        "Lleva nuestra IA a otros sitios: pide una guía paso a paso o un análisis de riesgo en páginas de carteras, exchanges y ofertas de Bitcoin.",
      copilotoBtn: "Descargar extensión",
      copilotoBtnTitle: "Pronto",
      emergencyTitle: "Modo emergencia y fricción consciente.",
      emergencyBody:
        "Revoca conexiones en un toque si pierdes el aparato. En operaciones fuera de patrón, avisamos antes — tú decides.",
    },
    platform: {
      eyebrow: "Plataforma",
      titleBefore: "Tu ",
      titleEm: "puerta de entrada",
      titleAfter: " al mundo del Bitcoin",
      lede: "Integramos carteras y exchanges que ya conoces — o te ayudamos a elegir la ideal. Comprar, vender y transferir Bitcoin queda simple, seguro y transparente, para principiantes y expertos.",
      wallet: {
        title: "Conecta tu cartera",
        body: "Usa una en la que ya confías — hardware, móvil o Lightning. Sin migración, sin fricción.",
      },
      exchanges: {
        title: "Integra exchanges",
        body: "Mercado Bitcoin, Binance, Coinbase, Foxbit y más. Un solo panel para todo.",
      },
      trade: {
        title: "Compra, vende y transfiere",
        body: "Operaciones simplificadas en pocos toques, con mejor cotización en tiempo real.",
      },
      tax: {
        title: "Tributario",
        body: "Ayudamos con temas tributarios y de herencia mediante enseñanza especializada — para que decidas con claridad.",
      },
    },
    why: {
      eyebrow: "¿Por qué Bitcoin?",
      title: "Entiende el activo que está redefiniendo el dinero",
      lede: "Antes de invertir, es esencial comprender. Explicamos Bitcoin de forma simple, sin jerga y con la profundidad que necesitas.",
      sovereignty: {
        title: "Soberanía financiera",
        body: "Eres dueño de tu dinero. Sin intermediarios, sin censura, transparente por diseño.",
      },
      reserve: {
        title: "Reserva de valor digital",
        body: "Oferta limitada a 21 millones. Una protección real contra inflación y devaluación.",
      },
      tech: {
        title: "Tecnología que evoluciona",
        body: "De la red principal a Lightning: pagos instantáneos y globales, 24 horas al día, 7 días a la semana.",
      },
      socialLearn: "Aprende con nuestros videos en TikTok e Instagram",
      tiktok: "TikTok",
      instagram: "Instagram",
    },
    about: {
      eyebrow: "Sobre nosotros",
      title: "Educación en Bitcoin con propósito",
      p1: "SatVantage nació para democratizar el acceso al conocimiento sobre Bitcoin en Brasil. Somos un equipo de educadores, desarrolladores e inversores unidos por una visión: un futuro financiero más justo, transparente y soberano para todos.",
      p2: "Creemos que aprender debe ser envolvente, seguro y recompensador. Por eso combinamos contenido de alta calidad con gamificación real, donde cada lección concluida se convierte en satoshis en tu cartera.",
      security: {
        title: "Seguridad primero",
        body: "Enseñamos autocustodia responsable y buenas prácticas desde el día 1.",
      },
      content: {
        title: "Contenido",
        body: "Curaduría por especialistas activos en el ecosistema Bitcoin.",
      },
      community: {
        title: "Comunidad",
        body: "Un espacio para resolver dudas sin juicios, de lo básico a lo avanzado.",
      },
    },
    footer: {
      support: "Soporte",
      supportTo: "Enviar a",
      supportPlaceholder: "Escribe tu mensaje…",
      supportSend: "Enviar correo",
      supportSubject: "Soporte SatVantage",
      copyright: "© 2026 SatVantage. Todos los derechos reservados.",
      risk: "Invertir en Bitcoin implica riesgos. Estudia antes de invertir.",
    },
    tsim: {
      regionLabel: "Simulador de trade Bitcoin",
      realAccount: "CUENTA REAL",
      simulator: "SIMULADOR",
      equity: "Patrimonio",
      equityTip:
        "Valor total actual de la cuenta: Caja + valor de mercado de las posiciones en Bitcoin.",
      grossResult: "Resultado bruto",
      grossResultTip:
        "Ganancia o pérdida acumulada de las operaciones realizadas y en curso en esta sesión simulada.",
      cash: "Caja",
      cashTip:
        "Dinero disponible en reales, listo para nuevas compras en el simulador.",
      btcLabel: "BTC",
      btcTip:
        "Cantidad total de Bitcoins actualmente en la cartera simulada.",
      statsHoverHint: "Pasa el mouse sobre cada ítem para ver los detalles",
      resetAll: "REINICIAR TODO",
      backToChat: "Volver al chat",
      tourCta:
        "¿Nuevo en el terminal? Pide un tour guiado de la boleta, el gráfico y los indicadores.",
      requestTour: "Solicitar tutoría",
      closeFlash: "Cerrar aviso",
      time: "Tiempo",
      tf1m: "1 minuto",
      tf5m: "5 minutos",
      tf15m: "15 minutos",
      tf1h: "1 hora",
      chartAria: "Gráfico de velas {asset}",
      orderTicket: "Boleta",
      orderTicketAria: "Boleta de órdenes",
      asset: "Activo",
      buy: "Compra",
      sell: "Venta",
      type: "Tipo",
      market: "Mercado",
      limit: "Limitada",
      validity: "Validez",
      today: "Hoy",
      gtc: "Hasta ejecutar",
      qtyBtc: "Cantidad (BTC)",
      priceBrl: "Precio (R$)",
      takeProfit: "Objetivo",
      takeProfitPh: "Take profit",
      stopLoss: "Stop loss",
      stopLossPh: "Stop",
      clear: "LIMPIAR",
      buyAction: "COMPRAR",
      sellAction: "VENDER",
      assetsAria: "Lista de activos",
      assetCodePh: "Código del activo",
      featuredAssets: "Activos destacados",
      hint: "Entorno 100% simulado · patrimonio inicial R$ {cash} · sin sats reales.",
      stepOf: "Paso {current} de {total}",
      skipTour: "Saltar tutorial",
      next: "Siguiente",
      finish: "Finalizar",
      flashReset: "Posición y caja reiniciadas en el simulador.",
      flashTourDone: "Tutorial completado — ¡buena práctica en el simulador!",
      flashBadQty: "Introduce una cantidad válida.",
      flashBadPrice: "Introduce un precio válido.",
      flashNoCash: "Saldo insuficiente en el simulador.",
      flashNoBtc: "No tienes suficiente BTC para vender.",
      flashBuy:
        "Compra: invertiste R$ {notional} ({qty} BTC @ R$ {price}). Salida de caja. Caja ahora: R$ {cashAfter}. BTC: {btcAfter}.",
      flashSell:
        "Venta: entraron R$ {notional} a la caja ({qty} BTC @ R$ {price}). Caja ahora: R$ {cashAfter}. BTC: {btcAfter}.",
      requiredLegend: "* Campos obligatorios para enviar la orden",
      requiredMark: "*",
      optionalNote: "Opcional",
      tour: {
        mode: {
          title: "Modo Simulador",
          body: "Estás en una cuenta simulada — no se mueve ningún sat real. El selector deja claro que esto no es la cartera real.",
        },
        stats: {
          title: "Patrimonio y resultado",
          body: "Sigue la caja en R$, el BTC en posición, el patrimonio total y el resultado bruto de esta sesión ficticia. Pasa el mouse por los títulos para ver el significado de cada indicador.",
        },
        chart: {
          title: "Gráfico de velas",
          body: "Las velas muestran apertura, máxima, mínima y cierre del BTC. Azul sube; naranja baja. Úsalas para leer el movimiento antes de operar.",
        },
        timeframe: {
          title: "Tiempo del gráfico",
          body: "Elige la granularidad (1m, 5m, 15m, 1h). Intervalos menores reaccionan más rápido; mayores suavizan el ruido.",
        },
        ativos: {
          title: "Lista de activos",
          body: "Aquí cambias el par destacado (BTC/BRL, sats, etc.). El precio y la variación ayudan a elegir qué observar.",
        },
        side: {
          title: "Compra o venta",
          body: "En la boleta, elige Compra para adquirir BTC con la caja simulada, o Venta para liquidar una posición que ya tengas.",
        },
        tipo: {
          title: "Tipo de orden",
          body: "Mercado ejecuta ya al precio actual. Limitada solo entra si el mercado alcanza el precio que defines.",
        },
        qty: {
          title: "Cantidad",
          body: "Indica cuánto BTC quieres negociar. Empieza con valores pequeños (p. ej. 0,01) para entender el impacto en la caja.",
        },
        price: {
          title: "Precio",
          body: "En orden a mercado el precio es el último trade. En limitada, escribe el valor en R$ que aceptas pagar o recibir.",
        },
        risk: {
          title: "Objetivo y stop",
          body: "Campos de gestión de riesgo: objetivo (take profit) y stop loss. En el simulador sirven para practicar el hábito — anota tus metas.",
        },
        order: {
          title: "Confirmar orden",
          body: "LIMPIAR vacía la boleta. COMPRAR / VENDER ejecuta la orden simulada y actualiza caja, BTC y resultado bruto.",
        },
      },
    },
    nagai: {
      titleM1: "NagAI · Primeros pasos",
      titleM2: "NagAI · Billetera y Lightning",
      introM1:
        "¡Hola! Soy NagAI de SatVantage. Pregúntame sobre Bitcoin, satoshis, Lightning y autocustodia. Cuando quieras probar lo aprendido, toca Test de conocimientos.",
      introM2:
        "¡Hola! Aquí hablamos de billetera, frase de recuperación y Lightning en el día a día. Pregunta lo que quieras — o usa Test de conocimientos para practicar.",
      opening: "Abriendo NagAI…",
      knowledgeTest: "Test de conocimientos",
      backToChat: "Volver al chat NagAI",
      dashboard: "Dashboard",
      practiceMode: "Modo práctica · sin nuevos sats",
      simTag: "Terminal simulado · patrimonio ficticio · sin saldo real",
      simTitle: "Simulador · Test práctico",
      askPlaceholder: "Escribe tu duda sobre Bitcoin aquí...",
      skipQuestion: "Saltar pregunta",
      skipTest: "Saltar test",
      voiceHint: "Toca el micrófono para responder por voz",
      voiceListening: "Escuchando… di la respuesta o el número de la opción (1–4)",
      thisTest: "En este test: +{sats} sats",
      accountBalance: "Saldo en la cuenta: ⚡ {sats}",
      pickTestTitle: "¿Cómo quieres probar tus conocimientos?",
      pickTestDesc:
        "Teórico: una pregunta estratégica. Práctico abre el simulador de trade Bitcoin.",
      theoretical: "Teórica",
      theoreticalDesc: "Una pregunta estratégica · acierto 5 sats · error 3 · saltar 0.",
      practical: "Práctica",
      practicalDesc: "Simulador de trade Bitcoin con tutorial guiado.",
      cancel: "Cancelar",
      agentError:
        "No pude hablar con el mentor ahora. Intenta de nuevo en un momento — o usa Test de conocimientos.",
      skipAllAgent:
        "Está bien. Puedes volver al dashboard o seguir en el chat libre.",
      wantTheoretical: "Quiero el test teórico",
      quizIntroEarn:
        "¡Perfecto! Vamos a probar tu conocimiento con una pregunta rápida. Si aciertas ganas 5 sats; aunque lo intentes garantizas 3 sats de participación.",
      quizIntroPractice:
        "¡Perfecto! Vamos a revisar con una pregunta rápida — en esta cuenta es solo práctica, sin nuevos sats.",
      quizGateBodyBefore: "En esta cuenta los sats de este test",
      quizGateBodyStrong: "ya fueron acreditados",
      quizGateBodyAfter:
        ". Puedes rehacerlo para practicar, pero no ganas de nuevo.",
      quizGateRetry: "Rehacer sin nuevos sats",
      quizGateBackChat: "Volver al chat",
      quizEmpty: "Aún no hay preguntas en esta ruta. Puedes seguir en el chat libre.",
      reformulate: "¿Puedes reformular? Solo hablo de Bitcoin y autocustodia.",
      backToDashboard: "Volver al Dashboard",
      hitSats: "¡Acertaste — +{sats} sats!",
      trySats: "Participación registrada — +{sats} sats por intentarlo.",
      practiceNoSats: "Práctica — sin nuevos sats en esta cuenta.",
      skipThisQuestion: "Saltar esta pregunta",
      zeroSatsTest: "Ganaste 0 sats en este test.",
      zeroSatsClosed: "Test cerrado. Ganaste 0 sats esta vez.",
      zeroSatsQuestion: "Sin problema. Ganaste 0 sats en esta pregunta.",
      helpTitle: "¿En qué puedo ayudarte?",
      withNagai: "Con NagAI",
      satsAlready: "(ya acreditados en esta cuenta)",
      askNagai: "Resolver dudas con NagAI",
      earnSats: "Ganar sats respondiendo",
      testKnowledge: "Probar conocimientos",
      tradeSim: "Simulador de Trade",
      openFullscreen: "Abrir en pantalla grande",
      earnTitle: "Retoma el quiz y gana sats (5 al acertar · 3 al intentar)",
      practiceTitle:
        "Revisa el test de conocimientos — práctica sin nuevos sats en esta cuenta",
      titleM1Short: "Primeros pasos en Bitcoin",
      titleM2Short: "Billetera y Lightning",
      historyTitle: "Historial NagAI",
      historyDesc:
        "Conversaciones anteriores en este idioma. La lista muestra solo un resumen; los mensajes completos se cargan al elegir una.",
      historyEmpty: "Aún no hay conversaciones guardadas en este idioma.",
      historyMessages: "{n} mensajes",
      historyDelete: "Borrar conversación",
      historyOpen: "Historial",
      historyNew: "Nueva conversación",
    },
  },
};

type I18nCtx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dict;
};

const I18nContext = createContext<I18nCtx | null>(null);

/** Alias explícito do contexto de idioma (mesma API). */
export const LanguageContext = I18nContext;

const LOCALE_EVENT = "sv-locale-change";

function isLocale(v: unknown): v is Locale {
  return v === "pt" || v === "en" || v === "es";
}

function readLocale(): Locale {
  if (typeof window === "undefined") return "pt";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* ignore */
  }
  return "pt";
}

function htmlLang(locale: Locale) {
  return locale === "pt" ? "pt-BR" : locale;
}

function persistLocale(next: Locale) {
  document.documentElement.lang = htmlLang(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(
      new CustomEvent(LOCALE_EVENT, { detail: { locale: next } }),
    );
  } catch {
    /* ignore */
  }
}

/**
 * Contexto global de idioma (pt | en | es).
 * Persistido em localStorage (`sv_locale`) e sincronizado entre abas / telas.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readLocale());

  useEffect(() => {
    const next = readLocale();
    setLocaleState(next);
    document.documentElement.lang = htmlLang(next);

    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      if (isLocale(e.newValue)) {
        setLocaleState(e.newValue);
        document.documentElement.lang = htmlLang(e.newValue);
      }
    }

    function onCustom(e: Event) {
      const detail = (e as CustomEvent<{ locale?: Locale }>).detail;
      if (detail?.locale && isLocale(detail.locale)) {
        setLocaleState((prev) =>
          prev === detail.locale ? prev : (detail.locale as Locale),
        );
        document.documentElement.lang = htmlLang(detail.locale);
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCALE_EVENT, onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCALE_EVENT, onCustom as EventListener);
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Dicionário de um locale específico (útil para textos alinhados a um idioma fixo). */
export function dictFor(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.pt;
}

/** @deprecated use I18nProvider — alias para clareza de “LanguageContext” */
export const LanguageProvider = I18nProvider;

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n deve ser usado dentro de I18nProvider / LanguageProvider");
  }
  return ctx;
}

/** Alias semântico do hook de idioma. */
export const useLanguage = useI18n;

export const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "pt", label: "PT" },
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
];

/** 1 BTC = 100_000_000 sats */
export const SATS_PER_BTC = 100_000_000;

export function satsToFiat(sats: number, btcPrice: number) {
  if (!Number.isFinite(sats) || !Number.isFinite(btcPrice) || btcPrice <= 0) {
    return 0;
  }
  return (sats / SATS_PER_BTC) * btcPrice;
}

export function fmtBtc(sats: number, locale: Locale) {
  const btc = sats / SATS_PER_BTC;
  const loc = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
  return `${btc.toLocaleString(loc, {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  })} BTC`;
}

export function fmtMoney(n: number, currency: "BRL" | "USD", locale: Locale) {
  const loc = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
  return n.toLocaleString(loc, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "BRL" ? 2 : 2,
    minimumFractionDigits: 2,
  });
}
