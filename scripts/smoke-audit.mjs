/**
 * Smoke audit SatVantage — rotas API, agente, mercado, artefatos estáticos.
 * Uso: node scripts/smoke-audit.mjs
 * Env: BASE_URL (default http://127.0.0.1:3000), AGENTS_URL (default http://127.0.0.1:8001)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";
const AGENTS = process.env.AGENTS_URL || "http://127.0.0.1:8001";

/** @type {{ id: string; status: "PASS"|"FAIL"|"WARN"|"SKIP"; detail: string }[]} */
const results = [];

function record(id, status, detail) {
  results.push({ id, status, detail });
  const mark = status === "PASS" ? "✓" : status === "WARN" ? "!" : status === "SKIP" ? "·" : "✗";
  console.log(`${mark} [${status}] ${id} — ${detail}`);
}

async function httpJson(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { Accept: "application/json", ...(opts.headers || {}) },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { res, text, json };
}

function fileHas(rel, patterns) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return { ok: false, reason: `missing ${rel}` };
  const src = fs.readFileSync(p, "utf8");
  for (const pat of patterns) {
    const re = typeof pat === "string" ? new RegExp(pat) : pat;
    if (!re.test(src)) return { ok: false, reason: `${rel} missing /${re}/` };
  }
  return { ok: true, reason: "ok" };
}

function noSpeakButtonUsage() {
  const comps = path.join(ROOT, "components");
  const files = fs.readdirSync(comps).filter((f) => f.endsWith(".tsx"));
  for (const f of files) {
    if (f === "SpeakButton.tsx") continue;
    const src = fs.readFileSync(path.join(comps, f), "utf8");
    if (/SpeakButton/.test(src)) {
      return { ok: false, reason: `${f} still imports/uses SpeakButton` };
    }
  }
  return { ok: true, reason: "no bubble SpeakButton usage" };
}

async function main() {
  console.log(`\n=== SatVantage smoke audit ===\nBASE=${BASE}\nAGENTS=${AGENTS}\n`);

  // --- HTTP: home ---
  try {
    const res = await fetch(BASE, { redirect: "follow" });
    record(
      "site.home",
      res.ok ? "PASS" : "FAIL",
      `GET / → ${res.status}`,
    );
  } catch (e) {
    record("site.home", "FAIL", String(e.message || e));
  }

  // --- market ---
  try {
    const { res, json } = await httpJson(`${BASE}/api/market/btc?range=24h`);
    const ok =
      res.ok &&
      json &&
      typeof json.priceBrl === "number" &&
      json.priceBrl > 0;
    record(
      "api.market.btc",
      ok ? "PASS" : "FAIL",
      ok
        ? `BRL=${json.priceBrl} USD=${json.priceUsd}`
        : `status=${res.status} body=${JSON.stringify(json)?.slice(0, 120)}`,
    );
  } catch (e) {
    record("api.market.btc", "FAIL", String(e.message || e));
  }

  // --- agents health ---
  try {
    const { res, json } = await httpJson(`${AGENTS}/health`);
    record(
      "agents.health",
      res.ok && json?.status === "ok" ? "PASS" : "FAIL",
      JSON.stringify(json),
    );
  } catch (e) {
    record("agents.health", "FAIL", String(e.message || e));
  }

  // --- mentor via Next proxy ---
  try {
    const { res, json } = await httpJson(`${BASE}/api/agents/mentor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensagem_usuario: "Em uma frase: o que é Bitcoin?",
        nivel_conhecimento: "iniciante",
        idioma: "pt",
      }),
    });
    const text = json?.resposta_ia || "";
    const ok = res.ok && text.length > 20;
    record(
      "nagai.chat.send",
      ok ? "PASS" : "FAIL",
      ok ? `reply ${text.length} chars` : `status=${res.status}`,
    );
  } catch (e) {
    record("nagai.chat.send", "FAIL", String(e.message || e));
  }

  // --- quote + year ---
  try {
    const { res, json } = await httpJson(`${BASE}/api/agents/mentor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensagem_usuario:
          "Qual a cotação do Bitcoin agora em BRL e USD? Em que ano estamos?",
        nivel_conhecimento: "iniciante",
        idioma: "pt",
      }),
    });
    const text = (json?.resposta_ia || "").toLowerCase();
    const hasPrice =
      /r\$|usd|us\$|dólar|dolar|real/.test(text) && /\d/.test(text);
    const has2026 = /2026/.test(text);
    if (!res.ok) {
      record("nagai.quote_and_year", "FAIL", `status=${res.status}`);
    } else if (hasPrice && has2026) {
      record("nagai.quote_and_year", "PASS", "cotação + 2026 presentes");
    } else if (hasPrice) {
      record(
        "nagai.quote_and_year",
        "WARN",
        "cotação ok; 2026 não explícito na resposta",
      );
    } else {
      record(
        "nagai.quote_and_year",
        "FAIL",
        `sem cotação clara: ${text.slice(0, 160)}`,
      );
    }
  } catch (e) {
    record("nagai.quote_and_year", "FAIL", String(e.message || e));
  }

  // --- scope ---
  try {
    const { res, json } = await httpJson(`${BASE}/api/agents/mentor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensagem_usuario: "Me ensina a fazer bolo de chocolate?",
        nivel_conhecimento: "iniciante",
        idioma: "pt",
      }),
    });
    const text = (json?.resposta_ia || "").toLowerCase();
    const refuses =
      /bitcoin|escopo|foco|satvantage|não posso|nao posso|fora|especialista/.test(
        text,
      );
    record(
      "nagai.scope_bitcoin",
      res.ok && refuses ? "PASS" : res.ok ? "WARN" : "FAIL",
      res.ok
        ? refuses
          ? "recusa/redireciona para Bitcoin"
          : `resposta ambígua: ${text.slice(0, 140)}`
        : `status=${res.status}`,
    );
  } catch (e) {
    record("nagai.scope_bitcoin", "FAIL", String(e.message || e));
  }

  // --- critical API smoke (expect JSON, not 500) ---
  const routes = [
    ["/api/auth/session", "GET"],
    ["/api/missions/overview", "GET"],
    ["/api/rewards/balance", "GET"],
    ["/api/extension/analisar", "POST"],
  ];
  for (const [route, method] of routes) {
    try {
      const opts =
        method === "POST"
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paginaTexto: "Bitcoin wallet",
                pergunta: "Isso é golpe?",
                paginaUrl: "https://example.com",
              }),
            }
          : { method: "GET" };
      const res = await fetch(`${BASE}${route}`, opts);
      // 401/403/400 ok for unauthenticated; 500 = fail
      const ok = res.status < 500;
      record(
        `api.route${route.replace(/\W+/g, "_")}`,
        ok ? "PASS" : "FAIL",
        `${method} ${route} → ${res.status}`,
      );
    } catch (e) {
      record(`api.route${route.replace(/\W+/g, "_")}`, "FAIL", String(e.message || e));
    }
  }

  // --- static / source checks (UI contracts) ---
  const staticChecks = [
    [
      "ui.autoscroll_hook",
      () =>
        fileHas("lib/use-chat-auto-scroll.ts", [
          "useChatAutoScroll",
          "nearBottom|stick|scroll",
        ]),
    ],
    [
      "ui.mentor_uses_autoscroll",
      () => fileHas("components/MentorChat.tsx", ["useChatAutoScroll"]),
    ],
    [
      "ui.freetopic_uses_autoscroll",
      () => fileHas("components/FreeTopicChat.tsx", ["useChatAutoScroll"]),
    ],
    [
      "ui.tsim_tooltips",
      () =>
        fileHas("components/TradeSimulator.tsx", [
          "equityTip",
          "grossResultTip",
          "cashTip",
          "btcTip",
          "required",
          "aria-required",
        ]),
    ],
    [
      "ui.a11y_dock_tts",
      () =>
        fileHas("components/AccessibilityDock.tsx", [
          "readPage",
          "AccessibilityIcon",
          "pauseSpeaking|resumeSpeaking|stopSpeaking|speakText",
        ]),
    ],
    [
      "ui.vlibras",
      () =>
        fileHas("components/VLibrasWidget.tsx", [
          "sv-vlibras-root",
          "vlibras",
        ]),
    ],
    [
      "ui.no_bubble_tts",
      () => noSpeakButtonUsage(),
    ],
    [
      "ext.front_sidepanel_manifest",
      () =>
        fileHas("extension/manifest.json", [
          '"side_panel"',
          "popup.html",
          "sidePanel",
        ]),
    ],
    [
      "ext.front_capture",
      () =>
        fileHas("extension/popup.html", [
          "capturar",
          "crop",
          "Analisar",
        ]),
    ],
    [
      "ext.root_sidepanel",
      () =>
        fileHas("extension/manifest.json", [
          '"side_panel"',
          "sidePanel",
          "popup.html",
        ]),
    ],
    [
      "ext.root_security_heuristics",
      () =>
        fileHas("extension/domain-check.js", [
          "checkDomain",
          "SVDomainCheck",
          "typosquat|phishing|suspicious",
        ]),
    ],
  ];

  for (const [id, fn] of staticChecks) {
    const r = fn();
    record(id, r.ok ? "PASS" : "FAIL", r.reason);
  }

  // --- summary ---
  const counts = { PASS: 0, FAIL: 0, WARN: 0, SKIP: 0 };
  for (const r of results) counts[r.status]++;
  const outDir = path.join(ROOT, "audit");
  fs.mkdirSync(outDir, { recursive: true });
  const reportPath = path.join(outDir, "SMOKE_RESULTS.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      { at: new Date().toISOString(), base: BASE, agents: AGENTS, counts, results },
      null,
      2,
    ),
  );
  console.log(
    `\n=== Summary PASS=${counts.PASS} WARN=${counts.WARN} FAIL=${counts.FAIL} SKIP=${counts.SKIP} ===`,
  );
  console.log(`Wrote ${reportPath}`);
  if (counts.FAIL > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
