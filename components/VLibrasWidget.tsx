"use client";
/**
 * VLibras (gov.br) — carregamento resiliente:
 * timeout + onError + try/catch; fallback visual no mobile se o CDN falhar.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useI18n } from "@/lib/i18n";
import { openAccessibilityPanel } from "@/components/AccessibilityDock";
import "./a11y.css";

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
    __svVLibrasReady?: boolean;
  }
}

const ROOT_ID = "sv-vlibras-root";
const SCRIPT_SRC = "https://vlibras.gov.br/app/vlibras-plugin.js";
const LOAD_TIMEOUT_MS = 12_000;

type Status = "loading" | "ready" | "failed";

function ensureRoot() {
  try {
    let root = document.getElementById(ROOT_ID) as HTMLDivElement | null;
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      document.body.appendChild(root);
    }
    root.className = "enabled sv-vlibras";
    root.setAttribute("vw", "");
    if (
      !root.querySelector(".access-button") &&
      !root.querySelector("[vw-access-button]")
    ) {
      root.innerHTML =
        '<div vw-access-button class="active"></div>' +
        '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    }
    return root;
  } catch (err) {
    console.warn("[SatVantage] VLibras ensureRoot falhou", err);
    return null;
  }
}

function pinAccessButton() {
  try {
    const btn = document.querySelector(".access-button") as HTMLElement | null;
    if (!btn) return false;
    const mobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches;
    btn.classList.add("active");
    btn.style.setProperty("position", "fixed", "important");
    btn.style.setProperty("right", mobile ? "12px" : "18px", "important");
    btn.style.setProperty("bottom", mobile ? "128px" : "140px", "important");
    btn.style.setProperty("left", "auto", "important");
    btn.style.setProperty("top", "auto", "important");
    btn.style.setProperty("z-index", "2147483000", "important");
    btn.style.setProperty("opacity", "1", "important");
    btn.style.setProperty("visibility", "visible", "important");
    btn.style.setProperty("pointer-events", "auto", "important");
    btn.style.setProperty("display", "flex", "important");
    const size = mobile ? "56px" : "64px";
    btn.style.setProperty("width", size, "important");
    btn.style.setProperty("height", size, "important");
    btn.style.setProperty("max-width", "none", "important");
    btn.style.setProperty("max-height", "none", "important");
    btn.style.setProperty("transform", "none", "important");
    btn.style.setProperty("clip", "auto", "important");
    btn.style.setProperty("clip-path", "none", "important");
    return true;
  } catch (err) {
    console.warn("[SatVantage] VLibras pin falhou", err);
    return false;
  }
}

function watchAndPin(onPinned?: () => void) {
  if (pinAccessButton()) {
    onPinned?.();
    return () => {};
  }
  const obs = new MutationObserver(() => {
    if (pinAccessButton()) {
      obs.disconnect();
      onPinned?.();
    }
  });
  try {
    obs.observe(document.body, { childList: true, subtree: true });
  } catch {
    /* ignore */
  }
  const stopAt = window.setTimeout(() => obs.disconnect(), 15_000);
  let n = 0;
  const tick = window.setInterval(() => {
    n += 1;
    if (pinAccessButton()) {
      window.clearInterval(tick);
      onPinned?.();
    }
    if (n > 30) window.clearInterval(tick);
  }, 500);
  return () => {
    obs.disconnect();
    window.clearTimeout(stopAt);
    window.clearInterval(tick);
  };
}

function initVLibras(onReady?: () => void): boolean {
  if (typeof window === "undefined") return false;
  if (!window.VLibras?.Widget) return false;
  try {
    ensureRoot();
    if (!window.__svVLibrasReady) {
      // eslint-disable-next-line no-new
      new window.VLibras.Widget("https://vlibras.gov.br/app");
      window.__svVLibrasReady = true;
    }
    watchAndPin(onReady);
    return true;
  } catch (err) {
    console.warn("[SatVantage] VLibras init falhou", err);
    window.__svVLibrasReady = false;
    return false;
  }
}

export default function VLibrasWidget() {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("loading");
  const timedOut = useRef(false);
  const cleanupPin = useRef<(() => void) | null>(null);

  const markReady = useCallback(() => {
    if (timedOut.current) return;
    setStatus("ready");
  }, []);

  const markFailed = useCallback((reason: string) => {
    timedOut.current = true;
    console.warn("[SatVantage] VLibras indisponível:", reason);
    setStatus((prev) => (prev === "ready" ? prev : "failed"));
  }, []);

  useEffect(() => {
    ensureRoot();
    const timer = window.setTimeout(() => {
      if (!document.querySelector(".access-button") && !window.VLibras) {
        markFailed("timeout sem plugin");
      } else if (document.querySelector(".access-button")) {
        markReady();
      } else if (window.VLibras) {
        // Script ok, botão ainda montando — dá mais uma chance curta
        window.setTimeout(() => {
          if (document.querySelector(".access-button")) markReady();
          else markFailed("plugin sem botão após timeout");
        }, 4000);
      }
    }, LOAD_TIMEOUT_MS);

    function onRepin() {
      try {
        if (window.__svVLibrasReady && !document.querySelector(".access-button")) {
          window.__svVLibrasReady = false;
          ensureRoot();
        }
        if (window.VLibras) {
          if (initVLibras(markReady)) markReady();
        } else {
          cleanupPin.current?.();
          cleanupPin.current = watchAndPin(markReady);
        }
      } catch (err) {
        markFailed(String(err));
      }
    }

    window.addEventListener("sv-vlibras-repin", onRepin);
    if (window.VLibras) {
      if (initVLibras(markReady)) {
        /* pending pin */
      }
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("sv-vlibras-repin", onRepin);
      cleanupPin.current?.();
    };
  }, [markFailed, markReady]);

  return (
    <>
      <Script
        id="sv-vlibras-script"
        src={SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => {
          try {
            if (!initVLibras(markReady)) {
              markFailed("Widget indisponível após load");
            }
          } catch (err) {
            markFailed(String(err));
          }
        }}
        onError={() => markFailed("falha ao baixar CDN vlibras.gov.br")}
      />

      {status === "failed" ? (
        <div className="sv-vlibras-fallback" role="status">
          <button
            type="button"
            className="sv-vlibras-fallback-btn"
            aria-label={t.a11y.vlibrasFallbackAria}
            title={t.a11y.vlibrasFallbackTitle}
            onClick={() => {
              try {
                openAccessibilityPanel();
              } catch {
                /* ignore */
              }
            }}
          >
            <span aria-hidden="true">🤟</span>
            <span className="sv-vlibras-fallback-label">
              {t.a11y.vlibrasFallbackShort}
            </span>
          </button>
          <p className="sv-vlibras-fallback-hint">{t.a11y.vlibrasFallbackHint}</p>
        </div>
      ) : null}

      {status === "loading" ? (
        <span className="sv-sr-only" aria-live="polite">
          {t.a11y.vlibrasLoading}
        </span>
      ) : null}
    </>
  );
}
