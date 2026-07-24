"use client";
/**
 * VLibras oficial (gov.br) — markup e init idênticos ao snippet público.
 * Sem customização visual do ícone: o plugin traz a aparência oficial.
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
const READY_TIMEOUT_MS = 12_000;

type Status = "loading" | "ready" | "failed";

function findRealAccessButton(): HTMLElement | null {
  return document.querySelector(".access-button") as HTMLElement | null;
}

/** Esconde marcadores vazios quando o plugin já montou o botão real (evita “dois” VLibras). */
function hideEmptyMarkers(keep: HTMLElement) {
  document.querySelectorAll("[vw-access-button]").forEach((el) => {
    if (el === keep || el.contains(keep) || keep.contains(el)) return;
    if (el.querySelector(".access-button")) return;
    const hasVisual = !!el.querySelector("img, svg, canvas, .pop-up");
    if (hasVisual) return;
    if ((el as HTMLElement).childElementCount > 0) return;
    (el as HTMLElement).style.setProperty("display", "none", "important");
  });
}

function pinIfReady(): boolean {
  const btn = findRealAccessButton();
  if (!btn) return false;
  hideEmptyMarkers(btn);
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
    if (!pinIfReady()) return;
    setStatus("ready");
  }, []);

  const markFailed = useCallback((reason: string) => {
    if (findRealAccessButton() && pinIfReady()) {
      failedRef.current = false;
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
      if (pinIfReady()) markReady();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    const tick = window.setInterval(() => {
      if (pinIfReady()) {
        markReady();
        window.clearInterval(tick);
      }
    }, 400);

    const timeout = window.setTimeout(() => {
      window.clearInterval(tick);
      obs.disconnect();
      if (findRealAccessButton() && pinIfReady()) markReady();
      else if (!window.VLibras) markFailed("timeout sem plugin");
      else markFailed("plugin sem botão após timeout");
    }, READY_TIMEOUT_MS);

    function onRepin() {
      failedRef.current = false;
      if (!document.querySelector(".access-button")) {
        window.__svVLibrasWidget = false;
      }
      if (window.VLibras) startWidget();
      if (pinIfReady()) markReady();
    }

    window.addEventListener("sv-vlibras-repin", onRepin);

    if (window.VLibras) {
      startWidget();
      if (pinIfReady()) markReady();
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
      {/* Markup oficial VLibras — um único ponto de entrada (desktop e mobile) */}
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
          window.setTimeout(() => {
            if (pinIfReady()) markReady();
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
