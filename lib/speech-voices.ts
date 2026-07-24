/** Preferências de voz feminina em pt-BR (Web Speech API). */

const FEMALE_HINTS =
  /female|feminina|woman|maria|francisca|lucia|luciana|helena|heloisa|vit[oó]ria|georgia|paulina|microsoft maria|google português do brasil|google brasil|pt-br.*female|female.*pt/i;

const MALE_HINTS = /male|masculin|daniel|felipe|antonio|ricardo|microsoft daniel|male.*pt/i;

export function pickFemalePtVoice(
  voices: SpeechSynthesisVoice[],
  lang = "pt-BR",
): SpeechSynthesisVoice | null {
  const langBase = lang.toLowerCase().slice(0, 2);
  const pt = voices.filter(
    (v) =>
      v.lang.toLowerCase().replace("_", "-").startsWith("pt") ||
      v.lang.toLowerCase().startsWith(langBase),
  );
  const pool = pt.length ? pt : voices;

  const namedFemale = pool.find((v) => FEMALE_HINTS.test(`${v.name} ${v.voiceURI}`));
  if (namedFemale) return namedFemale;

  const notMale = pool.find((v) => !MALE_HINTS.test(`${v.name} ${v.voiceURI}`));
  if (notMale) return notMale;

  return pool[0] ?? null;
}

/** Aguarda vozes (Chrome carrega async) e escolhe voz feminina pt-BR. */
export function resolveFemaleVoice(lang = "pt-BR"): Promise<SpeechSynthesisVoice | null> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve(null);
  }

  const syn = window.speechSynthesis;
  const immediate = pickFemalePtVoice(syn.getVoices(), lang);
  if (immediate) return Promise.resolve(immediate);

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      syn.removeEventListener("voiceschanged", onChange);
      resolve(pickFemalePtVoice(syn.getVoices(), lang));
    };
    const onChange = () => finish();
    syn.addEventListener("voiceschanged", onChange);
    // Fallback se o evento nunca disparar
    window.setTimeout(finish, 400);
  });
}
