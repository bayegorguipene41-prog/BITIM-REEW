// ==========================================
// JSON LOADER — fonte canonica dei dati
// ==========================================
//
// In Sessione 3 i dati procedura sono migrati dallo stack TS (Italia.ts /
// unverified.ts) a file JSON canonici sotto data/procedures/<ISO>.json.
//
// Questi loader importano i JSON (resolveJsonModule è attivo) e li tipizzano
// come Procedure[], mantenendo la compatibilità con tutti i consumer sincroni
// (proceduresForCountry / getProcedureById / Procedura).
//
// DA NOTARE: in questa fase i JSON sono bundlati come gli TS (non ancora
// scaricati on-demand). Il true code-splitting arriverà quando i file saranno
// serviti staticamente e caricati con import() dinamico. Il vantaggio di oggi:
// il contenuto vive in JSON editabile senza toccare codice.

import type { Procedure, VerificationStatus } from "@/lib/types";

export interface CountryProceduresFile {
  version: number;
  countryCode: string;
  updatedAt: string;
  status: VerificationStatus;
  procedures: Procedure[];
}

// import singoli per paese (bundlati in fase 2B)
import itJson from "@/data/procedures/IT.json";
import frJson from "@/data/procedures/FR.json";
import deJson from "@/data/procedures/DE.json";
import alJson from "@/data/procedures/AL.json";
import maJson from "@/data/procedures/MA.json";
import tnJson from "@/data/procedures/TN.json";
import egJson from "@/data/procedures/EG.json";
import bdJson from "@/data/procedures/BD.json";
import phJson from "@/data/procedures/PH.json";
import snJson from "@/data/procedures/SN.json";
import lkJson from "@/data/procedures/LK.json";
import pkJson from "@/data/procedures/PK.json";
import ngJson from "@/data/procedures/NG.json";
import inJson from "@/data/procedures/IN.json";
import dzJson from "@/data/procedures/DZ.json";
import peJson from "@/data/procedures/PE.json";
import ecJson from "@/data/procedures/EC.json";
import mdJson from "@/data/procedures/MD.json";
import uaJson from "@/data/procedures/UA.json";
import ciJson from "@/data/procedures/CI.json";
import ghJson from "@/data/procedures/GH.json";
import geJson from "@/data/procedures/GE.json";
import muJson from "@/data/procedures/MU.json";
import uzJson from "@/data/procedures/UZ.json";
import joJson from "@/data/procedures/JO.json";
import thJson from "@/data/procedures/TH.json";

const FILES: Record<string, CountryProceduresFile> = {
  IT: itJson as unknown as CountryProceduresFile,
  FR: frJson as unknown as CountryProceduresFile,
  DE: deJson as unknown as CountryProceduresFile,
  AL: alJson as unknown as CountryProceduresFile,
  MA: maJson as unknown as CountryProceduresFile,
  TN: tnJson as unknown as CountryProceduresFile,
  EG: egJson as unknown as CountryProceduresFile,
  BD: bdJson as unknown as CountryProceduresFile,
  PH: phJson as unknown as CountryProceduresFile,
  SN: snJson as unknown as CountryProceduresFile,
  LK: lkJson as unknown as CountryProceduresFile,
  PK: pkJson as unknown as CountryProceduresFile,
  NG: ngJson as unknown as CountryProceduresFile,
  IN: inJson as unknown as CountryProceduresFile,
  DZ: dzJson as unknown as CountryProceduresFile,
  PE: peJson as unknown as CountryProceduresFile,
  EC: ecJson as unknown as CountryProceduresFile,
  MD: mdJson as unknown as CountryProceduresFile,
  UA: uaJson as unknown as CountryProceduresFile,
  CI: ciJson as unknown as CountryProceduresFile,
  GH: ghJson as unknown as CountryProceduresFile,
  GE: geJson as unknown as CountryProceduresFile,
  MU: muJson as unknown as CountryProceduresFile,
  UZ: uzJson as unknown as CountryProceduresFile,
  JO: joJson as unknown as CountryProceduresFile,
  TH: thJson as unknown as CountryProceduresFile,
};

export function loadCountryProceduresJson(countryCode: string): Procedure[] {
  const file = FILES[countryCode.toUpperCase()];
  if (!file) return [];
  return file.procedures ?? [];
}

export function getCountryProceduresJson(
  countryCode: string
): CountryProceduresFile | undefined {
  return FILES[countryCode.toUpperCase()];
}
