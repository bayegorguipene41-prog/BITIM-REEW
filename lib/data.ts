import { COUNTRIES, countryName } from "./db/countries";
import type { LocalizedText } from "./types";

export function countryByCode(code?: string) {
  return COUNTRIES.find((c) => c.code === code);
}

export function countryLabel(code: string, lang: string): string {
  const c = countryByCode(code);
  return c ? countryName(c, lang) : code;
}

export function countryByName(name?: string) {
  if (!name) return undefined;
  return COUNTRIES.find(
    (c) =>
      c.it.toLowerCase() === name.trim().toLowerCase() ||
      c.en.toLowerCase() === name.trim().toLowerCase()
  );
}

export function countryNameByCountry(c: (typeof COUNTRIES)[number], lang: string): string {
  return countryName(c, lang);
}

export function localize(t: LocalizedText | undefined, lang: string): string {
  if (!t) return "";
  const codes = [lang, "en", "it"];
  for (const c of codes) {
    const v = (t as any)[c];
    if (v && v.trim()) return v;
  }
  const first = Object.values(t)[0];
  return first || "";
}

export const POPULAR_COUNTRIES = ["IT", "FR", "ES", "DE", "GB", "US", "PT"];

export const PROCEDURE_CATEGORIES = [
  "visa",
  "immigration",
  "residency",
  "citizenship",
  "marriage",
  "birth",
  "work",
  "study",
  "business",
  "driving",
  "tax",
  "other",
] as const;
