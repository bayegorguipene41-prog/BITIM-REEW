import type { UserProfileData, AssessmentResult } from "./types";
import { PROCEDURES, PROCEDURES_ALL } from "./db/procedures";
import { countryByName } from "./data";
import { conditionContextFromProfile, isApplicable } from "./conditions";

const DISCLAIMER = `⚠️ Questa informazione è orientativa e basata sulle fonti ufficiali verificate al 23/08/2026. Non sostituisce consulenza legale. Verifica sempre sul portale ufficiale della Questura o del Ministero dell'Interno prima di presentare la domanda. Le normative possono cambiare e i requisiti variano per nazionalità, tipologia di visto e località.`;

export function assessRequirements(profile: UserProfileData): AssessmentResult {
  const country = countryByName(profile.country);
  const countryCode = country?.code;

  const context = conditionContextFromProfile(profile as unknown as Record<string, unknown>);

  // Seleziona la prima procedura applicabile al Paese scelto (rispetta le condizioni).
  // Un profilo senza condizioni applicative non è obbligato a selezionare una procedura specifica.
  const countryProcedures = PROCEDURES.filter((p) => p.countryCode === countryCode);
  const applicable = countryProcedures.length
    ? countryProcedures.filter((p) => isApplicable(p, context))
    : [];

  const procedure = applicable[0] || PROCEDURES_ALL.find((p) => isApplicable(p, context)) || PROCEDURES[0];

  const documents = procedure.requirements.map((req) => ({
    item: req,
    status: req.necessity,
  }));

  const sources = procedure.sources;

  return {
    procedure,
    documents,
    sources,
    disclaimer: DISCLAIMER,
  };
}
