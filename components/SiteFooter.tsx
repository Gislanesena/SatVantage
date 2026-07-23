"use client";
import { useI18n } from "@/lib/i18n";
import AccessibilityFooter from "@/components/AccessibilityFooter";

const SUPPORT_EMAIL = "suporte@satvantage.com.br";

export default function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="sv-site-footer" id="suporte">
      <div className="sv-landing-body sv-site-footer-inner">
        <div className="sv-support sv-support--simple">
          <a
            className="sv-btn-primary sv-support-btn"
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t.footer.supportSubject)}`}
          >
            {t.footer.support}
          </a>
        </div>

        <div className="sv-site-footer-bar">
          <p className="sv-site-footer-copy">{t.footer.copyright}</p>
          <AccessibilityFooter embedded />
          <p className="sv-site-footer-risk">{t.footer.risk}</p>
        </div>
      </div>
    </footer>
  );
}
