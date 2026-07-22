// popup.js — UI do Copiloto. Texto da página + pergunta, ou captura visual.
// Usa a origem da aba oficial (localhost ou Vercel) como API — assim o código local vale.
const API_FALLBACK = "http://localhost:3000";

const OFFICIAL_HOSTS = [
  "sat-vantage-iau60jdhv-gislanesena.vercel.app",
  "localhost",
  "127.0.0.1",
];

const CHIPS_DEFAULT = [
  { q: "Isso é golpe?", label: "Isso é golpe?" },
  { q: "Como crio uma carteira aqui?", label: "Como crio uma carteira aqui?" },
];

const CHIPS_OFICIAL = [
  { q: "Este é o site oficial SatVantage?", label: "É o site oficial?" },
  { q: "Me mostra o mapa do site SatVantage", label: "Mapa do site" },
  { q: "Como conecto a carteira aqui?", label: "Conectar carteira" },
  { q: "Onde fica a herança digital?", label: "Herança" },
];

/** @type {string} */
let currentPageUrl = "";

function isOfficialHost(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (OFFICIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return true;
    if (host.endsWith(".vercel.app") && /sat[-]?vantage/i.test(host)) return true;
    return false;
  } catch {
    return false;
  }
}

function resolveApiBase(pageUrl) {
  if (isOfficialHost(pageUrl)) {
    try {
      return new URL(pageUrl).origin;
    } catch {
      /* fallthrough */
    }
  }
  return API_FALLBACK;
}

function renderChips(official) {
  const wrap = document.querySelector(".sv-suggestions");
  if (!wrap) return;
  wrap.innerHTML = "";
  const list = official ? CHIPS_OFICIAL : CHIPS_DEFAULT;
  for (const item of list) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sv-chip";
    btn.setAttribute("data-q", item.q);
    btn.textContent = item.label;
    btn.addEventListener("click", () => {
      perguntaEl.value = item.q;
      perguntaEl.focus();
    });
    wrap.appendChild(btn);
  }
}

function showPageUrl(url) {
  currentPageUrl = url || "";
  const wrap = document.getElementById("page-url-wrap");
  const urlEl = document.getElementById("page-url");
  const badge = document.getElementById("page-url-badge");
  const headSub = document.getElementById("head-sub");
  if (!wrap || !urlEl) return;

  if (!url) {
    wrap.hidden = true;
    return;
  }

  const official = isOfficialHost(url);
  wrap.hidden = false;
  wrap.classList.toggle("is-official", official);
  urlEl.textContent = url;
  urlEl.title = url;
  if (badge) badge.hidden = !official;
  if (headSub) {
    headSub.textContent = official
      ? "Site oficial reconhecido — resumo e guia com o mapa SatVantage."
      : "Ajuda rápida sobre Bitcoin e segurança nesta página.";
  }
  renderChips(official);
}

async function refreshPageContext() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    showPageUrl(tab?.url || "");
  } catch {
    showPageUrl("");
    renderChips(false);
  }
}

const perguntaEl = document.getElementById("pergunta");
const enviarEl = document.getElementById("enviar");
const capturarEl = document.getElementById("capturar");
const statusEl = document.getElementById("status");
const resultadoEl = document.getElementById("resultado");
const badgeEl = document.getElementById("badge");
const riscoEl = document.getElementById("risco");
const explicacaoEl = document.getElementById("explicacao");
const passosTitleEl = document.getElementById("passos-title");
const passosEl = document.getElementById("passos");
const resultUrlEl = document.getElementById("result-url");

const cropEl = document.getElementById("crop");
const cropStageEl = document.getElementById("crop-stage");
const cropImgEl = document.getElementById("crop-img");
const cropRectEl = document.getElementById("crop-rect");
const cropOkEl = document.getElementById("crop-ok");
const cropCancelEl = document.getElementById("crop-cancel");

/** @type {{ x: number, y: number, w: number, h: number } | null} */
let cropSel = null;
let cropDragging = false;
let cropStart = null;
let captureDataUrl = null;

void refreshPageContext();

function setStatus(text, isError) {
  if (!text) {
    statusEl.hidden = true;
    statusEl.textContent = "";
    statusEl.classList.remove("is-error");
    return;
  }
  statusEl.hidden = false;
  statusEl.textContent = text;
  statusEl.classList.toggle("is-error", !!isError);
}

function setBusy(busy) {
  enviarEl.disabled = busy;
  capturarEl.disabled = busy;
  cropOkEl.disabled = busy || !cropSel || cropSel.w < 8 || cropSel.h < 8;
}

function normalizeRisco(raw) {
  const s = String(raw || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (s.includes("alto")) return "alto";
  if (s.includes("medio") || s.includes("médio")) return "medio";
  return "baixo";
}

function showResult(data, pageUrl) {
  const tipo = data.tipo === "guia" ? "guia" : "avaliacao";
  const url = pageUrl || data.paginaUrl || currentPageUrl || "";
  const oficial = !!data.siteOficial || isOfficialHost(url);

  if (resultUrlEl) {
    if (url) {
      resultUrlEl.hidden = false;
      resultUrlEl.textContent = oficial ? `URL oficial: ${url}` : `URL analisada: ${url}`;
    } else {
      resultUrlEl.hidden = true;
    }
  }

  if (oficial) {
    badgeEl.hidden = false;
    badgeEl.className = "sv-badge sv-badge--guia";
    badgeEl.textContent =
      tipo === "avaliacao" ? "✅ Site oficial SatVantage" : "🧭 SatVantage · guia";
    riscoEl.hidden = false;
    riscoEl.dataset.nivel = "baixo";
    riscoEl.textContent = "🛡 Risco baixo";
    passosTitleEl.textContent = "Próximos passos";
  } else if (tipo === "guia") {
    riscoEl.hidden = true;
    badgeEl.hidden = false;
    badgeEl.className = "sv-badge sv-badge--guia";
    badgeEl.textContent = "🧭 Guia passo a passo";
    passosTitleEl.textContent = "Passos";
  } else {
    badgeEl.hidden = true;
    riscoEl.hidden = false;
    const nivel = normalizeRisco(data.risco);
    riscoEl.dataset.nivel = nivel;
    riscoEl.textContent =
      nivel === "alto"
        ? "🛡 Risco alto"
        : nivel === "medio"
          ? "🛡 Risco médio"
          : "🛡 Risco baixo";
    passosTitleEl.textContent = "Próximos passos";
  }

  explicacaoEl.textContent = data.explicacao || "Sem explicação.";

  passosEl.innerHTML = "";
  const passos = Array.isArray(data.proximosPassos) ? data.proximosPassos : [];
  if (passos.length === 0) {
    const li = document.createElement("li");
    li.textContent =
      tipo === "guia"
        ? "Revise a página com calma e confirme cada botão antes de clicar."
        : "Revise com calma antes de qualquer ação.";
    passosEl.appendChild(li);
  } else {
    for (const p of passos) {
      const li = document.createElement("li");
      li.textContent = String(p);
      passosEl.appendChild(li);
    }
  }

  resultadoEl.hidden = false;
}

async function getPageTextFromTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("Nenhuma aba ativa.");
  if (!tab.url || !/^https?:/i.test(tab.url)) {
    throw new Error("Abra uma página http/https comum (não chrome:// nem a Chrome Web Store).");
  }

  showPageUrl(tab.url);

  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: "SV_GET_PAGE_TEXT" });
    if (res?.ok && typeof res.texto === "string") {
      const url = res.url || tab.url;
      showPageUrl(url);
      return { ...res, url, tabId: tab.id, windowId: tab.windowId };
    }
  } catch {
    // content script pode não estar injetado ainda
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  });
  const res = await chrome.tabs.sendMessage(tab.id, { type: "SV_GET_PAGE_TEXT" });
  if (!res?.ok) throw new Error("Não foi possível ler o texto da página.");
  const url = res.url || tab.url;
  showPageUrl(url);
  return { ...res, url, tabId: tab.id, windowId: tab.windowId };
}

function detectarAreaLocal(url, texto) {
  const path = (() => {
    try {
      return new URL(url || "").pathname.toLowerCase();
    } catch {
      return "/";
    }
  })();
  const blob = String(texto || "").toLowerCase();

  if (/heranca|herança|prova de vida|herdeiro|carimbo/.test(blob) || path.includes("heranca")) {
    return {
      area: "Herança digital",
      dica: "Aqui você organiza herdeiros, carimba o plano e confirma que está bem — sem custodiarmos suas chaves.",
    };
  }
  if (/conectar carteira|nostr\+walletconnect|mutinynet|\bnwc\b|enviar|receber/.test(blob)) {
    return {
      area: "Dashboard · carteira Lightning",
      dica: "Conecte NWC MutinyNet, envie/receba sats de teste ou saque o crédito SatVantage.",
    };
  }
  if (/mentoria|nagai|primeiros passos/.test(blob)) {
    return {
      area: "Mentoria NagAI",
      dica: "Guia de primeiros passos — pode seguir ou pular; o chat continua no canto depois.",
    };
  }
  if (/saldo dispon|crédito satvantage|sacar sat|extrato/.test(blob)) {
    return {
      area: "Dashboard financeiro",
      dica: "Seu saldo, créditos da jornada e atalhos para movimentar sats com segurança.",
    };
  }
  if (
    /criar conta|acessar conta|bitcoin ao vivo|extensão/.test(blob) ||
    path === "/" ||
    path === ""
  ) {
    return {
      area: "Início (landing)",
      dica: "Porta de entrada SatVantage: criar/acessar conta, Bitcoin ao vivo e a proposta da plataforma.",
    };
  }
  return {
    area: "Site oficial SatVantage",
    dica: "Você está em casa — dashboard, menu ⚙️ (herança/emergência) e NagAI no canto.",
  };
}

/** Resumo local no site oficial — não depende do backend (funciona mesmo no Vercel antigo). */
function resumoOficialLocal(url, texto) {
  const { area, dica } = detectarAreaLocal(url, texto);
  const urlLabel = (url || "").split("?")[0] || url;
  return {
    tipo: "guia",
    risco: "baixo",
    siteOficial: true,
    paginaUrl: url,
    explicacao:
      `URL oficial reconhecida: ${urlLabel}. ` +
      `Você está em “${area}”. ${dica} ` +
      "A SatVantage caminha com você no Bitcoin: mentoria, Lightning de teste e herança sem custódia de chaves. Explore com calma — estamos do seu lado.",
    proximosPassos: [
      `Confira na barra: ${urlLabel}`,
      "Conta Nostr → dashboard (saldo, carteira, sacar sats recebidos).",
      "Menu ⚙️: Herança digital e Modo emergência.",
      "NagAI no canto para dúvidas; chips acima para atalhos (mapa, carteira, herança).",
    ],
  };
}

async function analisar() {
  const pergunta = (perguntaEl.value || "").trim();
  // pergunta vazia = resumo de onde o usuário está

  resultadoEl.hidden = true;
  hideCrop();
  setBusy(true);
  setStatus(pergunta ? "Lendo a página…" : "Preparando resumo da página…");

  try {
    const page = await getPageTextFromTab();
    const url = page.url || currentPageUrl || "";

    // Site oficial + sem pergunta → resumo local (não chama API que ainda exige pergunta).
    if (!pergunta && isOfficialHost(url)) {
      setStatus("");
      showResult(resumoOficialLocal(url, page.texto || ""), url);
      return;
    }

    const base = resolveApiBase(url);
    setStatus("Consultando o Copiloto…");

    // Se o backend antigo exigir pergunta, enviamos um pedido de resumo padrão.
    const perguntaEnvio =
      pergunta ||
      "Faça um breve resumo de onde estou nesta página (URL e o que aparece na tela).";

    const res = await fetch(`${base}/api/extension/analisar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paginaTexto: page.texto || "",
        pergunta: perguntaEnvio,
        paginaTitulo: page.titulo || "",
        paginaUrl: url,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Fallback: se ainda assim falhar no site oficial, resume localmente.
      if (isOfficialHost(url)) {
        setStatus("");
        showResult(resumoOficialLocal(url, page.texto || ""), url);
        return;
      }
      throw new Error(data.error || `Falha no servidor (${res.status})`);
    }

    setStatus("");
    showResult(data, url);
  } catch (e) {
    setStatus(e?.message || "Falha ao analisar.", true);
  } finally {
    setBusy(false);
  }
}

function hideCrop() {
  cropEl.hidden = true;
  captureDataUrl = null;
  cropSel = null;
  cropImgEl.removeAttribute("src");
  cropRectEl.style.display = "none";
  cropOkEl.disabled = true;
}

function clientToImageCoords(clientX, clientY) {
  const img = cropImgEl.getBoundingClientRect();
  const x = Math.min(Math.max(clientX - img.left, 0), img.width);
  const y = Math.min(Math.max(clientY - img.top, 0), img.height);
  return {
    x,
    y,
    imgW: img.width,
    imgH: img.height,
    scrollLeft: cropStageEl.scrollLeft,
    scrollTop: cropStageEl.scrollTop,
  };
}

function updateCropRect() {
  if (!cropSel || cropSel.w < 2 || cropSel.h < 2) {
    cropRectEl.style.display = "none";
    cropOkEl.disabled = true;
    return;
  }
  cropRectEl.style.display = "block";
  cropRectEl.style.left = `${cropImgEl.offsetLeft + cropSel.x}px`;
  cropRectEl.style.top = `${cropImgEl.offsetTop + cropSel.y}px`;
  cropRectEl.style.width = `${cropSel.w}px`;
  cropRectEl.style.height = `${cropSel.h}px`;
  cropOkEl.disabled = false;
}

cropStageEl.addEventListener("pointerdown", (e) => {
  if (!captureDataUrl) return;
  cropStageEl.setPointerCapture(e.pointerId);
  cropDragging = true;
  const p = clientToImageCoords(e.clientX, e.clientY);
  cropStart = { x: p.x, y: p.y };
  cropSel = { x: p.x, y: p.y, w: 0, h: 0 };
  updateCropRect();
});

cropStageEl.addEventListener("pointermove", (e) => {
  if (!cropDragging || !cropStart) return;
  const p = clientToImageCoords(e.clientX, e.clientY);
  const x1 = Math.min(cropStart.x, p.x);
  const y1 = Math.min(cropStart.y, p.y);
  const x2 = Math.max(cropStart.x, p.x);
  const y2 = Math.max(cropStart.y, p.y);
  cropSel = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  updateCropRect();
});

function endCropDrag(e) {
  if (!cropDragging) return;
  cropDragging = false;
  try {
    cropStageEl.releasePointerCapture(e.pointerId);
  } catch {
    /* ignore */
  }
  updateCropRect();
}

cropStageEl.addEventListener("pointerup", endCropDrag);
cropStageEl.addEventListener("pointercancel", endCropDrag);

async function startCapture() {
  resultadoEl.hidden = true;
  setBusy(true);
  setStatus("Capturando a aba…");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.windowId) throw new Error("Nenhuma aba ativa.");
    if (!tab.url || !/^https?:/i.test(tab.url)) {
      throw new Error("Abra uma página http/https comum para capturar.");
    }
    showPageUrl(tab.url);

    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });
    if (!dataUrl) throw new Error("Não foi possível capturar a aba.");

    captureDataUrl = dataUrl;
    cropSel = null;
    cropImgEl.onload = () => {
      cropRectEl.style.display = "none";
      cropOkEl.disabled = true;
    };
    cropImgEl.src = dataUrl;
    cropEl.hidden = false;
    setStatus("Marque a área na captura (ou analise a aba inteira selecionando tudo).");
  } catch (e) {
    hideCrop();
    setStatus(e?.message || "Falha ao capturar a tela.", true);
  } finally {
    setBusy(false);
  }
}

function cropToPngDataUrl() {
  return new Promise((resolve, reject) => {
    if (!captureDataUrl || !cropSel || cropSel.w < 8 || cropSel.h < 8) {
      reject(new Error("Selecione uma área maior na captura."));
      return;
    }
    const img = new Image();
    img.onload = () => {
      const scaleX = img.naturalWidth / cropImgEl.clientWidth;
      const scaleY = img.naturalHeight / cropImgEl.clientHeight;
      const sx = Math.round(cropSel.x * scaleX);
      const sy = Math.round(cropSel.y * scaleY);
      const sw = Math.max(1, Math.round(cropSel.w * scaleX));
      const sh = Math.max(1, Math.round(cropSel.h * scaleY));

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas indisponível."));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Falha ao ler a captura."));
    img.src = captureDataUrl;
  });
}

async function analisarImagem() {
  const pergunta =
    (perguntaEl.value || "").trim() ||
    "Há sinais visuais de golpe, phishing ou clonagem nesta captura?";

  setBusy(true);
  setStatus("Recortando e analisando a imagem…");

  try {
    const page = await getPageTextFromTab().catch(() => ({
      texto: "",
      titulo: "",
      url: currentPageUrl || "",
    }));
    const cropped = await cropToPngDataUrl();
    const base64 = cropped.replace(/^data:image\/png;base64,/, "");
    const url = page.url || currentPageUrl || "";
    const base = resolveApiBase(url);

    const res = await fetch(`${base}/api/extension/analisar-imagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imagemBase64: base64,
        mediaType: "image/png",
        pergunta,
        paginaTexto: page.texto || "",
        paginaTitulo: page.titulo || "",
        paginaUrl: url,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Falha no servidor (${res.status})`);
    }

    hideCrop();
    setStatus("");
    showResult(data, url);
  } catch (e) {
    setStatus(e?.message || "Falha ao analisar a imagem.", true);
  } finally {
    setBusy(false);
  }
}

enviarEl.addEventListener("click", () => {
  void analisar();
});

capturarEl.addEventListener("click", () => {
  void startCapture();
});

cropOkEl.addEventListener("click", () => {
  void analisarImagem();
});

cropCancelEl.addEventListener("click", () => {
  hideCrop();
  setStatus("");
});

perguntaEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    void analisar();
  }
});
