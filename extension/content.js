// content.js — texto visível + relatório heurístico de domínio (domain-check.js).
(function () {
  const MAX_CHARS = 8000;

  function pageText() {
    try {
      const raw = (document.body && document.body.innerText) || "";
      return raw
        .replace(/\s+\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .trim()
        .slice(0, MAX_CHARS);
    } catch {
      return "";
    }
  }

  function securityReport() {
    try {
      const check = globalThis.SVDomainCheck?.checkDomain;
      if (typeof check !== "function") return null;
      return check(location.href || "");
    } catch {
      return null;
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || (msg.type !== "SV_GET_PAGE_TEXT" && msg.type !== "SV_EXTRACT_PAGE")) {
      return;
    }
    const security = securityReport();
    sendResponse({
      ok: true,
      texto: pageText(),
      titulo: document.title || "",
      url: location.href || "",
      security,
      page: {
        url: location.href || "",
        title: document.title || "",
        excerpt: pageText(),
        security,
      },
    });
    return true;
  });
})();
