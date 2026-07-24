"use client";
// QR de cobrança Lightning — prefixo lightning: para apps de carteira reconhecerem.
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useI18n } from "@/lib/i18n";

type Props = {
  value: string;
  size?: number;
  label?: string;
};

export default function InvoiceQr({
  value,
  size = 220,
  label,
}: Props) {
  const { t } = useI18n();
  const caption = label ?? t.auth.scanToPay;
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const payload = value.trim();
    if (!payload) {
      setDataUrl(null);
      return;
    }
    const forQr = payload.toLowerCase().startsWith("lightning:")
      ? payload
      : `lightning:${payload}`;

    void QRCode.toDataURL(forQr, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setErr(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
          setErr("Não foi possível gerar o QR.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (err) {
    return (
      <p role="alert" className="sv-wallet-error">
        {err}
      </p>
    );
  }
  if (!dataUrl) return null;

  return (
    <div className="sv-invoice-qr">
      <p className="sv-wallet-meta">{caption}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="QR code da cobrança Lightning" width={size} height={size} />
    </div>
  );
}
