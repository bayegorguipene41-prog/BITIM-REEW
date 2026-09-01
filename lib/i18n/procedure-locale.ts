import type { LocalizedText } from "@/lib/types";
import { LANG_CODES } from "./config";

/**
 * Ordine di risoluzione preferenziale per un testo di procedura.
 * Prima la lingua richiesta, poi il resto delle lingue dell'interfaccia
 * disponibili sul campo, quindi en e it come ultima garanzia.
 */
export const LOCALIZED_FALLBACK_ORDER: string[] = [
  "fr",
  "es",
  "de",
  "pt",
  "ar",
  "en",
  "it",
];

/**
 * Risolve un testo di procedura multilingua verso la lingua richiesta.
 *
 * Regole:
 *  - se il campo contiene la lingua richiesta (o un alias), la restituisce;
 *  - altrimenti cerca nelle altre lingue disponibili nell'ordine dell'interfaccia;
 *  - poi en, poi it come ultimo ripiego;
 *  - se nessun valore è presente restituisce stringa vuota (mai `undefined`).
 */
export function resolveLocalized(
  text: LocalizedText | undefined,
  lang: string,
): string {
  if (!text) return "";

  const record = text as unknown as Record<string, string>;
  const requested = lang.toLowerCase();
  const direct = record[requested];
  if (direct && direct.trim()) return direct;

  for (const code of LANG_CODES) {
    if (code === requested) continue;
    const v = record[code];
    if (v && v.trim()) return v;
  }

  for (const code of LOCALIZED_FALLBACK_ORDER) {
    const v = record[code];
    if (v && v.trim()) return v;
  }

  const first = Object.values(text).find((v) => v && v.trim());
  return first || "";
}