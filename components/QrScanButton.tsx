"use client";
// Lê QR (câmera) e devolve o texto — invoices Lightning / NWC etc.
import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Props = {
  onScan: (value: string) => void;
  label?: string;
};

/** Remove prefixo lightning: e espaços. */
export function normalizeQrPayload(raw: string): string {
  let t = raw.trim();
  const lower = t.toLowerCase();
  if (lower.startsWith("lightning:")) {
    t = t.slice("lightning:".length).trim();
  }
  // Alguns QRs vêm como URI com query (ex.: lightning:lnbc...?…)
  const q = t.indexOf("?");
  if (q > 0 && (t.toLowerCase().startsWith("ln") || t.toLowerCase().startsWith("nostr+"))) {
    t = t.slice(0, q);
  }
  return t.trim();
}

export default function QrScanButton({ onScan, label }: Props) {
  const { t } = useI18n();
  const btnLabel = label ?? t.auth.scanQr;
  const reactId = useId().replace(/:/g, "");
  const regionId = `sv-qr-${reactId}`;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<{
    isScanning: boolean;
    stop: () => Promise<void>;
    clear: () => void;
  } | null>(null);
  const handledRef = useRef(false);

  async function stopScanner() {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (!s) return;
    try {
      if (s.isScanning) await s.stop();
      s.clear();
    } catch {
      /* ignore */
    }
  }

  async function close() {
    await stopScanner();
    setOpen(false);
    setError(null);
    handledRef.current = false;
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    handledRef.current = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 220, height: 220 } },
          (decoded) => {
            if (handledRef.current || cancelled) return;
            handledRef.current = true;
            const value = normalizeQrPayload(decoded);
            void (async () => {
              await stopScanner();
              if (cancelled) return;
              setOpen(false);
              setError(null);
              onScan(value);
            })();
          },
          () => {
            /* frame sem QR — ignore */
          },
        );
      } catch (e: unknown) {
        if (cancelled) return;
        const msg =
          e instanceof Error
            ? e.message
            : "Não foi possível abrir a câmera. Verifique a permissão.";
        setError(msg);
      }
    })();

    return () => {
      cancelled = true;
      void stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, regionId]);

  return (
    <div className="sv-qr">
      {!open ? (
        <button
          type="button"
          className="sv-wallet-btn sv-wallet-btn--ghost sv-qr-trigger"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
        >
          {btnLabel}
        </button>
      ) : (
        <div className="sv-qr-panel">
          <div className="sv-qr-panel-head">
            <span className="sv-wallet-meta">{t.auth.pointCamera}</span>
            <button
              type="button"
              className="linkish"
              onClick={() => {
                void close();
              }}
            >
              {t.mentor.close}
            </button>
          </div>
          <div id={regionId} className="sv-qr-viewport" />
          {error && (
            <p role="alert" className="sv-wallet-error">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
