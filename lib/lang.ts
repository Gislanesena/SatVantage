/** Helpers de idioma do agente (UI oficial usa `sv_locale` via `@/lib/i18n`). */

export type AppLang = "pt" | "en" | "es";

const SPEECH: Record<AppLang, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

export function speechLocale(lang: AppLang): string {
  return SPEECH[lang] ?? "pt-BR";
}

/** Frase que dispara o quiz na API do mentor. */
export function quizTriggerMessage(lang: AppLang): string {
  switch (lang) {
    case "en":
      return "I want to test my knowledge to earn Satoshis!";
    case "es":
      return "Quiero probar mis conocimientos para ganar Satoshis!";
    default:
      return "Quero testar meus conhecimentos para ganhar Satoshis!";
  }
}
