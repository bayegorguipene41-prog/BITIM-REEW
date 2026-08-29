export type NecessityType = "required" | "conditional" | "recommended";
export type ConfidenceLevel = "high" | "medium" | "low";

// 📌 Testo multilingua (italiano / inglese)
export interface LocalizedText {
  it: string;
  en: string;
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
  condition?: string;
  translationRequired?: boolean;
  legalizationType?: "none" | "apostille" | "consular";
  sourceId: string;
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