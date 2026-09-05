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

  it("Albania è verified con una procedura reale (Fase 2B)", () => {
    expect(COUNTRY_PROCEDURE_INDEX["AL"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["AL"]?.procedureCount).toBe(1);
  });

  it("Marocco è verified con una procedura reale (Fase 2B)", () => {
    expect(COUNTRY_PROCEDURE_INDEX["MA"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["MA"]?.procedureCount).toBe(1);
  });

  it("Tunisia è verified con una procedura reale (Fase 2B)", () => {
    expect(COUNTRY_PROCEDURE_INDEX["TN"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["TN"]?.procedureCount).toBe(1);
  });

  it("Egitto è verified con una procedura reale (Fase 2B)", () => {
    expect(COUNTRY_PROCEDURE_INDEX["EG"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["EG"]?.procedureCount).toBe(1);
  });

  it("Bangladesh, Filippine, Senegal e Sri Lanka sono verified con una procedura reale (Fase 2B, Wave 1)", () => {
    expect(COUNTRY_PROCEDURE_INDEX["BD"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["BD"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["PH"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["PH"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["SN"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["SN"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["LK"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["LK"]?.procedureCount).toBe(1);
  });

  it("Pakistan, Nigeria e India sono verified con una procedura reale (Fase 2B, Wave 1b)", () => {
    expect(COUNTRY_PROCEDURE_INDEX["PK"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["PK"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["NG"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["NG"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["IN"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["IN"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["PK"]?.lastVerified).toBe("2026-09-05");
    expect(COUNTRY_PROCEDURE_INDEX["NG"]?.lastVerified).toBe("2026-09-05");
    expect(COUNTRY_PROCEDURE_INDEX["IN"]?.lastVerified).toBe("2026-09-05");
  });

  it("Algeria, Perù, Ecuador e Moldavia sono verified con una procedura reale (Fase 2B, Wave 2)", () => {
    expect(COUNTRY_PROCEDURE_INDEX["DZ"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["DZ"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["PE"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["PE"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["EC"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["EC"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["MD"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["MD"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["DZ"]?.lastVerified).toBe("2026-09-05");
    expect(COUNTRY_PROCEDURE_INDEX["PE"]?.lastVerified).toBe("2026-09-05");
    expect(COUNTRY_PROCEDURE_INDEX["EC"]?.lastVerified).toBe("2026-09-05");
    expect(COUNTRY_PROCEDURE_INDEX["MD"]?.lastVerified).toBe("2026-09-05");
  });

  it("Ucraina, Costa d'Avorio, Ghana e Georgia sono verified con una procedura reale (Fase 2B, Wave 2)", () => {
    expect(COUNTRY_PROCEDURE_INDEX["UA"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["UA"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["CI"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["CI"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["GH"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["GH"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["GE"]?.status).toBe("verified");
    expect(COUNTRY_PROCEDURE_INDEX["GE"]?.procedureCount).toBe(1);
    expect(COUNTRY_PROCEDURE_INDEX["UA"]?.lastVerified).toBe("2026-09-05");
    expect(COUNTRY_PROCEDURE_INDEX["CI"]?.lastVerified).toBe("2026-09-05");
    expect(COUNTRY_PROCEDURE_INDEX["GH"]?.lastVerified).toBe("2026-09-05");
    expect(COUNTRY_PROCEDURE_INDEX["GE"]?.lastVerified).toBe("2026-09-05");
  });

  it("i paesi senza dati sono 'unavailable' con procedureCount 0", () => {
    // Stati Uniti, ecc. non hanno ancora dati → unavailable
    expect(COUNTRY_PROCEDURE_INDEX["US"]?.status).toBe("unavailable");
    expect(COUNTRY_PROCEDURE_INDEX["US"]?.procedureCount).toBe(0);
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

  it("paese senza dati (Stati Uniti) NON è available", () => {
    expect(isCountryAvailable("US")).toBe(false);
  });

  it("Albania, Marocco, Tunisia ed Egitto sono available (datati verificati)", () => {
    expect(isCountryAvailable("AL")).toBe(true);
    expect(isCountryAvailable("MA")).toBe(true);
    expect(isCountryAvailable("TN")).toBe(true);
    expect(isCountryAvailable("EG")).toBe(true);
  });

  it("Bangladesh, Filippine, Senegal e Sri Lanka sono available (Fase 2B, Wave 1)", () => {
    expect(isCountryAvailable("BD")).toBe(true);
    expect(isCountryAvailable("PH")).toBe(true);
    expect(isCountryAvailable("SN")).toBe(true);
    expect(isCountryAvailable("LK")).toBe(true);
  });

  it("Pakistan, Nigeria e India sono available (Fase 2B, Wave 1b)", () => {
    expect(isCountryAvailable("PK")).toBe(true);
    expect(isCountryAvailable("NG")).toBe(true);
    expect(isCountryAvailable("IN")).toBe(true);
  });

  it("Algeria, Perù, Ecuador e Moldavia sono available (Fase 2B, Wave 2)", () => {
    expect(isCountryAvailable("DZ")).toBe(true);
    expect(isCountryAvailable("PE")).toBe(true);
    expect(isCountryAvailable("EC")).toBe(true);
    expect(isCountryAvailable("MD")).toBe(true);
  });

  it("Ucraina, Costa d'Avorio, Ghana e Georgia sono available (Fase 2B, Wave 2)", () => {
    expect(isCountryAvailable("UA")).toBe(true);
    expect(isCountryAvailable("CI")).toBe(true);
    expect(isCountryAvailable("GH")).toBe(true);
    expect(isCountryAvailable("GE")).toBe(true);
  });

  it("doesn't throw on null/undefined/empty", () => {
    expect(isCountryAvailable(null)).toBe(false);
    expect(isCountryAvailable(undefined)).toBe(false);
    expect(isCountryAvailable("")).toBe(false);
    expect(getCountryMeta(null)).toBeUndefined();
  });

  it("normalizza a uppercase", () => {
    expect(isCountryAvailable("it")).toBe(true);
    expect(getCountryMeta("ma")?.status).toBe("verified");
  });
});

describe("loadProceduresForCountry", () => {
  it("Italia → carica le 2 procedure", async () => {
    const procs = await loadProceduresForCountry("IT");
    expect(procs.length).toBe(2);
  });

  it("Albania → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("AL");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("AL-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Marocco → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("MA");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("MA-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Tunisia → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("TN");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("TN-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Egitto → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("EG");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("EG-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Bangladesh → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("BD");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("BD-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Filippine → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("PH");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("PH-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Senegal → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("SN");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("SN-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Sri Lanka → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("LK");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("LK-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Pakistan → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("PK");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("PK-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Nigeria → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("NG");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("NG-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("India → carica la procedura verificata", async () => {
    const procs = await loadProceduresForCountry("IN");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("IN-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Algeria → carica la procedura verificata (Fase 2B, Wave 2)", async () => {
    const procs = await loadProceduresForCountry("DZ");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("DZ-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Perù → carica la procedura verificata (Fase 2B, Wave 2)", async () => {
    const procs = await loadProceduresForCountry("PE");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("PE-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Ecuador → carica la procedura verificata (Fase 2B, Wave 2)", async () => {
    const procs = await loadProceduresForCountry("EC");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("EC-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Moldavia → carica la procedura verificata (Fase 2B, Wave 2)", async () => {
    const procs = await loadProceduresForCountry("MD");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("MD-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Ucraina → carica la procedura verificata (Fase 2B, Wave 2)", async () => {
    const procs = await loadProceduresForCountry("UA");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("UA-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Costa d'Avorio → carica la procedura verificata (Fase 2B, Wave 2)", async () => {
    const procs = await loadProceduresForCountry("CI");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("CI-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Ghana → carica la procedura verificata (Fase 2B, Wave 2)", async () => {
    const procs = await loadProceduresForCountry("GH");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("GH-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Georgia → carica la procedura verificata (Fase 2B, Wave 2)", async () => {
    const procs = await loadProceduresForCountry("GE");
    expect(procs.length).toBe(1);
    expect(procs[0].id).toBe("GE-permesso-soggiorno-lavoro");
    expect(procs[0].dataSource).toBe("verified");
  });

  it("Francia → 1 procedura (needs_review)", async () => {
    const procs = await loadProceduresForCountry("FR");
    expect(procs.length).toBe(1);
    expect(procs[0].dataSource).toBe("needs_review");
  });

  it("paese senza dati → array vuoto", async () => {
    expect(await loadProceduresForCountry("US")).toEqual([]);
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

  it("proceduresForCountryAsync risolve per IT/AL/MA/TN/FR/DE", async () => {
    const it = await proceduresForCountryAsync("IT");
    expect(it.length).toBeGreaterThanOrEqual(2);
    const al = await proceduresForCountryAsync("AL");
    expect(al.length).toBeGreaterThanOrEqual(1);
    expect(al[0].id).toBe("AL-permesso-soggiorno-lavoro");
    const ma = await proceduresForCountryAsync("MA");
    expect(ma.length).toBeGreaterThanOrEqual(1);
    expect(ma[0].id).toBe("MA-permesso-soggiorno-lavoro");
    const tn = await proceduresForCountryAsync("TN");
    expect(tn.length).toBeGreaterThanOrEqual(1);
    expect(tn[0].id).toBe("TN-permesso-soggiorno-lavoro");
    const eg = await proceduresForCountryAsync("EG");
    expect(eg.length).toBeGreaterThanOrEqual(1);
    expect(eg[0].id).toBe("EG-permesso-soggiorno-lavoro");
    const bd = await proceduresForCountryAsync("BD");
    expect(bd.length).toBeGreaterThanOrEqual(1);
    expect(bd[0].id).toBe("BD-permesso-soggiorno-lavoro");
    const ph = await proceduresForCountryAsync("PH");
    expect(ph.length).toBeGreaterThanOrEqual(1);
    expect(ph[0].id).toBe("PH-permesso-soggiorno-lavoro");
    const sn = await proceduresForCountryAsync("SN");
    expect(sn.length).toBeGreaterThanOrEqual(1);
    expect(sn[0].id).toBe("SN-permesso-soggiorno-lavoro");
    const lk = await proceduresForCountryAsync("LK");
    expect(lk.length).toBeGreaterThanOrEqual(1);
    expect(lk[0].id).toBe("LK-permesso-soggiorno-lavoro");
    const pk = await proceduresForCountryAsync("PK");
    expect(pk.length).toBeGreaterThanOrEqual(1);
    expect(pk[0].id).toBe("PK-permesso-soggiorno-lavoro");
    const ng = await proceduresForCountryAsync("NG");
    expect(ng.length).toBeGreaterThanOrEqual(1);
    expect(ng[0].id).toBe("NG-permesso-soggiorno-lavoro");
    const inResult = await proceduresForCountryAsync("IN");
    expect(inResult.length).toBeGreaterThanOrEqual(1);
    expect(inResult[0].id).toBe("IN-permesso-soggiorno-lavoro");
    const dz = await proceduresForCountryAsync("DZ");
    expect(dz.length).toBeGreaterThanOrEqual(1);
    expect(dz[0].id).toBe("DZ-permesso-soggiorno-lavoro");
    const pe = await proceduresForCountryAsync("PE");
    expect(pe.length).toBeGreaterThanOrEqual(1);
    expect(pe[0].id).toBe("PE-permesso-soggiorno-lavoro");
    const ec = await proceduresForCountryAsync("EC");
    expect(ec.length).toBeGreaterThanOrEqual(1);
    expect(ec[0].id).toBe("EC-permesso-soggiorno-lavoro");
    const md = await proceduresForCountryAsync("MD");
    expect(md.length).toBeGreaterThanOrEqual(1);
    expect(md[0].id).toBe("MD-permesso-soggiorno-lavoro");
    const ua = await proceduresForCountryAsync("UA");
    expect(ua.length).toBeGreaterThanOrEqual(1);
    expect(ua[0].id).toBe("UA-permesso-soggiorno-lavoro");
    const ci = await proceduresForCountryAsync("CI");
    expect(ci.length).toBeGreaterThanOrEqual(1);
    expect(ci[0].id).toBe("CI-permesso-soggiorno-lavoro");
    const gh = await proceduresForCountryAsync("GH");
    expect(gh.length).toBeGreaterThanOrEqual(1);
    expect(gh[0].id).toBe("GH-permesso-soggiorno-lavoro");
    const ge = await proceduresForCountryAsync("GE");
    expect(ge.length).toBeGreaterThanOrEqual(1);
    expect(ge[0].id).toBe("GE-permesso-soggiorno-lavoro");
    const fr = await proceduresForCountryAsync("FR");
    expect(fr.length).toBeGreaterThanOrEqual(1);
    const us = await proceduresForCountryAsync("US");
    expect(us.length).toBe(0);
  });

  it("getProcedureById risolve ancora FR (unverified)", () => {
    expect(getProcedureById("FR-permesso-soggiorno-lavoro")?.countryCode).toBe("FR");
  });
});

describe("PROCEDURES/PROCEDURES_ALL — nessuna regressione", () => {
  it("PROCEDURES contiene Italia + Albania + Marocco + Tunisia + Egitto + unverified", () => {
    const ids = PROCEDURES.map((p) => p.id);
    expect(ids).toContain("IT-permesso-soggiorno-lavoro");
    expect(ids).toContain("AL-permesso-soggiorno-lavoro");
    expect(ids).toContain("MA-permesso-soggiorno-lavoro");
    expect(ids).toContain("TN-permesso-soggiorno-lavoro");
    expect(ids).toContain("EG-permesso-soggiorno-lavoro");
    expect(ids).toContain("BD-permesso-soggiorno-lavoro");
    expect(ids).toContain("PH-permesso-soggiorno-lavoro");
    expect(ids).toContain("SN-permesso-soggiorno-lavoro");
    expect(ids).toContain("LK-permesso-soggiorno-lavoro");
    expect(ids).toContain("PK-permesso-soggiorno-lavoro");
    expect(ids).toContain("NG-permesso-soggiorno-lavoro");
    expect(ids).toContain("IN-permesso-soggiorno-lavoro");
    expect(ids).toContain("DZ-permesso-soggiorno-lavoro");
    expect(ids).toContain("PE-permesso-soggiorno-lavoro");
    expect(ids).toContain("EC-permesso-soggiorno-lavoro");
    expect(ids).toContain("MD-permesso-soggiorno-lavoro");
    expect(ids).toContain("UA-permesso-soggiorno-lavoro");
    expect(ids).toContain("CI-permesso-soggiorno-lavoro");
    expect(ids).toContain("GH-permesso-soggiorno-lavoro");
    expect(ids).toContain("GE-permesso-soggiorno-lavoro");
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

  it("AL.json è la fonte delle procedure Albania (Fase 2B)", () => {
    const json = loadCountryProceduresJson("AL");
    expect(json.length).toBe(1);
    expect(json.map((p) => p.id)).toEqual(expect.arrayContaining(["AL-permesso-soggiorno-lavoro"]));
    expect(getCountryProceduresJson("AL")?.status).toBe("verified");
    expect(json[0].sources[0].verificationStatus).toBe("verified");
  });

  it("MA.json è la fonte delle procedure Marocco (Fase 2B)", () => {
    const json = loadCountryProceduresJson("MA");
    expect(json.length).toBe(1);
    expect(json.map((p) => p.id)).toEqual(expect.arrayContaining(["MA-permesso-soggiorno-lavoro"]));
    expect(getCountryProceduresJson("MA")?.status).toBe("verified");
    expect(json[0].sources[0].verificationStatus).toBe("verified");
  });

  it("TN.json è la fonte delle procedure Tunisia (Fase 2B)", () => {
    const json = loadCountryProceduresJson("TN");
    expect(json.length).toBe(1);
    expect(json.map((p) => p.id)).toEqual(expect.arrayContaining(["TN-permesso-soggiorno-lavoro"]));
    expect(getCountryProceduresJson("TN")?.status).toBe("verified");
    expect(json[0].sources[0].verificationStatus).toBe("verified");
  });

  it("EG.json è la fonte delle procedure Egitto (Fase 2B)", () => {
    const json = loadCountryProceduresJson("EG");
    expect(json.length).toBe(1);
    expect(json.map((p) => p.id)).toEqual(expect.arrayContaining(["EG-permesso-soggiorno-lavoro"]));
    expect(getCountryProceduresJson("EG")?.status).toBe("verified");
    expect(json[0].sources[0].verificationStatus).toBe("verified");
  });

  it("BD/PH/SN/LK.json sono la fonte delle procedure Wave 1 (Fase 2B)", () => {
    for (const [code, id] of [
      ["BD", "BD-permesso-soggiorno-lavoro"],
      ["PH", "PH-permesso-soggiorno-lavoro"],
      ["SN", "SN-permesso-soggiorno-lavoro"],
      ["LK", "LK-permesso-soggiorno-lavoro"],
    ] as const) {
      const json = loadCountryProceduresJson(code);
      expect(json.length).toBe(1);
      expect(json.map((p) => p.id)).toEqual(expect.arrayContaining([id]));
      expect(getCountryProceduresJson(code)?.status).toBe("verified");
      expect(json[0].sources[0].verificationStatus).toBe("verified");
    }
  });

  it("PK/NG/IN.json sono la fonte delle procedure Wave 1b (Fase 2B)", () => {
    for (const [code, id] of [
      ["PK", "PK-permesso-soggiorno-lavoro"],
      ["NG", "NG-permesso-soggiorno-lavoro"],
      ["IN", "IN-permesso-soggiorno-lavoro"],
    ] as const) {
      const json = loadCountryProceduresJson(code);
      expect(json.length).toBe(1);
      expect(json.map((p) => p.id)).toEqual(expect.arrayContaining([id]));
      expect(getCountryProceduresJson(code)?.status).toBe("verified");
      expect(json[0].sources[0].verificationStatus).toBe("verified");
      expect(getCountryProceduresJson(code)?.updatedAt).toBe("2026-09-05");
    }
  });

  it("DZ/PE/EC/MD.json sono la fonte delle procedure Wave 2 (Fase 2B)", () => {
    for (const [code, id] of [
      ["DZ", "DZ-permesso-soggiorno-lavoro"],
      ["PE", "PE-permesso-soggiorno-lavoro"],
      ["EC", "EC-permesso-soggiorno-lavoro"],
      ["MD", "MD-permesso-soggiorno-lavoro"],
    ] as const) {
      const json = loadCountryProceduresJson(code);
      expect(json.length).toBe(1);
      expect(json.map((p) => p.id)).toEqual(expect.arrayContaining([id]));
      expect(getCountryProceduresJson(code)?.status).toBe("verified");
      expect(json[0].sources[0].verificationStatus).toBe("verified");
      expect(getCountryProceduresJson(code)?.updatedAt).toBe("2026-09-05");
    }
  });

  it("UA/CI/GH/GE.json sono la fonte delle procedure Wave 2 (Fase 2B)", () => {
    for (const [code, id] of [
      ["UA", "UA-permesso-soggiorno-lavoro"],
      ["CI", "CI-permesso-soggiorno-lavoro"],
      ["GH", "GH-permesso-soggiorno-lavoro"],
      ["GE", "GE-permesso-soggiorno-lavoro"],
    ] as const) {
      const json = loadCountryProceduresJson(code);
      expect(json.length).toBe(1);
      expect(json.map((p) => p.id)).toEqual(expect.arrayContaining([id]));
      expect(getCountryProceduresJson(code)?.status).toBe("verified");
      expect(json[0].sources[0].verificationStatus).toBe("verified");
      expect(getCountryProceduresJson(code)?.updatedAt).toBe("2026-09-05");
    }
  });

  it("paese senza file JSON → array vuoto", () => {
    expect(loadCountryProceduresJson("US")).toEqual([]);
    expect(loadCountryProceduresJson("ZZ")).toEqual([]);
    expect(loadCountryProceduresJson("")).toEqual([]);
  });

  it("PROCEDURES (bundle) riflette la fonte JSON canonica", () => {
    const ids = PROCEDURES.map((p) => p.id);
    expect(ids).toContain("IT-permesso-soggiorno-lavoro");
    expect(ids).toContain("AL-permesso-soggiorno-lavoro");
    expect(ids).toContain("MA-permesso-soggiorno-lavoro");
    expect(ids).toContain("TN-permesso-soggiorno-lavoro");
    expect(ids).toContain("EG-permesso-soggiorno-lavoro");
    expect(ids).toContain("BD-permesso-soggiorno-lavoro");
    expect(ids).toContain("PH-permesso-soggiorno-lavoro");
    expect(ids).toContain("SN-permesso-soggiorno-lavoro");
    expect(ids).toContain("LK-permesso-soggiorno-lavoro");
    expect(ids).toContain("PK-permesso-soggiorno-lavoro");
    expect(ids).toContain("NG-permesso-soggiorno-lavoro");
    expect(ids).toContain("IN-permesso-soggiorno-lavoro");
    expect(ids).toContain("DZ-permesso-soggiorno-lavoro");
    expect(ids).toContain("PE-permesso-soggiorno-lavoro");
    expect(ids).toContain("EC-permesso-soggiorno-lavoro");
    expect(ids).toContain("MD-permesso-soggiorno-lavoro");
    expect(ids).toContain("UA-permesso-soggiorno-lavoro");
    expect(ids).toContain("CI-permesso-soggiorno-lavoro");
    expect(ids).toContain("GH-permesso-soggiorno-lavoro");
    expect(ids).toContain("GE-permesso-soggiorno-lavoro");
    expect(ids).toContain("FR-permesso-soggiorno-lavoro");
    expect(ids).toContain("DE-permesso-soggiorno-lavoro");
  });
});
