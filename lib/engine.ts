import type { UserProfileData, AssessmentResult } from "./types";
import { PROCEDURES } from "./db/procedures";
import { COUNTRIES } from "./db/countries";

const DISCLAIMER = `⚠️ Questa informazione è orientativa e basata sulle fonti ufficiali verificate al 23/08/2026. Non sostituisce consulenza legale. Verifica sempre sul portale ufficiale della Questura o del Ministero dell'Interno prima di presentare la domanda. Le normative possono cambiare e i requisiti variano per nazionalità, tipologia di visto e località.`;

export function assessRequirements(profile: UserProfileData): AssessmentResult {
  // Trova il codice del Paese corrispondente al nome selezionato dall'utente
  const country = COUNTRIES.find(
    (c) => c.name.toLowerCase() === profile.country.trim().toLowerCase()
  );
  const countryCode = country?.code;

  // Cerca la procedura del Paese scelto; se non trovata (o non disponibile ancora)
  // ripiega sulla prima procedura come fallback
  const procedure =
    PROCEDURES.find((p) => p.countryCode === countryCode) || PROCEDURES[0];

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