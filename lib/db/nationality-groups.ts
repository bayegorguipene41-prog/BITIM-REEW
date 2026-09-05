// ==========================================
// NATIONALITY GROUPS — classificazione paesi in gruppi
// ==========================================
//
// Ogni paese (ISO 3166-1 alpha-2) viene mappato a uno o piu gruppi
// che determinano requisiti diversi nelle procedure di immigrazione.
//
// I gruppi bilateral_* sono SPECIFICI per un dato paese di destinazione.
// Esempio: "bilateral_it-maroc" vale solo quando il paese destinazione
// e l'Italia. Quando in futuro si aggiungeranno altri paesi destinazione
// (Francia, Germania, ecc.) ognuno avra i propri accordi bilateral,
// mappati nella stessa struttura `BILATERAL_AGREEMENTS`.

export type NationalityGroup =
  | "eu"
  | "eea"
  | "ch"
  | "bilateral"
  | "foreign"
  | "all";

// ── EU (27 paesi, Trattato di Lisbona 2009) ──────────────────────
export const EU_CODES: readonly string[] = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
];

// ── SEE (EU + Islanda, Liechtenstein, Norvegia) ──────────────────
export const EEA_CODES: readonly string[] = [
  ...EU_CODES,
  "IS", // Islanda
  "LI", // Liechtenstein
  "NO", // Norvegia
];

// ── Svizzera (accordi bilaterali specifici con SEE) ──────────────
export const SWITZERLAND_CODE = "CH";

// ── Accordi bilaterali per paese di destinazione ─────────────────
// Chiave: codice ISO del paese DESTINAZIONE.
// Valore: mappa { codicepartner → nome_gruppo }.
// Ogni paese destinazione puo avere i propri accordi.
// Per ora solo l'Italia ha accordi definiti; gli altri paesi
// saranno popolati man mano che si aggiungono dati reali.

export interface BilateralAgreements {
  [destinationCountryCode: string]: Record<string, string>;
}

export const BILATERAL_AGREEMENTS: BilateralAgreements = {
  // ── Italia come paese di destinazione ──
  // Fonte: Ministero degli Affari Esteri e della Cooperazione Internazionale
  // https://www.esteri.it/it/politica-estera-e-cooperazione-allo-sviluppo/migranti/
  IT: {
    MA: "bilateral_it-maroc",    // Marocco
    TN: "bilateral_it-tunisia",  // Tunisia
    AL: "bilateral_it-albania",  // Albania
    EG: "bilateral_it-egypt",    // Egitto
    PH: "bilateral_it-philippines", // Filippine
    BD: "bilateral_it-bangladesh",  // Bangladesh
    PK: "bilateral_it-pakistan", // Pakistan (Memorandum d'Intesa 2025)
    IN: "bilateral_it-india",    // India (Accordo migrazione e mobilità 2023)
    EC: "bilateral_it-ecuador",  // Ecuador (Memorandum of Understanding 2025)
    MD: "bilateral_it-moldova",  // Moldavia (Accordo 5 luglio 2011 in materia migratoria per motivi di lavoro)
    MU: "bilateral_it-mauritius", // Mauritius
    UZ: "bilateral_it-uzbekistan", // Uzbekistan
  },
  // Futuri esempi:
  // FR: { MA: "bilateral_fr-maroc", TN: "bilateral_fr-tunisia", ... },
  // DE: { TR: "bilateral_de-turkey", ... },
};

// ── Mappa precomputata: countryCode → gruppi ────────────────────
// Costruita una volta sola, usata da resolveNationalityGroups().

function buildCountryGroupMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();

  function addGroups(code: string, ...groups: string[]) {
    const existing = map.get(code) || [];
    map.set(code, [...existing, ...groups]);
  }

  // EU → eu + eea
  for (const code of EU_CODES) {
    addGroups(code, "eu", "eea");
  }

  // SEE non-EU → eea
  for (const code of ["IS", "LI", "NO"]) {
    addGroups(code, "eea");
  }

  // Svizzera → ch + eea (accordi bilaterali SEE)
  addGroups(SWITZERLAND_CODE, "ch", "eea");

  // Accordi bilaterali: ogni partner riceve "bilateral" + il nome specifico + "foreign"
  for (const [_dest, partners] of Object.entries(BILATERAL_AGREEMENTS)) {
    for (const [partnerCode, groupName] of Object.entries(partners)) {
      addGroups(partnerCode, "bilateral", groupName, "foreign");
    }
  }

  return map;
}

const COUNTRY_GROUP_MAP = buildCountryGroupMap();

// ── Funzione principale ─────────────────────────────────────────
// Restituisce la lista di gruppi di cui fa parte un paese.
// Per ogni paese e garantito almeno ["foreign"] come fallback.

const FOREIGN_GROUPS: readonly string[] = ["foreign"];

export function resolveNationalityGroups(countryCode: string | undefined | null): string[] {
  if (!countryCode || typeof countryCode !== "string") {
    return [...FOREIGN_GROUPS];
  }

  const trimmed = countryCode.trim().toUpperCase();
  if (trimmed.length !== 2) {
    return [...FOREIGN_GROUPS];
  }

  const groups = COUNTRY_GROUP_MAP.get(trimmed);
  if (!groups || groups.length === 0) {
    return [...FOREIGN_GROUPS];
  }

  return groups;
}
