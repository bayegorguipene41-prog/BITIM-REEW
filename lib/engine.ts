import type { UserProfileData, AssessmentResult } from "./types";
import { PROCEDURES } from "./db/procedures";
import { getProcedureById } from "./db/procedures/lookup";
import { countryByName } from "./data";
import { conditionContextFromProfile, isApplicable } from "./conditions";

const DISCLAIMER = `⚠️ Questa informazione è orientativa e basata sulle fonti ufficiali verificate al 23/08/2026. Non sostituisce consulenza legale. Verifica sempre sul portale ufficiale della Questura o del Ministero dell'Interno prima di presentare la domanda. Le normative possono cambiare e i requisiti variano per nazionalità, tipologia di visto e località.`;

function evaluate(procedure: NonNullable<ReturnType<typeof getProcedureById>>): AssessmentResult {
  const documents = procedure.requirements.map((req) => ({
    item: req,
    status: req.necessity,
  }));
  return {
    procedure,
    documents,
    sources: procedure.sources,
    disclaimer: DISCLAIMER,
  };
}

/**
 * Assess a profile against a procedure.
 *
 * Deterministic path (primary): when `procedureId` is provided, the requested
 * procedure is resolved by id and evaluated as-is. If the id is unknown this
 * throws — it NEVER silently falls back to another procedure (e.g. "Permesso
 * di soggiorno"). Callers (the API route) translate the throw into a 404.
 *
 * Backward-compatible path (no `procedureId`): preserves the legacy behavior of
 * auto-selecting the first applicable procedure for the profile's country. Used
 * only by legacy callers/tests; the public API requires an explicit id.
 */
export function assessRequirements(
  profile: UserProfileData,
  procedureId?: string
): AssessmentResult {
  if (procedureId) {
    const procedure = getProcedureById(procedureId);
    if (!procedure) throw new Error("Procedure not found");
    return evaluate(procedure);
  }

  const country = countryByName(profile.country);
  const countryCode = country?.code;

  const context = conditionContextFromProfile(profile as unknown as Record<string, unknown>);

  const countryProcedures = PROCEDURES.filter((p) => p.countryCode === countryCode);
  const applicable = countryProcedures.length
    ? countryProcedures.filter((p) => isApplicable(p, context))
    : [];

  // Legacy heuristic — only used when no procedureId was requested. It autoselects
  // the first applicable procedure for the country (NOT a global PROCEDURES[0]).
  const procedure = applicable[0];
  if (!procedure) throw new Error("No matching procedure found");
  return evaluate(procedure);
}