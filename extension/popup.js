// popup.js — UI do Copiloto. Só envia texto da página + pergunta.
// Ajuste API_BASE se o Next não estiver em localhost:3000.
const API_BASE = "http://localhost:3000";

const perguntaEl = document.getElementById("pergunta");
const enviarEl = document.getElementById("enviar");
const statusEl = document.getElementById("status");
const resultadoEl = document.getElementById("resultado");
const riscoEl = document.getElementById("risco");
const explicacaoEl = document.getElementById("explicacao");
const passosEl = document.getElementById("passos");

document.querySelectorAll(".sv-chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    perguntaEl.value = btn.getAttribute("data-q") || "";
    perguntaEl.focus();
  });
});

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

function showResult(data) {
  const nivel = normalizeRisco(data.risco);
  riscoEl.dataset.nivel = nivel;
  riscoEl.textContent =
    nivel === "alto"
      ? "Risco alto"
      : nivel === "medio"
        ? "Risco médio"
        : "Risco baixo";

  explicacaoEl.textContent = data.explicacao || "Sem explicação.";

  passosEl.innerHTML = "";
  const passos = Array.isArray(data.proximosPassos) ? data.proximosPassos : [];
  if (passos.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Revise com calma antes de qualquer ação.";
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

function normalizeRisco(raw) {
  const s = String(raw || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (s.includes("alto")) return "alto";
  if (s.includes("medio") || s.includes("médio")) return "medio";
  return "baixo";
}

async function getPageTextFromTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("Nenhuma aba ativa.");
  if (!tab.url || !/^https?:/i.test(tab.url)) {
    throw new Error("Abra uma página http/https comum (não chrome:// nem a Chrome Web Store).");
  }

  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: "SV_GET_PAGE_TEXT" });
    if (res?.ok && typeof res.texto === "string") return res;
  } catch {
    // content script pode não estar injetado ainda — injeta sob demanda
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  });
  const res = await chrome.tabs.sendMessage(tab.id, { type: "SV_GET_PAGE_TEXT" });
  if (!res?.ok) throw new Error("Não foi possível ler o texto da página.");
  return res;
}

async function analisar() {
  const pergunta = (perguntaEl.value || "").trim();
  if (!pergunta) {
    setStatus("Escreva uma pergunta ou escolha uma sugestão.", true);
    return;
  }

  resultadoEl.hidden = true;
  enviarEl.disabled = true;
  setStatus("Lendo a página…");

  try {
    const page = await getPageTextFromTab();
    setStatus("Consultando o Copiloto…");

    const res = await fetch(`${API_BASE}/api/extension/analisar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paginaTexto: page.texto || "",
        pergunta,
        // metadados públicos da aba — sem sessão SatVantage
        paginaTitulo: page.titulo || "",
        paginaUrl: page.url || "",
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Falha no servidor (${res.status})`);
    }

    setStatus("");
    showResult(data);
  } catch (e) {
    setStatus(e?.message || "Falha ao analisar.", true);
  } finally {
    enviarEl.disabled = false;
  }
}

enviarEl.addEventListener("click", () => {
  void analisar();
});

perguntaEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    void analisar();
  }
});
