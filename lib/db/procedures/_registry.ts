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
  FR: "needs_review",
  DE: "needs_review",
};

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
          lastVerified: hasData ? "2026-09-04" : "",
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