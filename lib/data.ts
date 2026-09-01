import { COUNTRIES, countryName } from "./db/countries";
import type { LocalizedText } from "./types";
import { resolveLocalized } from "./i18n/procedure-locale";

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
  return resolveLocalized(t, lang);
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
