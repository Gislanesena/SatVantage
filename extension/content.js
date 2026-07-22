// content.js — extrai só o texto visível da página. Nada de cookies, storage ou conta.
(function () {
  const MAX_CHARS = 8000;

  function pageText() {
    try {
      const raw = (document.body && document.body.innerText) || "";
      return raw.replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim().slice(0, MAX_CHARS);
    } catch {
      return "";
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || msg.type !== "SV_GET_PAGE_TEXT") return;
    sendResponse({
      ok: true,
      texto: pageText(),
      titulo: document.title || "",
      url: location.href || "",
    });
    return true;
  });
})();
