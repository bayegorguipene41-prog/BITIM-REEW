import { describe, it, expect } from "vitest";
import {
  COUNTRY_PROCEDURE_INDEX,
  isCountryAvailable,
  getCountryMeta,
  loadProceduresForCountry,
  loadProceduresForCountrySync,
} from "./_registry";
import { proceduresForCountry, proceduresForCountryAsync, getProcedureById } from "./lookup";
import { PROCEDURES, PROCEDURES_ALL } from "./index";
import { COUNTRIES } from "../countries";
import { loadCountryProceduresJson, getCountryProceduresJson } from "./json-loader";

describe("COUNTRY_PROCEDURE_INDEX — copertura paesi", () => {
  it("include tutti i paesi in COUNTRIES (nessun buco silenzioso)", () => {
    for (const c of COUNTRIES) {
      expect(COUNTRY_PROCEDURE_INDEX[c.code]).toBeDefined();
    }
  });

  it("Italy è verified con procedureCount > 0", () => {
    expect(COUNTRY_PROCEDURE_INDEX["IT"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["IT"]?.procedureCount).toBeGreaterThan(0);
  });

  it("Francia è needs_review (non più falsamente verified)", () => {
    expect(COUNTRY_PROCEDURE_INDEX["FR"]?.status).toBe("needs_review");
  });

  it("Germania è needs_review", () => {
    expect(COUNTRY_PROCEDURE_INDEX["DE"]?.status).toBe("needs_review");
  });

  it("i paesi senza dati sono 'unavailable' con procedureCount 0", () => {
    // Tunisia, Marocco, Albania, Algeria, ecc. non hanno ancora dati → unavailable
    expect(COUNTRY_PROCEDURE_INDEX["DZ"]?.status).toBe("unavailable");
    expect(COUNTRY_PROCEDURE_INDEX["TN"]?.status).toBe("unavailable");
    expect(COUNTRY_PROCEDURE_INDEX["TN"]?.procedureCount).toBe(0);
  });

  it("ogni meta ha la forma CountryProcedureMeta completa", () => {
    for (const meta of Object.values(COUNTRY_PROCEDURE_INDEX)) {
      expect(meta.countryCode).toBeTruthy();
      expect(typeof meta.procedureCount).toBe("number");
      expect(["verified", "partial", "needs_review", "unavailable"]).toContain(meta.status);
    }
  });
});

describe("isCountryAvailable / getCountryMeta", () => {
  it("Italia è available", () => {
    expect(isCountryAvailable("IT")).toBe(true);
  });

  it("Francia è available (needs_review è comunque navigabile)", () => {
    expect(isCountryAvailable("FR")).toBe(true);
  });

  it("paese senza dati (Tunisia) NON è available", () => {
    expect(isCountryAvailable("TN")).toBe(false);
  });

  it("Albania e Marocco NON sono available in Fase 2A (apice in 2B)", () => {
    expect(isCountryAvailable("AL")).toBe(false);
    expect(isCountryAvailable("MA")).toBe(false);
  });

  it("doesn't throw on null/undefined/empty", () => {
    expect(isCountryAvailable(null)).toBe(false);
    expect(isCountryAvailable(undefined)).toBe(false);
    expect(isCountryAvailable("")).toBe(false);
    expect(getCountryMeta(null)).toBeUndefined();
  });

  it("normalizza a uppercase", () => {
    expect(isCountryAvailable("it")).toBe(true);
    expect(getCountryMeta("de")?.status).toBe("needs_review");
  });
});

describe("loadProceduresForCountry", () => {
  it("Italia → carica le 2 procedure", async () => {
    const procs = await loadProceduresForCountry("IT");
    expect(procs.length).toBe(2);
  });

  it("Francia → 1 procedura (needs_review)", async () => {
    const procs = await loadProceduresForCountry("FR");
    expect(procs.length).toBe(1);
    expect(procs[0].dataSource).toBe("needs_review");
  });

  it("paese senza dati → array vuoto", async () => {
    expect(await loadProceduresForCountry("TN")).toEqual([]);
    expect(await loadProceduresForCountry("ZZ")).toEqual([]);
  });

  it("sync e async restituiscono gli stessi risultati", async () => {
    const sync = loadProceduresForCountrySync("IT");
    const asyncResult = await loadProceduresForCountry("IT");
    expect(sync.map((p) => p.id)).toEqual(asyncResult.map((p) => p.id));
  });
});

describe("lookup — integrazione sync/async backward compat", () => {
  it("proceduresForCountry (sync) mantiene FR/DE per compatibilità", () => {
    const fr = proceduresForCountry("FR").map((p) => p.id);
    expect(fr).toContain("FR-permesso-soggiorno-lavoro");
    const de = proceduresForCountry("DE").map((p) => p.id);
    expect(de).toContain("DE-permesso-soggiorno-lavoro");
  });

  it("proceduresForCountryAsync risolve per IT/FR/DE", async () => {
    const it = await proceduresForCountryAsync("IT");
    expect(it.length).toBeGreaterThanOrEqual(2);
    const fr = await proceduresForCountryAsync("FR");
    expect(fr.length).toBeGreaterThanOrEqual(1);
    const tn = await proceduresForCountryAsync("TN");
    expect(tn.length).toBe(0);
  });

  it("getProcedureById risolve ancora FR (unverified)", () => {
    expect(getProcedureById("FR-permesso-soggiorno-lavoro")?.countryCode).toBe("FR");
  });
});

describe("PROCEDURES/PROCEDURES_ALL — nessuna regressione", () => {
  it("PROCEDURES contiene Italia + unverified", () => {
    const ids = PROCEDURES.map((p) => p.id);
    expect(ids).toContain("IT-permesso-soggiorno-lavoro");
    expect(ids).toContain("FR-permesso-soggiorno-lavoro");
    expect(ids).toContain("DE-permesso-soggiorno-lavoro");
  });

  it("PROCEDURES_ALL conserva il legacy IT", () => {
    const ids = PROCEDURES_ALL.map((p) => p.id);
    expect(ids).toContain("permesso-soggiorno-lavoro-italia");
  });
});

describe("Migrazione JSON (Sessione 3) — fonte canonica", () => {
  it("IT.json è la fonte delle procedure Italia", () => {
    const json = loadCountryProceduresJson("IT");
    expect(json.length).toBe(2);
    expect(json.map((p) => p.id)).toEqual(
      expect.arrayContaining(["IT-permesso-soggiorno-lavoro", "IT-ricongiungimento-familiare"])
    );
    expect(getCountryProceduresJson("IT")?.status).toBe("verified");
    // i dati verificati arrivano dal file JSON, non dal modulo TS
    expect(json[0].sources[0].verificationStatus).toBe("verified");
  });

  it("FR.json/DE.json restano la fonte dei placeholder needs_review", () => {
    expect(getCountryProceduresJson("FR")?.status).toBe("needs_review");
    expect(getCountryProceduresJson("DE")?.status).toBe("needs_review");
    expect(loadCountryProceduresJson("FR").length).toBe(1);
    expect(loadCountryProceduresJson("DE").length).toBe(1);
  });

  it("paese senza file JSON → array vuoto", () => {
    expect(loadCountryProceduresJson("TN")).toEqual([]);
    expect(loadCountryProceduresJson("ZZ")).toEqual([]);
    expect(loadCountryProceduresJson("")).toEqual([]);
  });

  it("PROCEDURES (bundle) riflette la fonte JSON canonica", () => {
    const ids = PROCEDURES.map((p) => p.id);
    expect(ids).toContain("IT-permesso-soggiorno-lavoro");
    expect(ids).toContain("FR-permesso-soggiorno-lavoro");
    expect(ids).toContain("DE-permesso-soggiorno-lavoro");
  });
});