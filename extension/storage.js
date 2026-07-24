// storage.js — chrome.storage.local (preferências + histórico recente).
(function (global) {
  const PREFS_KEY = "sv_prefs";
  const HISTORY_KEY = "sv_history";
  const HISTORY_MAX = 10;

  const DEFAULT_PREFS = {
    theme: "dark",
    lastMode: "page", // page | image | domain | btc
  };

  function getStorage() {
    return global.chrome?.storage?.local;
  }

  async function getPrefs() {
    const store = getStorage();
    if (!store) return { ...DEFAULT_PREFS };
    const data = await store.get(PREFS_KEY);
    return { ...DEFAULT_PREFS, ...(data[PREFS_KEY] || {}) };
  }

  async function setPrefs(partial) {
    const store = getStorage();
    if (!store) return;
    const cur = await getPrefs();
    await store.set({ [PREFS_KEY]: { ...cur, ...partial } });
  }

  async function getHistory() {
    const store = getStorage();
    if (!store) return [];
    const data = await store.get(HISTORY_KEY);
    const list = data[HISTORY_KEY];
    return Array.isArray(list) ? list : [];
  }

  /**
   * @param {{
   *   paginaUrl?: string,
   *   pergunta?: string,
   *   risco?: string,
   *   explicacao?: string,
   *   proximosPassos?: string[],
   *   tipo?: string,
   *   mode?: string,
   * }} entry
   */
  async function pushHistory(entry) {
    const store = getStorage();
    if (!store) return [];
    const prev = await getHistory();
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: new Date().toISOString(),
      paginaUrl: entry.paginaUrl || "",
      pergunta: entry.pergunta || "",
      risco: entry.risco || "",
      explicacao: entry.explicacao || "",
      proximosPassos: Array.isArray(entry.proximosPassos)
        ? entry.proximosPassos.slice(0, 6)
        : [],
      tipo: entry.tipo || "avaliacao",
      mode: entry.mode || "page",
    };
    const next = [item, ...prev].slice(0, HISTORY_MAX);
    await store.set({ [HISTORY_KEY]: next });
    return next;
  }

  async function clearHistory() {
    const store = getStorage();
    if (!store) return;
    await store.set({ [HISTORY_KEY]: [] });
  }

  global.SVStorage = {
    getPrefs,
    setPrefs,
    getHistory,
    pushHistory,
    clearHistory,
    HISTORY_MAX,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
