"use client";
/**
 * VLibras oficial (gov.br) — markup idêntico ao snippet público:
 *
 * <div vw class="enabled">
 *   <div vw-access-button class="active"></div>
 *   <div vw-plugin-wrapper>
 *     <div class="vw-plugin-top-wrapper"></div>
 *   </div>
 * </div>
 * <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
 * <script>new window.VLibras.Widget('https://vlibras.gov.br/app');</script>
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useI18n } from "@/lib/i18n";
import { openAccessibilityPanel } from "@/components/AccessibilityDock";
import "./a11y.css";

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
    __svVLibrasWidget?: boolean;
  }
}

const SCRIPT_SRC = "https://vlibras.gov.br/app/vlibras-plugin.js";
const WIDGET_URL = "https://vlibras.gov.br/app";
const READY_TIMEOUT_MS = 16_000;

type Status = "loading" | "ready" | "failed";

function findAccessButton(): HTMLElement | null {
  return (
    (document.querySelector(".access-button") as HTMLElement | null) ||
    (document.querySelector("[vw-access-button]") as HTMLElement | null)
  );
}

function pinAccessButton() {
  const btn = findAccessButton();
  if (!btn) return false;
  const mobile = window.matchMedia("(max-width: 640px)").matches;
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
  return true;
}

/** Equivalente a: new window.VLibras.Widget('https://vlibras.gov.br/app') */
function startWidget(): boolean {
  if (typeof window === "undefined" || !window.VLibras?.Widget) return false;
  try {
    if (!window.__svVLibrasWidget) {
      // eslint-disable-next-line no-new
      new window.VLibras.Widget(WIDGET_URL);
      window.__svVLibrasWidget = true;
    }
    return true;
  } catch (err) {
    console.warn("[SatVantage] VLibras.Widget falhou", err);
    window.__svVLibrasWidget = false;
    return false;
  }
}

export default function VLibrasWidget() {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("loading");
  const failedRef = useRef(false);

  const markReady = useCallback(() => {
    if (failedRef.current) return;
    pinAccessButton();
    setStatus("ready");
  }, []);

  const markFailed = useCallback((reason: string) => {
    if (findAccessButton()) {
      failedRef.current = false;
      pinAccessButton();
      setStatus("ready");
      return;
    }
    failedRef.current = true;
    console.warn("[SatVantage] VLibras indisponível:", reason);
    setStatus((prev) => (prev === "ready" ? prev : "failed"));
  }, []);

  useEffect(() => {
    failedRef.current = false;

    const obs = new MutationObserver(() => {
      if (pinAccessButton()) markReady();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    const tick = window.setInterval(() => {
      if (pinAccessButton()) {
        markReady();
        window.clearInterval(tick);
      }
    }, 500);

    const timeout = window.setTimeout(() => {
      window.clearInterval(tick);
      obs.disconnect();
      if (findAccessButton()) markReady();
      else if (!window.VLibras) markFailed("timeout sem plugin");
      else markFailed("plugin sem botão após timeout");
    }, READY_TIMEOUT_MS);

    function onRepin() {
      failedRef.current = false;
      if (!document.querySelector(".access-button")) {
        window.__svVLibrasWidget = false;
      }
      if (window.VLibras) startWidget();
      pinAccessButton();
      if (findAccessButton()) markReady();
    }

    window.addEventListener("sv-vlibras-repin", onRepin);

    if (window.VLibras) {
      startWidget();
      if (pinAccessButton()) markReady();
    }

    return () => {
      obs.disconnect();
      window.clearInterval(tick);
      window.clearTimeout(timeout);
      window.removeEventListener("sv-vlibras-repin", onRepin);
    };
  }, [markFailed, markReady]);

  return (
    <>
      {/* Markup oficial VLibras */}
      <div vw="" className="enabled">
        <div vw-access-button="" className="active" />
        <div vw-plugin-wrapper="">
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>

      <Script
        id="vlibras-plugin"
        src={SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => {
          failedRef.current = false;
          if (!startWidget()) {
            markFailed("Widget indisponível após load");
            return;
          }
          // Plugin monta .access-button de forma assíncrona
          window.setTimeout(() => {
            if (pinAccessButton()) markReady();
          }, 300);
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
