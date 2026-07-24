"use client";
import { I18nProvider } from "@/lib/i18n";
import AccessibilityFooter from "@/components/AccessibilityFooter";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      {children}
      <AccessibilityFooter />
    </I18nProvider>
  );
}
