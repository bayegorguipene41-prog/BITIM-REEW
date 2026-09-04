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

const FILES: Record<string, CountryProceduresFile> = {
  IT: itJson as unknown as CountryProceduresFile,
  FR: frJson as unknown as CountryProceduresFile,
  DE: deJson as unknown as CountryProceduresFile,
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