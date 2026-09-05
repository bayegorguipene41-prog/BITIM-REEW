// ==========================================
// PROCEDURE REGISTRY — indice leggero + lazy loading
// ==========================================
//
// Questo modulo contiene SOLO metadati (CountryProcedureMeta) per ogni paese:
// quante procedure, quando verificato, stato di fiducia. I dettagli completi
// delle procedure NON sono qui: vengono caricati tramite loadProceduresForCountry().
//
// In Fase 2A i dati sono ancora moduli TS nel bundle, quindi il loader risolve
// in modo sincrono. Quando i dati passeranno a JSON esterni (Fase 2B), questo
// loader userà import() dinamico e i chunk saranno scaricati on-demand:
// il bundle iniziale conterrà solo ~KB di metadati.

import { COUNTRIES } from "../countries";
import { loadCountryProceduresJson } from "./json-loader";
import { UNVERIFIED_PROCEDURES } from "./unverified";
import type { CountryProcedureMeta, Procedure, VerificationStatus } from "@/lib/types";

// ── Fonti statiche per stato verifica ──────────────────────────
// In Sessione 3 i dati veri saranno spostati in file JSON sotto /data/procedures
// e qui confluiranno tramite _index.json. Per ora:
//   - IT → italiaData.ts (dati verificati)
//   - FR/DE → unverified.ts (dati placeholder marcati needs_review)
//   - tutti gli altri paesi in COUNTRIES → unavailable

const STATIC_STATUS: Record<string, VerificationStatus> = {
  IT: "verified",
  AL: "verified",
  MA: "verified",
  TN: "verified",
  EG: "verified",
  BD: "verified",
  PH: "verified",
  SN: "verified",
  LK: "verified",
  PK: "verified",
  NG: "verified",
  IN: "verified",
  DZ: "verified",
  PE: "verified",
  EC: "verified",
  MD: "verified",
  UA: "verified",
  CI: "verified",
  GH: "verified",
  GE: "verified",
  FR: "needs_review",
  DE: "needs_review",
};

// Data di ultima verifica per i paesi con dati (allineata a data/procedures/_index.json)
const COUNTRY_LAST_VERIFIED: Record<string, string> = {
  IT: "2026-08-30",
  AL: "2026-09-04",
  MA: "2026-09-04",
  TN: "2026-09-04",
  EG: "2026-09-04",
  BD: "2026-09-04",
  PH: "2026-09-04",
  SN: "2026-09-04",
  LK: "2026-09-04",
  PK: "2026-09-05",
  NG: "2026-09-05",
  IN: "2026-09-05",
  DZ: "2026-09-05",
  PE: "2026-09-05",
  EC: "2026-09-05",
  MD: "2026-09-05",
  UA: "2026-09-05",
  CI: "2026-09-05",
  GH: "2026-09-05",
  GE: "2026-09-05",
};
const LATEST_VERIFIED_DATE = "2026-09-05";

// ── Indice completo: ogni paese in COUNTRIES ha una voce ───────
// I paesi con dati procedura hanno procedureCount > 0; quelli senza dati
// restano presenti con procedureCount 0 e status "unavailable" (mai un buco
// silenzioso nella UI). Le procedure verificate vengono lette dai JSON canonici
// tramite loadCountryProceduresJson, così ogni paese porta i propri dati reali.

export const COUNTRY_PROCEDURE_INDEX: Record<string, CountryProcedureMeta> =
  Object.fromEntries(
    COUNTRIES.map((c) => {
      const status = STATIC_STATUS[c.code] ?? "unavailable";
      const hasData = status === "verified" || status === "needs_review";
      return [
        c.code,
        {
          countryCode: c.code,
          procedureCount: hasData
            ? status === "verified"
              ? loadCountryProceduresJson(c.code).length
              : UNVERIFIED_PROCEDURES.filter((p) => p.countryCode === c.code).length
            : 0,
          lastVerified: hasData ? COUNTRY_LAST_VERIFIED[c.code] ?? LATEST_VERIFIED_DATE : "",
          status,
        },
      ];
    })
  );

// ── Predicati di disponibilità ─────────────────────────────────

export function isCountryAvailable(countryCode: string | undefined | null): boolean {
  if (!countryCode) return false;
  const meta = COUNTRY_PROCEDURE_INDEX[countryCode.toUpperCase()];
  return !!meta && (meta.status === "verified" || meta.status === "needs_review");
}

export function getCountryMeta(countryCode: string | undefined | null): CountryProcedureMeta | undefined {
  if (!countryCode) return undefined;
  return COUNTRY_PROCEDURE_INDEX[countryCode.toUpperCase()];
}

// ── Provider: un'unica fonte di verità per i dati nel bundle ───

const ALL_BUNDLE_DATA: Procedure[] = [
  ...loadCountryProceduresJson("IT"),
  ...loadCountryProceduresJson("AL"),
  ...loadCountryProceduresJson("MA"),
  ...loadCountryProceduresJson("TN"),
  ...loadCountryProceduresJson("EG"),
  ...loadCountryProceduresJson("BD"),
  ...loadCountryProceduresJson("PH"),
  ...loadCountryProceduresJson("SN"),
  ...loadCountryProceduresJson("LK"),
  ...loadCountryProceduresJson("PK"),
  ...loadCountryProceduresJson("NG"),
  ...loadCountryProceduresJson("IN"),
  ...loadCountryProceduresJson("DZ"),
  ...loadCountryProceduresJson("PE"),
  ...loadCountryProceduresJson("EC"),
  ...loadCountryProceduresJson("MD"),
  ...loadCountryProceduresJson("UA"),
  ...loadCountryProceduresJson("CI"),
  ...loadCountryProceduresJson("GH"),
  ...loadCountryProceduresJson("GE"),
  ...UNVERIFIED_PROCEDURES,
];

export function loadProceduresForCountrySync(
  countryCode: string | undefined | null
): Procedure[] {
  if (!countryCode) return [];
  const code = countryCode.toUpperCase();
  return ALL_BUNDLE_DATA.filter((p) => p.countryCode === code);
}

// API async: in Fase 2A risolve in modo sincrono dal bundle. In Fase 2B questo
// diventerà un vero import() dinamico dei JSON per paese.
export async function loadProceduresForCountry(
  countryCode: string | undefined | null
): Promise<Procedure[]> {
  return loadProceduresForCountrySync(countryCode);
}
