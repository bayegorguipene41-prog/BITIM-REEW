import type { Procedure } from "@/lib/types";
import { PROCEDURES_ALL } from "./index";

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
 */
export function proceduresForCountry(countryCode: string | undefined | null): Procedure[] {
  if (!countryCode) return [];
  return PROCEDURES_ALL.filter((p) => p.countryCode === countryCode);
}