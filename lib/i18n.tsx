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
  },
};

type I18nCtx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dict;
};

const I18nContext = createContext<I18nCtx | null>(null);

function readLocale(): Locale {
  if (typeof window === "undefined") return "pt";
  try {
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
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = htmlLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { locale: "pt", setLocale: () => {}, t: dictionaries.pt };
  }
  return ctx;
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
