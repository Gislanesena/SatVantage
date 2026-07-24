// popup.js — Side Panel do Copiloto.
// Backend de produção (sem chave de IA na extensão):
const API_BASE = "https://sat-vantage-gislanesena.vercel.app";

const CHIPS_DEFAULT = [
  { q: "Isso é golpe?", label: "Isso é golpe?" },
  { q: "Qual o preço do Bitcoin?", label: "Preço do Bitcoin" },
  { q: "Como crio uma carteira aqui?", label: "Como crio uma carteira aqui?" },
];

const CHIPS_OFICIAL = [
  { q: "Este é o site oficial SatVantage?", label: "É o site oficial?" },
  { q: "Qual o preço do Bitcoin?", label: "Preço do Bitcoin" },
  { q: "Me mostra o mapa do site SatVantage", label: "Mapa do site" },
  { q: "Como conecto a carteira aqui?", label: "Conectar carteira" },
  { q: "Onde fica a herança digital?", label: "Herança" },
];

/** @type {string} */
let currentPageUrl = "";

function isOfficialSatVantage(url) {
  if (globalThis.SVDomainCheck?.isOfficialSatVantageUrl) {
    return globalThis.SVDomainCheck.isOfficialSatVantageUrl(url);
  }
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "sat-vantage-gislanesena.vercel.app" ||
      host === "sat-vantage-iau60jdhv-gislanesena.vercel.app" ||
      (host.endsWith(".vercel.app") && /sat[-]?vantage/i.test(host))
    );
  } catch {
    return false;
  }
}

/** Sempre produção — a extensão local não depende de localhost. */
function resolveApiBase() {
  return API_BASE;
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
      if (/pre[cç]o|cotac|quanto vale|price/i.test(item.q)) {
        void mostrarPrecoBtc();
      }
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

  const official = isOfficialSatVantage(url);
  wrap.hidden = false;
  wrap.classList.toggle("is-official", official);
  urlEl.textContent = url;
  urlEl.title = url;
  if (badge) {
    badge.hidden = !official;
    if (official) {
      badge.dataset.seal = "ok";
      badge.textContent = "Site oficial SatVantage";
    }
  }
  if (headSub) {
    headSub.textContent = official
      ? "Site oficial reconhecido — resumo e guia com o mapa SatVantage."
      : "Ferramentas rápidas de segurança e Bitcoin nesta aba.";
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
const btnOficialEl = document.getElementById("btn-oficial");
const btnBtcEl = document.getElementById("btn-btc");
const statusEl = document.getElementById("status");
const resultadoEl = document.getElementById("resultado");
const badgeEl = document.getElementById("badge");
const riscoEl = document.getElementById("risco");
const explicacaoEl = document.getElementById("explicacao");
const passosTitleEl = document.getElementById("passos-title");
const passosEl = document.getElementById("passos");
const resultUrlEl = document.getElementById("result-url");

const domainResultEl = document.getElementById("domain-result");
const domainSealEl = document.getElementById("domain-seal");
const domainDetailEl = document.getElementById("domain-detail");

const btcCardEl = document.getElementById("btc-card");
const btcPriceEl = document.getElementById("btc-price");
const btcMetaEl = document.getElementById("btc-meta");

const cropEl = document.getElementById("crop");
const cropStageEl = document.getElementById("crop-stage");
const cropImgEl = document.getElementById("crop-img");
const cropRectEl = document.getElementById("crop-rect");
const cropOkEl = document.getElementById("crop-ok");
const cropCancelEl = document.getElementById("crop-cancel");
const historyListEl = document.getElementById("history-list");
const historyClearEl = document.getElementById("history-clear");
const historyWrapEl = document.getElementById("history-wrap");

/** @type {{ x: number, y: number, w: number, h: number } | null} */
let cropSel = null;
let cropDragging = false;
let cropStart = null;
let captureDataUrl = null;

function renderHistory(list) {
  if (!historyListEl || !historyWrapEl) return;
  historyListEl.innerHTML = "";
  if (!list || list.length === 0) {
    historyWrapEl.hidden = true;
    return;
  }
  historyWrapEl.hidden = false;
  for (const item of list) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sv-history-item";
    const when = item.at
      ? new Date(item.at).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    const host = (() => {
      try {
        return new URL(item.paginaUrl).hostname;
      } catch {
        return item.paginaUrl || "análise";
      }
    })();
    const risco = item.risco ? ` · ${item.risco}` : "";
    btn.textContent = `${when} — ${host}${risco}`;
    btn.title = item.explicacao || item.pergunta || host;
    btn.addEventListener("click", () => {
      showResult(
        {
          tipo: item.tipo,
          risco: item.risco,
          explicacao: item.explicacao,
          proximosPassos: item.proximosPassos,
          siteOficial: isOfficialSatVantage(item.paginaUrl),
          paginaUrl: item.paginaUrl,
        },
        item.paginaUrl,
        { skipSave: true },
      );
    });
    historyListEl.appendChild(btn);
  }
}

async function refreshHistoryUi() {
  if (!globalThis.SVStorage) return;
  const list = await globalThis.SVStorage.getHistory();
  renderHistory(list);
}

async function rememberMode(mode) {
  if (globalThis.SVStorage) {
    await globalThis.SVStorage.setPrefs({ lastMode: mode });
  }
}

async function saveAnalysis(data, pageUrl, mode, pergunta) {
  if (!globalThis.SVStorage) return;
  const list = await globalThis.SVStorage.pushHistory({
    paginaUrl: pageUrl || data.paginaUrl || "",
    pergunta: pergunta || "",
    risco: data.risco || "",
    explicacao: data.explicacao || "",
    proximosPassos: data.proximosPassos || [],
    tipo: data.tipo || "avaliacao",
    mode: mode || "page",
  });
  renderHistory(list);
}

void (async () => {
  await refreshPageContext();
  if (globalThis.SVStorage) {
    const prefs = await globalThis.SVStorage.getPrefs();
    document.body.dataset.theme = prefs.theme || "dark";
    await refreshHistoryUi();
  }
})();

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
  btnOficialEl.disabled = busy;
  btnBtcEl.disabled = busy;
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

/** Badge reutilizável: ok | unknown | suspicious | baixo | medio | alto */
function applySeal(el, seal, text) {
  if (!el) return;
  el.hidden = false;
  el.dataset.seal = seal;
  el.classList.add("sv-seal");
  el.textContent = text;
}

function showDomainResult(check) {
  domainResultEl.hidden = false;
  applySeal(domainSealEl, check.seal, check.title);
  domainDetailEl.textContent = check.detail || "";
}

function isPriceQuestion(text) {
  const s = String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    /preco|cotac|quanto (custa|vale)|price|btc\b|bitcoin/.test(s) &&
    /preco|cotac|quanto|vale|custa|price|hoje|agora/.test(s)
  );
}

function formatBrl(n) {
  return Number(n).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatUsd(n) {
  return Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

async function mostrarPrecoBtc() {
  resultadoEl.hidden = true;
  domainResultEl.hidden = true;
  hideCrop();
  setBusy(true);
  setStatus("Buscando cotação do Bitcoin…");

  try {
    const base = resolveApiBase();
    const res = await fetch(`${base}/api/market/btc?range=24h`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Falha na cotação (${res.status})`);

    const change = Number(data.changePct);
    const sign = change > 0 ? "+" : "";
    btcPriceEl.textContent = `${formatBrl(data.priceBrl)} · ${formatUsd(data.priceUsd)}`;
    btcMetaEl.textContent =
      `24h: ${sign}${change.toFixed(2)}%` +
      (data.updatedAt
        ? ` · atualizado ${new Date(data.updatedAt).toLocaleTimeString("pt-BR")}`
        : "");
    btcCardEl.hidden = false;
    setStatus("");
    await rememberMode("btc");
  } catch (e) {
    btcCardEl.hidden = true;
    setStatus(e?.message || "Não foi possível obter a cotação.", true);
  } finally {
    setBusy(false);
  }
}

async function verificarDominioOficial() {
  resultadoEl.hidden = true;
  btcCardEl.hidden = true;
  hideCrop();
  setBusy(true);
  setStatus("Verificando domínio (local)…");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url || "";
    showPageUrl(url);
    if (!globalThis.SVDomainCheck?.checkDomain) {
      throw new Error("Módulo de domínio não carregou.");
    }
    const check = globalThis.SVDomainCheck.checkDomain(url);
    showDomainResult(check);
    setStatus("");
    await rememberMode("domain");
  } catch (e) {
    domainResultEl.hidden = true;
    setStatus(e?.message || "Falha na checagem local.", true);
  } finally {
    setBusy(false);
  }
}

function showResult(data, pageUrl, opts) {
  btcCardEl.hidden = true;
  domainResultEl.hidden = true;

  const tipo = data.tipo === "guia" ? "guia" : "avaliacao";
  const url = pageUrl || data.paginaUrl || currentPageUrl || "";
  const oficial = !!data.siteOficial || isOfficialSatVantage(url);

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
      tipo === "avaliacao" ? "Site oficial SatVantage" : "SatVantage · guia";
    applySeal(riscoEl, "ok", "Risco baixo");
    riscoEl.dataset.nivel = "baixo";
    passosTitleEl.textContent = "Próximos passos";
  } else if (tipo === "guia") {
    riscoEl.hidden = true;
    badgeEl.hidden = false;
    badgeEl.className = "sv-badge sv-badge--guia";
    badgeEl.textContent = "Guia passo a passo";
    passosTitleEl.textContent = "Passos";
  } else {
    badgeEl.hidden = true;
    const nivel = normalizeRisco(data.risco);
    const seal = nivel === "alto" ? "suspicious" : nivel === "medio" ? "unknown" : "ok";
    const label =
      nivel === "alto" ? "Risco alto" : nivel === "medio" ? "Risco médio" : "Risco baixo";
    applySeal(riscoEl, seal, label);
    riscoEl.dataset.nivel = nivel;
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

  if (!opts?.skipSave) {
    void saveAnalysis(data, url, opts?.mode || "page", opts?.pergunta || "");
  }
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

/** Resumo local no site oficial — não depende do backend. */
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

  // Cotação: atalho local sem passar pela IA
  if (pergunta && isPriceQuestion(pergunta)) {
    await mostrarPrecoBtc();
    return;
  }

  resultadoEl.hidden = true;
  domainResultEl.hidden = true;
  btcCardEl.hidden = true;
  hideCrop();
  setBusy(true);
  setStatus(pergunta ? "Lendo a página…" : "Preparando resumo da página…");

  try {
    const page = await getPageTextFromTab();
    const url = page.url || currentPageUrl || "";

    if (!pergunta && isOfficialSatVantage(url)) {
      setStatus("");
      showResult(resumoOficialLocal(url, page.texto || ""), url, {
        mode: "page",
        pergunta,
      });
      await rememberMode("page");
      return;
    }

    const base = resolveApiBase();
    setStatus("Consultando o Copiloto…");

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
      if (isOfficialSatVantage(url)) {
        setStatus("");
        showResult(resumoOficialLocal(url, page.texto || ""), url, {
          mode: "page",
          pergunta,
        });
        await rememberMode("page");
        return;
      }
      throw new Error(data.error || `Falha no servidor (${res.status})`);
    }

    setStatus("");
    showResult(data, url, { mode: "page", pergunta });
    await rememberMode("page");
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
  domainResultEl.hidden = true;
  btcCardEl.hidden = true;
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
    setStatus("Marque a área na captura e confirme.");
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
    const base = resolveApiBase();

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
    showResult(data, url, { mode: "image", pergunta });
    await rememberMode("image");
  } catch (e) {
    setStatus(e?.message || "Falha ao analisar a imagem.", true);
  } finally {
    setBusy(false);
  }
}

btnOficialEl.addEventListener("click", () => {
  void verificarDominioOficial();
});

btnBtcEl.addEventListener("click", () => {
  void mostrarPrecoBtc();
});

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

if (historyClearEl) {
  historyClearEl.addEventListener("click", async () => {
    if (globalThis.SVStorage) {
      await globalThis.SVStorage.clearHistory();
      renderHistory([]);
    }
  });
}

perguntaEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    void analisar();
  }
});
