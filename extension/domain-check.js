// domain-check.js — heurística LOCAL de domínio (sem API externa).
// Carregar antes de popup.js (script clássico, sem type=module).
(function (global) {
  const OFFICIAL_DOMAINS = {
    satvantage: [
      "sat-vantage-gislanesena.vercel.app",
      "sat-vantage-iau60jdhv-gislanesena.vercel.app",
      "satvantage.com.br",
      "www.satvantage.com.br",
      "localhost",
      "127.0.0.1",
    ],
    bitcoin: ["bitcoin.org", "mempool.space", "blockstream.info"],
    mercadobitcoin: ["mercadobitcoin.com.br", "mercadobitcoin.com"],
    foxbit: ["foxbit.com.br", "foxbit.com"],
    novadax: ["novadax.com.br", "novadax.com"],
    binance: ["binance.com", "binance.us", "binance.com.br"],
    coinbase: ["coinbase.com", "www.coinbase.com"],
    kraken: ["kraken.com", "www.kraken.com"],
    trezor: ["trezor.io"],
    muun: ["muun.com"],
  };

  const ALL_OFFICIAL = Object.values(OFFICIAL_DOMAINS).flat();
  const BRAND_LABELS = Object.keys(OFFICIAL_DOMAINS);

  const SUSPICIOUS_TLDS = new Set([
    "tk",
    "ml",
    "ga",
    "cf",
    "gq",
    "top",
    "click",
    "loan",
    "zip",
    "mov",
    "cfd",
    "xyz",
    "work",
    "rest",
  ]);

  const PHISH_HOST_RE = [
    /secure[-.]?login/i,
    /verify[-.]?wallet/i,
    /claim[-.]?airdrop/i,
    /free[-.]?btc/i,
    /restore[-.]?(seed|wallet)/i,
    /validate[-.]?(wallet|seed|account)/i,
    /^www-/i,
  ];

  function normalizeHost(host) {
    return String(host || "")
      .toLowerCase()
      .replace(/\.$/, "")
      .replace(/^www\./, "");
  }

  function parseUrl(raw) {
    try {
      const u = new URL(raw);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      return u;
    } catch {
      return null;
    }
  }

  function isIp(host) {
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  }

  function registrable(host) {
    const parts = host.split(".").filter(Boolean);
    if (parts.length <= 2) return host;
    if (parts.at(-1) === "br" && parts.length >= 3) return parts.slice(-3).join(".");
    return parts.slice(-2).join(".");
  }

  function labelOnly(host) {
    return (registrable(host).split(".")[0] || host).replace(/[^a-z0-9]/g, "");
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = i - 1;
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const cur = row[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
        prev = cur;
      }
    }
    return row[b.length];
  }

  function isOfficialHost(host) {
    const h = normalizeHost(host);
    if (ALL_OFFICIAL.some((o) => h === o || h.endsWith(`.${o}`))) return true;
    if (h.endsWith(".vercel.app") && /sat[-]?vantage/i.test(h)) return true;
    return false;
  }

  function brandInHostButNotOfficial(host) {
    const h = normalizeHost(host);
    for (const brand of BRAND_LABELS) {
      if (!h.includes(brand)) continue;
      const official = OFFICIAL_DOMAINS[brand] || [];
      if (official.some((o) => h === o || h.endsWith(`.${o}`))) continue;
      return brand;
    }
    return null;
  }

  function typosquatBrand(host) {
    const label = labelOnly(host);
    if (label.length < 5) return null;
    for (const brand of BRAND_LABELS) {
      if (label === brand) continue;
      const d = levenshtein(label, brand);
      if (d > 0 && d <= 2 && Math.abs(label.length - brand.length) <= 2) {
        return brand;
      }
    }
    if (/mercadobitcoim|mercadobitcon|binanse|binnance|foxbitt|novadacs/.test(label)) {
      return "typo";
    }
    return null;
  }

  function checkDomain(pageUrl) {
    const u = parseUrl(pageUrl);
    if (!u) {
      return {
        seal: "unknown",
        title: "Não reconhecemos este domínio, tenha cautela",
        detail:
          "Não foi possível ler a URL desta aba. Abra um site http/https e tente de novo. Checagem heurística local — não é base completa nem garantia total.",
        host: null,
      };
    }

    const host = normalizeHost(u.hostname);
    const reasons = [];

    if (isOfficialHost(host)) {
      let brand = "lista conhecida";
      for (const [name, hosts] of Object.entries(OFFICIAL_DOMAINS)) {
        if (hosts.some((o) => host === o || host.endsWith(`.${o}`))) {
          brand = name;
          break;
        }
      }
      return {
        seal: "ok",
        title: "Domínio reconhecido",
        detail: `“${host}” está na lista local de domínios oficiais (${brand}). Isto é uma checagem heurística — confirme sempre o cadeado e o endereço na barra.`,
        host,
        brand,
      };
    }

    if (u.username || u.password || String(pageUrl).includes("@")) {
      reasons.push("URL com @ ou credenciais embutidas");
    }
    if (isIp(host)) reasons.push("servido por IP em vez de domínio");
    if (host.includes("xn--")) reasons.push("punycode (letras que imitam outras)");
    const tld = host.split(".").pop() || "";
    if (SUSPICIOUS_TLDS.has(tld)) reasons.push(`TLD .${tld} frequentemente abusado`);
    if (host.split(".").length >= 5) reasons.push("muitos subdomínios encadeados");
    if ((labelOnly(host).match(/-/g) || []).length >= 2) {
      reasons.push("hífens extras no nome");
    }
    for (const re of PHISH_HOST_RE) {
      if (re.test(host)) {
        reasons.push("padrão de nome falso (secure/login/wallet/claim)");
        break;
      }
    }

    const fakeBrand = brandInHostButNotOfficial(host);
    if (fakeBrand) {
      reasons.push(`usa o nome “${fakeBrand}” fora do host oficial`);
    }
    const typo = typosquatBrand(host);
    if (typo) {
      reasons.push(
        typo === "typo"
          ? "possível typosquat (letras trocadas)"
          : `possível typosquat de “${typo}”`,
      );
    }

    if (reasons.length) {
      return {
        seal: "suspicious",
        title: "Padrão suspeito de phishing detectado",
        detail:
          `Host “${host}”. Sinais: ${reasons.slice(0, 4).join("; ")}. ` +
          "Checagem heurística local — não cobre todos os golpes. Não digite seed, senha nem chave.",
        host,
      };
    }

    return {
      seal: "unknown",
      title: "Não reconhecemos este domínio, tenha cautela",
      detail:
        `“${host}” não está na lista local (SatVantage, Mercado Bitcoin, Foxbit, NovaDAX, Binance). ` +
        "Isso não prova que é golpe, mas também não confirma legitimidade. Confira o endereço oficial por um canal que você já confia. Checagem heurística — sem garantia total.",
      host,
    };
  }

  function isOfficialSatVantageUrl(url) {
    try {
      const host = normalizeHost(new URL(url).hostname);
      return (
        OFFICIAL_DOMAINS.satvantage.some((o) => host === o || host.endsWith(`.${o}`)) ||
        (host.endsWith(".vercel.app") && /sat[-]?vantage/i.test(host))
      );
    } catch {
      return false;
    }
  }

  global.SVDomainCheck = {
    OFFICIAL_DOMAINS,
    checkDomain,
    isOfficialSatVantageUrl,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
