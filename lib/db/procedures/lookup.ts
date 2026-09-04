import type { Procedure } from "@/lib/types";
import { PROCEDURES_ALL } from "./index";
import {
  COUNTRY_PROCEDURE_INDEX,
  isCountryAvailable,
  getCountryMeta,
  loadProceduresForCountry,
} from "./_registry";
import type { CountryProcedureMeta } from "@/lib/types";

/**
 * Resolve a Procedure by its stable internal id (`procedure.id`).
 *
 * The id is the unique, stable identifier used in URLs and the API. It is
 * independent of any localized title: changing the UI language never changes
 * the id. Use this for every lookup; never fall back to `PROCEDURES[0]` or the
 * array index when a requested id is not found.
 */
export function getProcedureById(id: string | undefined | null): Procedure | undefined {
  if (!id) return undefined;
  return PROCEDURES_ALL.find((p) => p.id === id);
}

/**
 * All distinct procedures available for a destination country code (e.g. "IT").
 * Used by the wizard to let the user pick a concrete procedure and by the
 * explore/search pages. Does not include duplicates.
 *
 * SYNC backward-compatible version (Fase 2A): legge dal bundle.
 */
export function proceduresForCountry(countryCode: string | undefined | null): Procedure[] {
  if (!countryCode) return [];
  return PROCEDURES_ALL.filter((p) => p.countryCode === countryCode);
}

// ── Registry (metadati leggeri, sempre disponibili senza caricare i dati) ──

export { COUNTRY_PROCEDURE_INDEX, isCountryAvailable, getCountryMeta };

/**
 * Metadati leggeri per un paese dal registro. Può restare undefined per i paesi
 * che non compaiono neanche in COUNTRIES.
 */
export function countryProcedureMeta(code: string | undefined | null): CountryProcedureMeta | undefined {
  return getCountryMeta(code);
}

/**
 * Async lookup — carica i dettagli completi delle procedure per un paese
 * (code-splitting). In Fase 2A risolve sincrono dal bundle; in Fase 2B
 * caricherà i JSON per paese on-demand.
 */
export async function proceduresForCountryAsync(
  countryCode: string | undefined | null
): Promise<Procedure[]> {
  const sync = proceduresForCountry(countryCode);
  if (sync.length > 0) return sync;
  return loadProceduresForCountry(countryCode);
}
