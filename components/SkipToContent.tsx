"use client";

import { useI18n } from "@/lib/i18n";

/** Link “Ir para o conteúdo” — primeiro item focável da página. */
export default function SkipToContent({ href = "#conteudo" }: { href?: string }) {
  const { t } = useI18n();
  return (
    <a className="sv-skip" href={href}>
      {t.a11y.skipToContent}
    </a>
  );
}
