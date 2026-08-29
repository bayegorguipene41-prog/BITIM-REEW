import type { UserProfileData, AssessmentResult } from "./types";
import { PROCEDURES, SOURCES } from "./db/seed-data";

const DISCLAIMER = `⚠️ Questa informazione è orientativa e basata sulle fonti ufficiali verificate al 23/08/2026. Non sostituisce consulenza legale. Verifica sempre sul portale ufficiale della Questura o del Ministero dell'Interno prima di presentare la domanda. Le normative possono cambiare e i requisiti variano per nazionalità, tipologia di visto e località.`;

export function assessRequirements(profile: UserProfileData): AssessmentResult {
  // Per MVP: restituiamo la procedura di riferimento
  const procedure = PROCEDURES[0]; // Permesso soggiorno lavoro

  // Filtra requisiti condizionali in base al profilo
  const documents = procedure.requirements.map((req) => ({
    item: req,
    status: req.necessity,
  }));

  const sources = SOURCES.filter((s) =>
    procedure.requirements.some((r) => r.sourceId === s.id)
  );

  return {
    procedure,
    documents,
    sources,
    disclaimer: DISCLAIMER,
  };
}