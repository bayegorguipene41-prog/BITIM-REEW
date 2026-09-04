// ==========================================
// STATUS LABEL — mappatura VerificationStatus → etichetta tradotta
// ==========================================
//
// Usata dai badge di stato in wizard, CountrySelector ed ExploreClient.
// Mantenere i testi allineati con lib/i18n/translations.ts (chiavi
// status_verified / status_partial / status_needs_review / status_unavailable).

import { getTranslation } from "@/lib/i18n/translations";
import type { VerificationStatus } from "@/lib/types";

export function statusLabel(status: VerificationStatus | undefined, lang: string): string {
  const t = getTranslation(lang);
  switch (status) {
    case "verified":
      return t.status_verified;
    case "partial":
      return t.status_partial;
    case "needs_review":
      return t.status_needs_review;
    case "unavailable":
      return t.status_unavailable;
    default:
      return lang === "it" ? "Non disponibile" : "Not available";
  }
}
