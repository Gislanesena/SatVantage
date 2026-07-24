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
    pauseReading: string;
    resumeReading: string;
    voiceHoldToStop: string;
    reading: string;
    voiceUnsupported: string;
    footerLabel: string;
    helpBtn: string;
    helpTitle: string;
    helpAudioTitle: string;
    helpAudioBody: string;
    helpVlibrasTitle: string;
    helpVlibrasBody: string;
    helpClose: string;
    closeDialog: string;
    loading: string;
    optionsLabel: string;
    panelTitle: string;
    panelIntro: string;
    panelTts: string;
    panelVlibras: string;
    panelSkip: string;
    listenMessage: string;
    listen: string;
    skipToContent: string;
    micStart: string;
    micStop: string;
    sendMessage: string;
    chatInput: string;
  };
  mentor: {
    name: string;
    close: string;
    exit: string;
    loading: string;
    typing: string;
    skipQuestion: string;
    skipConversation: string;
    continueM2: string;
    optionalTopics: string;
    goDashboard: string;
    closeChat: string;
    backToTopics: string;
    backToDashboard: string;
    practiceMode: string;
    redoWithoutSats: string;
    gateBody: string;
    send: string;
    askPlaceholder: string;
    openNagAI: string;
    closeNagAI: string;
    helpPrompt: string;
    importantDoubts: string;
    suggestions: string;
    withSats: string;
    satsAlready: string;
    earnSats: string;
    practice: string;
    m1Title: string;
    m2Title: string;
    sheetM1: string;
    sheetM2: string;
    introM1: string;
    introM2: string;
    skipAllM1: string;
    skipAllM2: string;
    guideSubtitle: string;
    nudgeNostr: string;
    createSimple: string;
    enterExt: string;
    downloadAlby: string;
    thanks: string;
    guideScript1: string;
    guideScript2: string;
    guideScript3: string;
    guideScript4: string;
    freeTopicLead: string;
    freeTopicDoneEmbedded: string;
    freeTopicDoneDash: string;
    askMore: string;
    practiceIntro: string;
    alreadySkipped: string;
    alreadyDone: string;
    skipAllOk: string;
    /** Use {n} for sats credited */
    satsWon: string;
    withdrawHint: string;
    /** Use {n} for balance */
    balanceLine: string;
    balanceGuaranteed: string;
    practiceDone: string;
    noNewSats: string;
    continuePromptM1: string;
    optionalTopicsPrompt: string;
    savingProgress: string;
    skipQUser: string;
    skipAllUser: string;
    okContinue: string;
    topicSkipOk: string;
    anotherTopicOrDash: string;
    extrasDone: string;
    anotherOptionalOrDash: string;
    rereadOrDash: string;
    sugPatrimonio: string;
    sugComprar: string;
    sugGeopolitica: string;
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
  },
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
  },
  auth: {
    back: string;
    titleCreate: string;
    titleLogin: string;
    titleRecover: string;
    ledeCreate: string;
    ledeLogin: string;
    ledeRecover: string;
    usernamePh: string;
    passwordPh: string;
    passwordMinPh: string;
    questionPh: string;
    answerPh: string;
    answerYourPh: string;
    hintSocial: string;
    createBtn: string;
    creating: string;
    loginBtn: string;
    opening: string;
    forgotPassword: string;
    foot: string;
    checkingUser: string;
    userAvailable: string;
    userTaken: string;
    userInvalid: string;
    questionShort: string;
    answerShort: string;
    createFail: string;
    loginFail: string;
    recoverFail: string;
    sessionWarn: string;
    goMyAccount: string;
    createAnyway: string;
    recoverHint: string;
    continue: string;
    searching: string;
    mnemonicPh: string;
    newPasswordPh: string;
    resetPassword: string;
    verifying: string;
    backupTitle: string;
    backupBody: string;
    copyWords: string;
    copied: string;
    alreadyNoted: string;
    confirmTitle: string;
    confirmBody: string;
    backToWords: string;
    confirmContinue: string;
    wrongOrder: string;
    gapsLabel: string;
    missingWordsLabel: string;
    phraseLabel: string;
    loading: string;
    claimTitle: string;
    claimMentorTitle: string;
    claimCopyBefore: string;
    claimCopyAfter: string;
    claimConfirm: string;
    claimBusy: string;
    claimOk: string;
    claimFail: string;
    claimBalance: string;
    claimEmpty: string;
    inactivityWarning: string;
    scanQr: string;
    pointCamera: string;
    scanToPay: string;
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
      pauseReading: "Pausar leitura",
      resumeReading: "Continuar leitura",
      voiceHoldToStop: "Segure para parar",
      reading: "Lendo…",
      voiceUnsupported: "Leitura por voz não disponível neste navegador",
      footerLabel: "Acessibilidade",
      helpBtn: "Ajuda de acessibilidade",
      helpTitle: "Acessibilidade",
      helpAudioTitle: "Ícone de áudio (canto inferior direito)",
      helpAudioBody:
        "Ele lê o texto da página em voz alta. Toque uma vez para começar; toque de novo para pausar; toque outra vez para continuar. Segure o botão para parar a leitura.",
      helpVlibrasTitle: "VLibras",
      helpVlibrasBody:
        "O botão VLibras (acima da ajuda de acessibilidade) traduz o conteúdo para Libras. Você pode configurar o idioma e as opções no próprio widget, do jeito que preferir.",
      helpClose: "Fechar",
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
      panelSkip: "Ir para o conteúdo: atalho no topo da página.",
      listenMessage: "Ouvir mensagem",
      listen: "Ouvir",
      skipToContent: "Ir para o conteúdo",
      micStart: "Microfone de voz",
      micStop: "Parar microfone",
      sendMessage: "Enviar mensagem",
      chatInput: "Mensagem para a NagAI",
    },
    mentor: {
      name: "NagAI",
      close: "Fechar",
      exit: "Sair",
      loading: "Abrindo conversa…",
      typing: "digitando…",
      skipQuestion: "Pular pergunta",
      skipConversation: "Pular conversa",
      continueM2: "Continuar · carteira e Lightning",
      optionalTopics: "Assuntos opcionais",
      goDashboard: "Ir para o dashboard financeiro",
      closeChat: "Fechar chat",
      backToTopics: "Voltar aos assuntos",
      backToDashboard: "Voltar ao dashboard",
      practiceMode: "Modo prática · sem novos sats",
      redoWithoutSats: "Refazer sem novos sats",
      gateBody:
        "Você já recebeu os sats desta mentoria nesta conta. Pode refazer a conversa para praticar — sem crédito extra.",
      send: "Enviar",
      askPlaceholder: "Digite sua dúvida…",
      openNagAI: "Abrir NagAI",
      closeNagAI: "Fechar NagAI",
      helpPrompt: "Em que posso te ajudar?",
      importantDoubts: "Dúvidas importantes",
      suggestions: "Sugestões",
      withSats: "Com NagAI · sats",
      satsAlready: "(já creditados nesta conta)",
      earnSats: "ganha sats",
      practice: "prática",
      m1Title: "NagAI · Primeiros passos",
      m2Title: "NagAI · Corretoras e Lightning",
      sheetM1: "Primeiros passos no Bitcoin",
      sheetM2: "Corretoras e Lightning",
      introM1:
        "Oi! Eu sou a NagAI, do SatVantage. Vou te explicar um ponto de cada vez e depois te perguntar se fez sentido. Pode pular uma pergunta ou a conversa inteira quando quiser.",
      introM2:
        "Agora o básico pra quem nunca abriu uma carteira: o que ela guarda, como proteger a frase de recuperação, e o que é Lightning no dia a dia. Pode pular pergunta ou a conversa toda.",
      skipAllM1:
        "Tudo bem. Na próxima você pode aprender carteira e Lightning — ou ir direto ao dashboard.",
      skipAllM2:
        "Sem problema. Se quiser, depois a gente fala de corretora, transferência e carteira fria — ou você vai direto ao dashboard.",
      guideSubtitle: "Mapa rápido do SatVantage",
      nudgeNostr: "Como entrar usando Nostr",
      createSimple: "Criar conta simplificada",
      enterExt: "Entrar com extensão Nostr",
      downloadAlby: "Baixar extensão Alby",
      thanks: "Entendi, obrigado",
      guideScript1:
        "Oi! Aqui no SatVantage a conta é uma identidade Nostr — um par de chaves. Assim você não precisa de e-mail, e a chave privada nunca fica no nosso servidor.",
      guideScript2:
        "Por que Nostr? Porque provar quem você é na internet não precisa ser um formulário com dado pessoal. Você assina um desafio; a gente só verifica a assinatura.",
      guideScript3:
        "Tem dois caminhos pra entrar:\n\n1) Conta simplificada — usuário e senha. Sua chave fica cifrada no navegador (o cofre). A gente guarda o cofre, nunca a chave em claro.\n\n2) Extensão Nostr (Alby ou nos2x) — a chave fica no seu dispositivo; no login você só autoriza uma assinatura.",
      guideScript4:
        "Pode criar a conta simplificada agora, ou abrir a extensão se já tiver. Qualquer dúvida, é só voltar aqui.",
      freeTopicLead: "Boa pergunta. Vou te explicar com calma.",
      freeTopicDoneEmbedded:
        "Pode fechar o chat ou abrir outro assunto no NagAI — o dashboard continua aí.",
      freeTopicDoneDash:
        "Pode voltar ao dashboard quando quiser — ou abrir outro assunto no NagAI.",
      askMore: "Quer perguntar mais alguma coisa sobre este assunto?",
      practiceIntro:
        "Vamos praticar de novo. Lembre: os sats desta conversa já foram creditados na sua conta — agora é só aprendizado.",
      alreadySkipped:
        "Você já tinha pulado esta conversa. Pode reler o que quiser acima ou seguir em frente.",
      alreadyDone:
        "Você já tinha concluído esta conversa. A conversa fica aqui se quiser reler.",
      skipAllOk:
        "Conversa pulada — sem problema. Enquanto você só pular, ainda pode voltar depois e ganhar sats na primeira conclusão de verdade.",
      satsWon:
        "Satoshis conquistados nesta conversa: ⚡ {n}. Eles ficam no saldo SatVantage da sua conta (ainda não foram para a carteira Lightning).",
      withdrawHint:
        "Garantia: o crédito está registrado na sua chave Nostr. Para sacar de verdade, no dashboard toque em Receber → voucher da mentoria e cole uma cobrança MutinyNet (lntbs) do valor exato.",
      balanceLine: "Saldo na conta: ⚡ {n} sats.",
      balanceGuaranteed: "Saldo garantido na conta: ⚡ {n} sats · saque em Receber",
      practiceDone:
        "Prática concluída. Nesta conta os sats desta conversa já foram creditados antes — refazer não gera saldo novo nem a diferença do que errou.",
      noNewSats: "Pronto. Desta vez não entrou sats novos (perguntas puladas).",
      continuePromptM1:
        "Quando quiser, seguimos para carteira e Lightning — ou você pode ir ao dashboard financeiro. A conversa continua visível se precisar reler.",
      optionalTopicsPrompt:
        "Se quiser aprofundar, tenho outros assuntos opcionais — corretora, como transferir para a carteira, carteira quente e fria. Pode escolher um, vários, ou nenhum.",
      savingProgress: "Pronto por aqui. Vou guardar o que você aprendeu nesta conversa.",
      skipQUser: "Pular esta pergunta",
      skipAllUser: "Quero pular a conversa",
      okContinue: "Sem problema. Seguimos.",
      topicSkipOk: "Beleza. O importante era a explicação.",
      anotherTopicOrDash: "Quer ver outro assunto, ou prefere ir ao dashboard?",
      extrasDone:
        "Esses eram os extras. Pode reler a conversa acima ou ir ao dashboard financeiro.",
      anotherOptionalOrDash: "Quer outro assunto opcional, ou vamos ao dashboard?",
      rereadOrDash: "Pode reler a conversa ou ir ao dashboard.",
      sugPatrimonio: "Como conquistar seu primeiro patrimônio",
      sugComprar: "Como comprar bitcoin",
      sugGeopolitica: "Geopolítica e por que acompanhar",
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
      socialLearn: "Aprenda com os nossos vídeos",
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
    auth: {
      back: "Voltar",
      titleCreate: "Criar conta",
      titleLogin: "Entrar",
      titleRecover: "Recuperar acesso",
      ledeCreate:
        "Usuário e senha. Por baixo, uma identidade Nostr real — a chave fica cifrada com a sua senha.",
      ledeLogin: "Abra o cofre da sua conta SatVantage.",
      ledeRecover: "Duas provas: pergunta de segurança e as 12 palavras de recuperação.",
      usernamePh: "usuário",
      passwordPh: "senha",
      passwordMinPh: "senha (mínimo 8 caracteres)",
      questionPh: "pergunta de segurança (só você sabe a resposta)",
      answerPh: "resposta",
      answerYourPh: "sua resposta",
      hintSocial: "Evite respostas que estejam nas suas redes sociais.",
      createBtn: "Criar conta",
      creating: "Criando cofre…",
      loginBtn: "Entrar",
      opening: "Abrindo cofre…",
      forgotPassword: "Esqueci minha senha",
      foot: "Sua conta é uma identidade Nostr. Guardamos o cofre, nunca a chave.",
      checkingUser: "Verificando usuário…",
      userAvailable: "Usuário disponível.",
      userTaken: "Esse usuário já está em uso. Escolha outro nome.",
      userInvalid: "Usuário inválido (3-20 caracteres: letras minúsculas, números, _).",
      questionShort: "Escreva uma pergunta de segurança (mínimo 8 caracteres).",
      answerShort: "Escreva a resposta da sua pergunta.",
      createFail: "Falha ao criar conta",
      loginFail: "Falha no login",
      recoverFail: "Falha na recuperação",
      sessionWarn:
        "Você já está conectado como {npub}. Criar uma conta nova gera uma identidade Nostr diferente — o saldo e o progresso da conta atual ficam nela, não passam para a nova.",
      goMyAccount: "Ir para minha conta",
      createAnyway: "Criar conta nova mesmo assim",
      recoverHint:
        "Vamos verificar a posse da conta: pergunta de segurança e as 12 palavras de recuperação.",
      continue: "Continuar",
      searching: "Buscando…",
      mnemonicPh: "12 palavras de recuperação (separadas por espaço)",
      newPasswordPh: "senha nova (mínimo 8 caracteres)",
      resetPassword: "Redefinir senha",
      verifying: "Verificando posse…",
      backupTitle: "Guarde suas 12 palavras",
      backupBody:
        "Esta frase é o documento de posse da sua conta. Você não vai usá-la no dia a dia — só se esquecer a senha (junto com a pergunta de segurança). Anote fora do computador. Ela não será mostrada de novo.",
      copyWords: "Copiar palavras",
      copied: "Copiada",
      alreadyNoted: "Já anotei, continuar",
      confirmTitle: "Confirme que anotou",
      confirmBody:
        "Complete as lacunas na ordem (1 → 2 → 3), clicando nas palavras abaixo. As lacunas não mudam se você voltar para conferir a frase.",
      backToWords: "Voltar para ver as palavras",
      confirmContinue: "Continuar para o SatVantage",
      wrongOrder: "Ordem errada — confira as palavras e tente de novo",
      gapsLabel: "Frase com lacunas",
      missingWordsLabel: "Palavras que faltam",
      phraseLabel: "Frase de recuperação",
      loading: "Carregando…",
      claimTitle: "Saldo SatVantage",
      claimMentorTitle: "Receber sats da mentoria",
      claimCopyBefore: "Gere na carteira MutinyNet uma cobrança de exatamente",
      claimCopyAfter: "sats (começa com lntbs) e cole abaixo.",
      claimConfirm: "Confirmar recebimento",
      claimBusy: "Recebendo…",
      claimOk: "Pronto: ⚡ {n} sats foram para a sua carteira.",
      claimFail: "falha no resgate",
      claimBalance: "Saldo SatVantage",
      claimEmpty: "Sem saldo para receber agora.",
      inactivityWarning:
        "Por inatividade, você vai ser desconectado em instantes — toque na tela para continuar conectado.",
      scanQr: "Ler QR code",
      pointCamera: "Aponte a câmera para o QR",
      scanToPay: "Escaneie para pagar (MutinyNet)",
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
      satsAlreadyProceed: "Proceed to review",
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
      pauseReading: "Pause reading",
      resumeReading: "Resume reading",
      voiceHoldToStop: "Hold to stop",
      reading: "Reading…",
      voiceUnsupported: "Speech readout is not available in this browser",
      footerLabel: "Accessibility",
      helpBtn: "Accessibility help",
      helpTitle: "Accessibility",
      helpAudioTitle: "Audio icon (bottom right)",
      helpAudioBody:
        "It reads the page text aloud. Tap once to start; tap again to pause; tap again to resume. Hold the button to stop reading.",
      helpVlibrasTitle: "VLibras",
      helpVlibrasBody:
        "The VLibras button (above the accessibility help icon) translates content into Brazilian Sign Language (Libras). You can set the language and options in the widget itself.",
      helpClose: "Close",
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
      listenMessage: "Listen to message",
      listen: "Listen",
      skipToContent: "Skip to content",
      micStart: "Voice microphone",
      micStop: "Stop microphone",
      sendMessage: "Send message",
      chatInput: "Message for NagAI",
    },
    mentor: {
      name: "NagAI",
      close: "Close",
      exit: "Exit",
      loading: "Opening chat…",
      typing: "typing…",
      skipQuestion: "Skip question",
      skipConversation: "Skip conversation",
      continueM2: "Continue · wallet and Lightning",
      optionalTopics: "Optional topics",
      goDashboard: "Go to financial dashboard",
      closeChat: "Close chat",
      backToTopics: "Back to topics",
      backToDashboard: "Back to dashboard",
      practiceMode: "Practice mode · no new sats",
      redoWithoutSats: "Redo without new sats",
      gateBody:
        "You already received sats for this mentorship on this account. You can redo the conversation to practice — with no extra credit.",
      send: "Send",
      askPlaceholder: "Type your question…",
      openNagAI: "Open NagAI",
      closeNagAI: "Close NagAI",
      helpPrompt: "How can I help you?",
      importantDoubts: "Important questions",
      suggestions: "Suggestions",
      withSats: "With NagAI · sats",
      satsAlready: "(already credited on this account)",
      earnSats: "earn sats",
      practice: "practice",
      m1Title: "NagAI · First steps",
      m2Title: "NagAI · Exchanges and Lightning",
      sheetM1: "First steps in Bitcoin",
      sheetM2: "Exchanges and Lightning",
      introM1:
        "Hi! I’m NagAI, from SatVantage. I’ll explain one point at a time and then ask if it made sense. You can skip a question or the whole conversation anytime.",
      introM2:
        "Now the basics for anyone who never opened a wallet: what it holds, how to protect the recovery phrase, and what Lightning is day to day. You can skip a question or the whole chat.",
      skipAllM1:
        "That’s fine. Next you can learn wallet and Lightning — or go straight to the dashboard.",
      skipAllM2:
        "No problem. Later we can talk about exchanges, transfers and cold wallets — or you can go straight to the dashboard.",
      guideSubtitle: "Quick map of SatVantage",
      nudgeNostr: "How to sign in with Nostr",
      createSimple: "Create simplified account",
      enterExt: "Sign in with Nostr extension",
      downloadAlby: "Download Alby extension",
      thanks: "Got it, thanks",
      guideScript1:
        "Hi! At SatVantage your account is a Nostr identity — a key pair. So you don’t need email, and your private key never sits on our server.",
      guideScript2:
        "Why Nostr? Proving who you are online doesn’t need a form with personal data. You sign a challenge; we only verify the signature.",
      guideScript3:
        "There are two ways in:\n\n1) Simplified account — username and password. Your key stays encrypted in the browser (the vault). We store the vault, never the key in clear.\n\n2) Nostr extension (Alby or nos2x) — the key stays on your device; at login you only authorize a signature.",
      guideScript4:
        "You can create the simplified account now, or open the extension if you already have one. Any questions, just come back here.",
      freeTopicLead: "Good question. I’ll explain it calmly.",
      freeTopicDoneEmbedded:
        "You can close the chat or open another topic in NagAI — the dashboard is still there.",
      freeTopicDoneDash:
        "You can go back to the dashboard whenever you want — or open another topic in NagAI.",
      askMore: "Want to ask anything else about this topic?",
      practiceIntro:
        "Let’s practice again. Remember: sats for this conversation were already credited to your account — now it’s just learning.",
      alreadySkipped:
        "You had already skipped this conversation. You can reread anything above or move on.",
      alreadyDone:
        "You had already finished this conversation. It stays here if you want to reread.",
      skipAllOk:
        "Conversation skipped — no problem. While you only skip, you can still come back later and earn sats on the first real completion.",
      satsWon:
        "Satoshis earned in this conversation: ⚡ {n}. They sit in your SatVantage account balance (not yet in your Lightning wallet).",
      withdrawHint:
        "Guarantee: the credit is tied to your Nostr key. To withdraw for real, on the dashboard tap Receive → mentorship voucher and paste a MutinyNet invoice (lntbs) for the exact amount.",
      balanceLine: "Account balance: ⚡ {n} sats.",
      balanceGuaranteed: "Guaranteed balance: ⚡ {n} sats · withdraw in Receive",
      practiceDone:
        "Practice complete. On this account, sats for this conversation were already credited — redoing doesn’t add new balance or make up what you missed.",
      noNewSats: "Done. No new sats this time (skipped questions).",
      continuePromptM1:
        "When you’re ready, we can continue to wallet and Lightning — or go to the financial dashboard. The conversation stays visible if you need to reread.",
      optionalTopicsPrompt:
        "If you want to go deeper, I have optional topics — exchanges, how to transfer to a wallet, hot and cold wallets. Pick one, several, or none.",
      savingProgress: "That’s it for now. I’ll save what you learned in this conversation.",
      skipQUser: "Skip this question",
      skipAllUser: "I want to skip the conversation",
      okContinue: "No problem. Let’s continue.",
      topicSkipOk: "Alright. The explanation was the important part.",
      anotherTopicOrDash: "Want another topic, or prefer the dashboard?",
      extrasDone:
        "Those were the extras. You can reread the conversation above or go to the financial dashboard.",
      anotherOptionalOrDash: "Want another optional topic, or shall we go to the dashboard?",
      rereadOrDash: "You can reread the conversation or go to the dashboard.",
      sugPatrimonio: "How to build your first nest egg",
      sugComprar: "How to buy bitcoin",
      sugGeopolitica: "Geopolitics and why it matters",
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
      sGeopolitica: "Geopolitics and why it matters",
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
      socialLearn: "Learn with our videos",
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
    auth: {
      back: "Back",
      titleCreate: "Create account",
      titleLogin: "Sign in",
      titleRecover: "Recover access",
      ledeCreate:
        "Username and password. Underneath, a real Nostr identity — the key is encrypted with your password.",
      ledeLogin: "Open the vault of your SatVantage account.",
      ledeRecover: "Two proofs: security question and your 12 recovery words.",
      usernamePh: "username",
      passwordPh: "password",
      passwordMinPh: "password (minimum 8 characters)",
      questionPh: "security question (only you know the answer)",
      answerPh: "answer",
      answerYourPh: "your answer",
      hintSocial: "Avoid answers that appear on your social networks.",
      createBtn: "Create account",
      creating: "Creating vault…",
      loginBtn: "Sign in",
      opening: "Opening vault…",
      forgotPassword: "I forgot my password",
      foot: "Your account is a Nostr identity. We store the vault, never the key.",
      checkingUser: "Checking username…",
      userAvailable: "Username available.",
      userTaken: "That username is taken. Choose another name.",
      userInvalid: "Invalid username (3-20 characters: lowercase letters, numbers, _).",
      questionShort: "Write a security question (minimum 8 characters).",
      answerShort: "Write the answer to your question.",
      createFail: "Failed to create account",
      loginFail: "Login failed",
      recoverFail: "Recovery failed",
      sessionWarn:
        "You are already signed in as {npub}. Creating a new account makes a different Nostr identity — balance and progress stay on the current one and do not move to the new one.",
      goMyAccount: "Go to my account",
      createAnyway: "Create a new account anyway",
      recoverHint:
        "We will verify account ownership: security question and the 12 recovery words.",
      continue: "Continue",
      searching: "Searching…",
      mnemonicPh: "12 recovery words (separated by spaces)",
      newPasswordPh: "new password (minimum 8 characters)",
      resetPassword: "Reset password",
      verifying: "Verifying ownership…",
      backupTitle: "Save your 12 words",
      backupBody:
        "This phrase is the ownership document for your account. You will not use it day to day — only if you forget your password (together with the security question). Write it down offline. It will not be shown again.",
      copyWords: "Copy words",
      copied: "Copied",
      alreadyNoted: "I wrote them down, continue",
      confirmTitle: "Confirm you wrote them down",
      confirmBody:
        "Fill the gaps in order (1 → 2 → 3) by tapping the words below. The gaps stay the same if you go back to check the phrase.",
      backToWords: "Back to see the words",
      confirmContinue: "Continue to SatVantage",
      wrongOrder: "Wrong order — check the words and try again",
      gapsLabel: "Phrase with gaps",
      missingWordsLabel: "Missing words",
      phraseLabel: "Recovery phrase",
      loading: "Loading…",
      claimTitle: "SatVantage balance",
      claimMentorTitle: "Receive mentorship sats",
      claimCopyBefore: "In your MutinyNet wallet, create an invoice for exactly",
      claimCopyAfter: "sats (starts with lntbs) and paste it below.",
      claimConfirm: "Confirm receipt",
      claimBusy: "Receiving…",
      claimOk: "Done: ⚡ {n} sats went to your wallet.",
      claimFail: "claim failed",
      claimBalance: "SatVantage balance",
      claimEmpty: "No balance to receive right now.",
      inactivityWarning:
        "Due to inactivity, you will be signed out shortly — tap the screen to stay signed in.",
      scanQr: "Scan QR code",
      pointCamera: "Point the camera at the QR",
      scanToPay: "Scan to pay (MutinyNet)",
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
      pauseReading: "Pausar lectura",
      resumeReading: "Continuar lectura",
      voiceHoldToStop: "Mantén pulsado para detener",
      reading: "Leyendo…",
      voiceUnsupported: "La lectura por voz no está disponible en este navegador",
      footerLabel: "Accesibilidad",
      helpBtn: "Ayuda de accesibilidad",
      helpTitle: "Accesibilidad",
      helpAudioTitle: "Icono de audio (esquina inferior derecha)",
      helpAudioBody:
        "Lee el texto de la página en voz alta. Toca una vez para empezar; otra vez para pausar; otra vez para continuar. Mantén pulsado el botón para detener la lectura.",
      helpVlibrasTitle: "VLibras",
      helpVlibrasBody:
        "El botón VLibras (encima de la ayuda de accesibilidad) traduce el contenido a lengua de señas. Puedes configurar el idioma y las opciones en el propio widget.",
      helpClose: "Cerrar",
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
      listenMessage: "Escuchar mensaje",
      listen: "Escuchar",
      skipToContent: "Ir al contenido",
      micStart: "Micrófono de voz",
      micStop: "Detener micrófono",
      sendMessage: "Enviar mensaje",
      chatInput: "Mensaje para NagAI",
    },
    mentor: {
      name: "NagAI",
      close: "Cerrar",
      exit: "Salir",
      loading: "Abriendo conversación…",
      typing: "escribiendo…",
      skipQuestion: "Saltar pregunta",
      skipConversation: "Saltar conversación",
      continueM2: "Continuar · cartera y Lightning",
      optionalTopics: "Temas opcionales",
      goDashboard: "Ir al dashboard financiero",
      closeChat: "Cerrar chat",
      backToTopics: "Volver a los temas",
      backToDashboard: "Volver al dashboard",
      practiceMode: "Modo práctica · sin nuevos sats",
      redoWithoutSats: "Repetir sin nuevos sats",
      gateBody:
        "Ya recibiste los sats de esta mentoría en esta cuenta. Puedes repetir la conversación para practicar — sin crédito extra.",
      send: "Enviar",
      askPlaceholder: "Escribe tu duda…",
      openNagAI: "Abrir NagAI",
      closeNagAI: "Cerrar NagAI",
      helpPrompt: "¿En qué puedo ayudarte?",
      importantDoubts: "Dudas importantes",
      suggestions: "Sugerencias",
      withSats: "Con NagAI · sats",
      satsAlready: "(ya acreditados en esta cuenta)",
      earnSats: "gana sats",
      practice: "práctica",
      m1Title: "NagAI · Primeros pasos",
      m2Title: "NagAI · Corretoras y Lightning",
      sheetM1: "Primeros pasos en Bitcoin",
      sheetM2: "Corretoras y Lightning",
      introM1:
        "¡Hola! Soy NagAI, de SatVantage. Te explico un punto a la vez y luego pregunto si tuvo sentido. Puedes saltar una pregunta o toda la conversación cuando quieras.",
      introM2:
        "Ahora lo básico para quien nunca abrió una cartera: qué guarda, cómo proteger la frase de recuperación y qué es Lightning en el día a día. Puedes saltar pregunta o toda la charla.",
      skipAllM1:
        "Está bien. La próxima puedes aprender cartera y Lightning — o ir directo al dashboard.",
      skipAllM2:
        "Sin problema. Después podemos hablar de exchanges, transferencias y cartera fría — o ir directo al dashboard.",
      guideSubtitle: "Mapa rápido de SatVantage",
      nudgeNostr: "Cómo entrar usando Nostr",
      createSimple: "Crear cuenta simplificada",
      enterExt: "Entrar con extensión Nostr",
      downloadAlby: "Descargar extensión Alby",
      thanks: "Entendido, gracias",
      guideScript1:
        "¡Hola! En SatVantage la cuenta es una identidad Nostr — un par de claves. Así no necesitas correo, y la clave privada nunca queda en nuestro servidor.",
      guideScript2:
        "¿Por qué Nostr? Porque demostrar quién eres en internet no necesita un formulario con dato personal. Firmas un desafío; solo verificamos la firma.",
      guideScript3:
        "Hay dos caminos para entrar:\n\n1) Cuenta simplificada — usuario y contraseña. Tu clave queda cifrada en el navegador (la bóveda). Guardamos la bóveda, nunca la clave en claro.\n\n2) Extensión Nostr (Alby o nos2x) — la clave queda en tu dispositivo; en el login solo autorizas una firma.",
      guideScript4:
        "Puedes crear la cuenta simplificada ahora, o abrir la extensión si ya tienes una. Cualquier duda, vuelve aquí.",
      freeTopicLead: "Buena pregunta. Te lo explico con calma.",
      freeTopicDoneEmbedded:
        "Puedes cerrar el chat o abrir otro tema en NagAI — el dashboard sigue ahí.",
      freeTopicDoneDash:
        "Puedes volver al dashboard cuando quieras — o abrir otro tema en NagAI.",
      askMore: "¿Quieres preguntar algo más sobre este tema?",
      practiceIntro:
        "Vamos a practicar de nuevo. Recuerda: los sats de esta conversación ya fueron acreditados en tu cuenta — ahora es solo aprendizaje.",
      alreadySkipped:
        "Ya habías saltado esta conversación. Puedes releer lo de arriba o seguir adelante.",
      alreadyDone:
        "Ya habías terminado esta conversación. Queda aquí si quieres releer.",
      skipAllOk:
        "Conversación saltada — sin problema. Mientras solo saltes, aún puedes volver después y ganar sats en la primera conclusión de verdad.",
      satsWon:
        "Satoshis conquistados en esta conversación: ⚡ {n}. Quedan en el saldo SatVantage de tu cuenta (aún no en la cartera Lightning).",
      withdrawHint:
        "Garantía: el crédito está registrado en tu clave Nostr. Para retirar de verdad, en el dashboard toca Recibir → voucher de la mentoría y pega un cobro MutinyNet (lntbs) del valor exacto.",
      balanceLine: "Saldo en la cuenta: ⚡ {n} sats.",
      balanceGuaranteed: "Saldo garantizado: ⚡ {n} sats · retiro en Recibir",
      practiceDone:
        "Práctica concluida. En esta cuenta los sats de esta conversación ya fueron acreditados — repetir no genera saldo nuevo ni la diferencia de lo que erraste.",
      noNewSats: "Listo. Esta vez no entraron sats nuevos (preguntas saltadas).",
      continuePromptM1:
        "Cuando quieras, seguimos con cartera y Lightning — o puedes ir al dashboard financiero. La conversación sigue visible si necesitas releer.",
      optionalTopicsPrompt:
        "Si quieres profundizar, tengo otros temas opcionales — exchange, cómo transferir a la cartera, cartera caliente y fría. Elige uno, varios o ninguno.",
      savingProgress: "Listo por aquí. Voy a guardar lo que aprendiste en esta conversación.",
      skipQUser: "Saltar esta pregunta",
      skipAllUser: "Quiero saltar la conversación",
      okContinue: "Sin problema. Seguimos.",
      topicSkipOk: "Vale. Lo importante era la explicación.",
      anotherTopicOrDash: "¿Quieres ver otro tema, o prefieres ir al dashboard?",
      extrasDone:
        "Esos eran los extras. Puedes releer la conversación de arriba o ir al dashboard financiero.",
      anotherOptionalOrDash: "¿Quieres otro tema opcional, o vamos al dashboard?",
      rereadOrDash: "Puedes releer la conversación o ir al dashboard.",
      sugPatrimonio: "Cómo conquistar tu primer patrimonio",
      sugComprar: "Cómo comprar bitcoin",
      sugGeopolitica: "Geopolítica y por qué seguirla",
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
      socialLearn: "Aprende con nuestros videos",
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
    auth: {
      back: "Volver",
      titleCreate: "Crear cuenta",
      titleLogin: "Entrar",
      titleRecover: "Recuperar acceso",
      ledeCreate:
        "Usuario y contraseña. Por debajo, una identidad Nostr real — la clave queda cifrada con tu contraseña.",
      ledeLogin: "Abre la bóveda de tu cuenta SatVantage.",
      ledeRecover: "Dos pruebas: pregunta de seguridad y las 12 palabras de recuperación.",
      usernamePh: "usuario",
      passwordPh: "contraseña",
      passwordMinPh: "contraseña (mínimo 8 caracteres)",
      questionPh: "pregunta de seguridad (solo tú sabes la respuesta)",
      answerPh: "respuesta",
      answerYourPh: "tu respuesta",
      hintSocial: "Evita respuestas que estén en tus redes sociales.",
      createBtn: "Crear cuenta",
      creating: "Creando bóveda…",
      loginBtn: "Entrar",
      opening: "Abriendo bóveda…",
      forgotPassword: "Olvidé mi contraseña",
      foot: "Tu cuenta es una identidad Nostr. Guardamos la bóveda, nunca la clave.",
      checkingUser: "Verificando usuario…",
      userAvailable: "Usuario disponible.",
      userTaken: "Ese usuario ya está en uso. Elige otro nombre.",
      userInvalid: "Usuario inválido (3-20 caracteres: minúsculas, números, _).",
      questionShort: "Escribe una pregunta de seguridad (mínimo 8 caracteres).",
      answerShort: "Escribe la respuesta de tu pregunta.",
      createFail: "Error al crear la cuenta",
      loginFail: "Error al iniciar sesión",
      recoverFail: "Error en la recuperación",
      sessionWarn:
        "Ya estás conectado como {npub}. Crear una cuenta nueva genera una identidad Nostr distinta — el saldo y el progreso de la cuenta actual se quedan en ella, no pasan a la nueva.",
      goMyAccount: "Ir a mi cuenta",
      createAnyway: "Crear cuenta nueva de todos modos",
      recoverHint:
        "Vamos a verificar la posesión de la cuenta: pregunta de seguridad y las 12 palabras de recuperación.",
      continue: "Continuar",
      searching: "Buscando…",
      mnemonicPh: "12 palabras de recuperación (separadas por espacio)",
      newPasswordPh: "contraseña nueva (mínimo 8 caracteres)",
      resetPassword: "Restablecer contraseña",
      verifying: "Verificando posesión…",
      backupTitle: "Guarda tus 12 palabras",
      backupBody:
        "Esta frase es el documento de posesión de tu cuenta. No la usarás en el día a día — solo si olvidas la contraseña (junto con la pregunta de seguridad). Anótala fuera del ordenador. No se mostrará de nuevo.",
      copyWords: "Copiar palabras",
      copied: "Copiada",
      alreadyNoted: "Ya las anoté, continuar",
      confirmTitle: "Confirma que las anotaste",
      confirmBody:
        "Completa los huecos en orden (1 → 2 → 3) tocando las palabras de abajo. Los huecos no cambian si vuelves a ver la frase.",
      backToWords: "Volver a ver las palabras",
      confirmContinue: "Continuar a SatVantage",
      wrongOrder: "Orden incorrecto — revisa las palabras e inténtalo de nuevo",
      gapsLabel: "Frase con huecos",
      missingWordsLabel: "Palabras que faltan",
      phraseLabel: "Frase de recuperación",
      loading: "Cargando…",
      claimTitle: "Saldo SatVantage",
      claimMentorTitle: "Recibir sats de la mentoría",
      claimCopyBefore: "Genera en la cartera MutinyNet un cobro de exactamente",
      claimCopyAfter: "sats (empieza con lntbs) y pégalo abajo.",
      claimConfirm: "Confirmar recepción",
      claimBusy: "Recibiendo…",
      claimOk: "Listo: ⚡ {n} sats fueron a tu cartera.",
      claimFail: "fallo en el canje",
      claimBalance: "Saldo SatVantage",
      claimEmpty: "Sin saldo para recibir ahora.",
      inactivityWarning:
        "Por inactividad, serás desconectado en instantes — toca la pantalla para seguir conectado.",
      scanQr: "Leer código QR",
      pointCamera: "Apunta la cámara al QR",
      scanToPay: "Escanea para pagar (MutinyNet)",
    },
  },
};

type I18nCtx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dict;
};

const I18nContext = createContext<I18nCtx | null>(null);

const LOCALE_EVENT = "sv-locale-change";

function readLocale(): Locale {
  if (typeof window === "undefined") return "pt";
  try {
    const boot = (window as Window & { __SV_LOCALE__?: string }).__SV_LOCALE__;
    if (boot === "pt" || boot === "en" || boot === "es") return boot;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "pt" || saved === "en" || saved === "es") return saved;
  } catch {
    /* ignore */
  }
  return "pt";
}

function htmlLang(locale: Locale) {
  return locale === "pt" ? "pt-BR" : locale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    const next = readLocale();
    setLocaleState(next);
    document.documentElement.lang = htmlLang(next);
    document.documentElement.setAttribute("translate", "no");
    document.documentElement.classList.add("notranslate");
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = htmlLang(next);
    document.documentElement.setAttribute("translate", "no");
    document.documentElement.classList.add("notranslate");
    try {
      localStorage.setItem(STORAGE_KEY, next);
      (window as Window & { __SV_LOCALE__?: string }).__SV_LOCALE__ = next;
      window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: { locale: next } }));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  // Remonta NÃO — key={locale} derrubava a mentoria ao trocar idioma.
  return (
    <I18nContext.Provider value={value}>
      <div className="notranslate sv-i18n-root" lang={htmlLang(locale)} translate="no">
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { locale: "pt", setLocale: () => {}, t: dictionaries.pt };
  }
  return ctx;
}

/** Dicionário de um locale específico (útil para textos alinhados a um idioma fixo). */
export function dictFor(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.pt;
}

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
