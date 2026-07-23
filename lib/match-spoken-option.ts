/** Normaliza texto p/ casar fala com opções do quiz. */
export function normalizeSpeech(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tenta mapear a fala a uma opção (índice) ou "pular" (-1).
 * Retorna null se ainda não houver confiança suficiente.
 */
export function matchSpokenOption(
  spoken: string,
  options: string[],
): number | null {
  const n = normalizeSpeech(spoken);
  if (!n || n.length < 2) return null;

  if (
    /\b(pular|pula|proximo|proxima|passar|skip)\b/.test(n) &&
    !/\b(nao|não)\s+pular\b/.test(n)
  ) {
    return -1;
  }

  const letter = n.match(
    /\b(?:opcao|alternativa|letra|numero|n[uú]mero)?\s*([a-d]|[1-4])\b/,
  );
  if (letter) {
    const key = letter[1];
    const map: Record<string, number> = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 3,
    };
    if (key in map && map[key] < options.length) return map[key];
  }

  let best = -1;
  let bestScore = 0;
  options.forEach((opt, i) => {
    const o = normalizeSpeech(opt);
    if (!o) return;
    let score = 0;
    if (n === o || n.includes(o) || o.includes(n)) {
      score = 1;
    } else {
      const words = o.split(" ").filter((w) => w.length > 3);
      if (words.length) {
        const hits = words.filter((w) => n.includes(w)).length;
        score = hits / words.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });

  return bestScore >= 0.4 ? best : null;
}
