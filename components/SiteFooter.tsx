"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import AccessibilityFooter from "@/components/AccessibilityFooter";

const SUPPORT_EMAIL = "suporte@satvantage.com.br";

export default function SiteFooter() {
  const { t } = useI18n();
  const [message, setMessage] = useState("");

  function sendSupport(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(t.footer.supportSubject);
    const body = encodeURIComponent(message.trim());
    const href = `mailto:${SUPPORT_EMAIL}?subject=${subject}${
      body ? `&body=${body}` : ""
    }`;
    window.location.href = href;
  }

  return (
    <footer className="sv-site-footer" id="suporte">
      <div className="sv-landing-body sv-site-footer-inner">
        <form className="sv-support" onSubmit={sendSupport}>
          <div className="sv-support-head">
            <p className="sv-platform-eyebrow">{t.footer.support}</p>
            <p className="sv-support-to">
              {t.footer.supportTo}{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
          </div>
          <label className="sv-support-field">
            <span className="sv-sr-only">{t.footer.supportPlaceholder}</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.footer.supportPlaceholder}
              rows={3}
            />
          </label>
          <button type="submit" className="sv-btn-primary sv-support-send">
            {t.footer.supportSend}
          </button>
        </form>

        <div className="sv-site-footer-bar">
          <p className="sv-site-footer-copy">{t.footer.copyright}</p>
          <AccessibilityFooter embedded />
          <p className="sv-site-footer-risk">{t.footer.risk}</p>
        </div>
      </div>
    </footer>
  );
}
