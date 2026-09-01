export type NecessityType = "required" | "conditional" | "recommended";
export type ConfidenceLevel = "high" | "medium" | "low";

import type { Condition } from "./conditions";

// 📌 Testo multilingua dei contenuti procedura.
// `it`/`en` sono sempre presenti; le altre 5 lingue dell'interfaccia
// (fr/es/de/pt/ar) sono opzionali per singolo campo e vengono risolte in
// fallback da `localize()` (lingua richiesta → altre lingue disponibili → en
// → it). Questo consente supporto a tutte le 7 lingue nella struttura dei dati
// senza richiedere di tradurre ogni campo finché non esiste contenuto ufficiale.
export interface LocalizedText {
  it: string;
  en: string;
  fr?: string;
  es?: string;
  de?: string;
  pt?: string;
  ar?: string;
}

export interface Source {
  id: string;
  name: string;
  authority: string;
  url: string;
  lastVerifiedAt: string;
  confidence: ConfidenceLevel;
}

export interface DocumentRequirement {
  id: string;
  code: string;
  name: LocalizedText;
  description: LocalizedText;
  necessity: NecessityType;
  condition?: Condition;
  translationRequired?: boolean;
  legalizationType?: "none" | "apostille" | "consular";
  apostilleRequired?: boolean;
  whereToGet?: LocalizedText;
  whatYouNeed?: LocalizedText;
  validityPeriod?: LocalizedText;
  estimatedCost?: LocalizedText;
  processingTime?: LocalizedText;
  sourceId: string;
}

export interface WhereToApply {
  name: LocalizedText;
  address?: LocalizedText;
  hours?: LocalizedText;
  appointment?: LocalizedText;
  phone?: string;
  email?: string;
  website?: string;
  notes?: LocalizedText;
}

export interface ProcedureMeta {
  whoCanApply?: LocalizedText;
  whereToApply?: WhereToApply;
  method?: LocalizedText;
  estimatedCost?: LocalizedText;
  processingTime?: LocalizedText;
  validity?: LocalizedText;
  renewal?: LocalizedText;
  appointmentRequired?: boolean;
  steps?: LocalizedText[];
  note?: LocalizedText;
}

export interface Procedure {
  id: string;
  countryCode: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  category: string;
  sources: Source[];
  requirements: DocumentRequirement[];
  meta?: ProcedureMeta;
  // Condizione opzionale di applicabilità al contesto utente corrente.
  // Assente → procedura sempre applicabile.
  condition?: Condition;
}

export interface UserProfileData {
  country: string;
  city?: string;
  nationality: string;
  situation: string;
  requestText: string;
}

export interface AssessmentResult {
  procedure: Procedure;
  documents: {
    item: DocumentRequirement;
    status: "required" | "conditional" | "recommended";
  }[];
  sources: Source[];
  disclaimer: string;
}