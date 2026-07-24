"use client";
// Widget oficial VLibras (gov.br) — canto inferior direito.
import { useEffect } from "react";
import Script from "next/script";
import "./a11y.css";

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
    __svVLibrasReady?: boolean;
  }
}

const ROOT_ID = "sv-vlibras-root";

function ensureRoot() {
  let root = document.getElementById(ROOT_ID) as HTMLDivElement | null;
  if (!root) {
    root = document.createElement("div");
    root.id = ROOT_ID;
    document.body.appendChild(root);
  }
  root.className = "enabled sv-vlibras";
  root.setAttribute("vw", "");
  // Só monta o markup se o plugin ainda não criou o botão
  if (!root.querySelector(".access-button") && !root.querySelector("[vw-access-button]")) {
    root.innerHTML =
      '<div vw-access-button class="active"></div>' +
      '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  }
  return root;
}

/** Só o botão real do plugin (.access-button) — nunca o placeholder. */
function pinAccessButton() {
  const btn = document.querySelector(".access-button") as HTMLElement | null;
  if (!btn) return false;
  btn.classList.add("active");
  btn.style.setProperty("position", "fixed", "important");
  btn.style.setProperty("right", "18px", "important");
  btn.style.setProperty("bottom", "88px", "important");
  btn.style.setProperty("left", "auto", "important");
  btn.style.setProperty("top", "auto", "important");
  btn.style.setProperty("z-index", "2147483000", "important");
  btn.style.setProperty("opacity", "1", "important");
  btn.style.setProperty("visibility", "visible", "important");
  btn.style.setProperty("pointer-events", "auto", "important");
  return true;
}

function watchAndPin() {
  if (pinAccessButton()) return;
  const obs = new MutationObserver(() => {
    if (pinAccessButton()) obs.disconnect();
  });
  obs.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => obs.disconnect(), 15000);
  let n = 0;
  const tick = window.setInterval(() => {
    n += 1;
    pinAccessButton();
    if (n > 30) window.clearInterval(tick);
  }, 500);
}

function initVLibras() {
  if (typeof window === "undefined") return;
  if (!window.VLibras) return;
  ensureRoot();

  if (!window.__svVLibrasReady) {
    try {
      // eslint-disable-next-line no-new
      new window.VLibras.Widget("https://vlibras.gov.br/app");
      window.__svVLibrasReady = true;
    } catch (err) {
      console.warn("[SatVantage] VLibras init falhou", err);
      return;
    }
  }
  watchAndPin();
}

export default function VLibrasWidget() {
  useEffect(() => {
    ensureRoot();
    // ready sem ícone real = estado quebrado de tentativas anteriores
    if (window.__svVLibrasReady && !document.querySelector(".access-button")) {
      window.__svVLibrasReady = false;
      const root = document.getElementById(ROOT_ID);
      if (root) {
        root.innerHTML =
          '<div vw-access-button class="active"></div>' +
          '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
      }
    }
    if (window.VLibras) initVLibras();

    function onRepin() {
      if (window.__svVLibrasReady && !document.querySelector(".access-button")) {
        window.__svVLibrasReady = false;
        const root = document.getElementById(ROOT_ID);
        if (root) {
          root.innerHTML =
            '<div vw-access-button class="active"></div>' +
            '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
        }
      }
      if (window.VLibras) initVLibras();
      else watchAndPin();
    }
    window.addEventListener("sv-vlibras-repin", onRepin);
    return () => window.removeEventListener("sv-vlibras-repin", onRepin);
  }, []);

  return (
    <Script
      id="sv-vlibras-script"
      src="https://vlibras.gov.br/app/vlibras-plugin.js"
      strategy="afterInteractive"
      onLoad={() => initVLibras()}
      onError={() =>
        console.warn(
          "[SatVantage] Falha ao carregar https://vlibras.gov.br/app/vlibras-plugin.js",
        )
      }
    />
  );
}
