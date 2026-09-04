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
// AL: procedure Albania (verificate) — AL.json (Fase 2B, Sessione 5).
// MA: procedure Marocco (verificate) — MA.json (Fase 2B, Sessione 6).
// TN: procedure Tunisia (verificate) — TN.json (Fase 2B, Sessione 6).
// EG: procedure Egitto (verificate) — EG.json (Fase 2B, Sessione 7).
// FR/DE: placeholder marcati needs_review — FR.json / DE.json.
const VERIFIED_FROM_JSON: Procedure[] = [
  ...loadCountryProceduresJson("IT"),
  ...loadCountryProceduresJson("AL"),
  ...loadCountryProceduresJson("MA"),
  ...loadCountryProceduresJson("TN"),
  ...loadCountryProceduresJson("EG"),
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
