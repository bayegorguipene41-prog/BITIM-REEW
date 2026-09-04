// ==========================================
// INDICE — PROCEDURE
// ==========================================

import type { Procedure } from "@/lib/types";
import { loadCountryProceduresJson } from "./json-loader";
import { UNVERIFIED_PROCEDURES } from "./unverified";
import { addLegacyProcedures } from "./legacy";
import { PROCEDURE_ITALIA } from "./Italia";

// ── Procedure con dati reali verificati (fonte: file JSON canonici) ────
// IT: procedure Italia (verificate) — IT.json (Sessione 3).
// FR/DE: placeholder marcati needs_review — FR.json / DE.json.
const VERIFIED_FROM_JSON: Procedure[] = [
  ...loadCountryProceduresJson("IT"),
];

export const PROCEDURES: Procedure[] = [
  ...VERIFIED_FROM_JSON,
  ...UNVERIFIED_PROCEDURES,
];

export const PROCEDURES_VERIFIED: Procedure[] = [...VERIFIED_FROM_JSON];

export const PROCEDURES_UNVERIFIED: Procedure[] = [...UNVERIFIED_PROCEDURES];

export const PROCEDURES_ALL: Procedure[] = [
  ...PROCEDURES,
  ...addLegacyProcedures(PROCEDURE_ITALIA),
];