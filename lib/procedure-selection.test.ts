import { describe, it, expect } from "vitest";
import { assessRequirements } from "./engine";
import { getProcedureById, proceduresForCountry } from "./db/procedures/lookup";
import { PROCEDURES } from "./db/procedures";
import {
  procedureItalia,
  procedureItaliaRicongiungimento,
} from "./db/procedures/Italia";

// Two genuinely distinct Italian procedures:
//  - IT-permesso-soggiorno-lavoro (work residence permit)
//  - IT-ricongiungimento-familiare (family reunification, different dataset)
const PROCEDURE_A = procedureItalia;
const PROCEDURE_B = procedureItaliaRicongiungimento;

const baseProfile = {
  country: "Italia",
  destination: "IT",
  nationality: "Marocco",
  situation: "lavoro",
  requestText: "",
};

describe("procedure selection is deterministic by id", () => {
  it("Test 1 — selecting A returns the procedure A dataset", () => {
    const res = assessRequirements(baseProfile, PROCEDURE_A.id);
    expect(res.procedure.id).toBe(PROCEDURE_A.id);
  });

  it("Test 2 — selecting B returns the procedure B dataset", () => {
    const res = assessRequirements(baseProfile, PROCEDURE_B.id);
    expect(res.procedure.id).toBe(PROCEDURE_B.id);
  });

  it("Test 3 — A and B produce different data when their datasets differ", () => {
    const resA = assessRequirements(baseProfile, PROCEDURE_A.id);
    const resB = assessRequirements(baseProfile, PROCEDURE_B.id);
    expect(resA.procedure.id).not.toBe(resB.procedure.id);
    // Distinct requirement sets (work-permit vs reunification).
    const idsA = new Set(resA.documents.map((d) => d.item.id));
    const idsB = new Set(resB.documents.map((d) => d.item.id));
    expect(idsA.has("contratto")).toBe(true);
    expect(idsB.has("certificato-matrimonio")).toBe(true);
    for (const id of idsB) expect(idsA.has(id)).toBe(false);
  });

  it("Test 4 — unknown id throws and NEVER falls back to a default procedure", () => {
    // The legacy/unrequested path throws; no PROCEDURES[0] substitution.
    expect(() => assessRequirements(baseProfile, "nonexistent-procedure")).toThrow(
      "Procedure not found"
    );
  });

  it("Test 7 — id is stable and independent of language (no translation-derived ids)", () => {
    // Same procedure id regardless of how its title is localized/queried.
    expect(PROCEDURE_A.id).toBe("IT-permesso-soggiorno-lavoro");
    expect(PROCEDURE_B.id).toBe("IT-ricongiungimento-familiare");
    // The id is not derived from a translated title.
    expect("Permesso di soggiorno" === PROCEDURE_A.id).toBe(false);
  });

  it("Test 8 — sequential selections do not contaminate each other", () => {
    const first = assessRequirements(baseProfile, PROCEDURE_A.id);
    const second = assessRequirements(baseProfile, PROCEDURE_B.id);
    const third = assessRequirements(baseProfile, PROCEDURE_A.id);
    expect(first.procedure.id).toBe(PROCEDURE_A.id);
    expect(second.procedure.id).toBe(PROCEDURE_B.id);
    expect(third.procedure.id).toBe(PROCEDURE_A.id);
    // No state leak: A then B then A stays A.
    expect(third.documents.map((d) => d.item.id)).toEqual(first.documents.map((d) => d.item.id));
  });
});

describe("getProcedureById / proceduresForCountry", () => {
  it("resolves by exact id", () => {
    expect(getProcedureById(PROCEDURE_A.id)?.id).toBe(PROCEDURE_A.id);
    expect(getProcedureById(PROCEDURE_B.id)?.id).toBe(PROCEDURE_B.id);
  });

  it("returns undefined for unknown ids", () => {
    expect(getProcedureById("nope")).toBeUndefined();
    expect(getProcedureById(undefined)).toBeUndefined();
  });

  it("country lookup returns distinct procedures, no duplicates", () => {
    const it = proceduresForCountry("IT");
    expect(it.length).toBeGreaterThanOrEqual(2);
    const ids = new Set(it.map((p) => p.id));
    expect(ids.size).toBe(it.length);
  });
});

describe("no PROCEDURES[0] fallback for a requested procedure", () => {
  it("Test 10 — every real procedure resolves to its own id via the registry", () => {
    // Iterate real procedures: each one must be returned as-is by its own id.
    for (const p of PROCEDURES) {
      const res = assessRequirements({ ...baseProfile, country: "Italia" }, p.id);
      expect(res.procedure.id).toBe(p.id);
    }
  });

  it("the first procedure is the residence permit, but a different id never maps to it", () => {
    expect(PROCEDURES[0].id).toBe("IT-permesso-soggiorno-lavoro");
    // Selecting B must NOT produce PROCEDURES[0].
    const resB = assessRequirements(baseProfile, PROCEDURE_B.id);
    expect(resB.procedure.id).not.toBe(PROCEDURES[0].id);
  });
});

describe("REAL procedures: A → A, B → B, C → C, never another's data", () => {
  // C is a genuinely different country's procedure (France), distinct from the
  // two Italian ones. Each resolves to its own dataset by id.
  const PROCEDURE_C = getProcedureById("FR-permesso-soggiorno-lavoro")!;

  it("A returns the A procedure's own identity and dataset", () => {
    const res = assessRequirements(baseProfile, PROCEDURE_A.id);
    expect(res.procedure.id).toBe("IT-permesso-soggiorno-lavoro");
    expect(res.procedure.countryCode).toBe("IT");
    expect(res.procedure.slug).toBe("permesso-soggiorno-lavoro");
    expect(res.procedure.title.it).toContain("Permesso di soggiorno");
    // The work-permit dataset includes the work contract and health cover.
    const ids = new Set(res.documents.map((d) => d.item.id));
    expect(ids.has("contratto")).toBe(true);
    expect(ids.has("assicurazione-sanitaria")).toBe(true);
  });

  it("B returns the B procedure's own identity and dataset", () => {
    const res = assessRequirements(baseProfile, PROCEDURE_B.id);
    expect(res.procedure.id).toBe("IT-ricongiungimento-familiare");
    expect(res.procedure.countryCode).toBe("IT");
    expect(res.procedure.slug).toBe("ricongiungimento-familiare");
    expect(res.procedure.title.it).toContain("Ricongiungimento");
    const ids = new Set(res.documents.map((d) => d.item.id));
    expect(ids.has("certificato-matrimonio")).toBe(true);
    expect(ids.has("permesso-coniuge")).toBe(true);
  });

  it("C returns the C procedure's own identity and country", () => {
    const res = assessRequirements(baseProfile, PROCEDURE_C.id);
    expect(res.procedure.id).toBe("FR-permesso-soggiorno-lavoro");
    expect(res.procedure.countryCode).toBe("FR");
    expect(res.procedure.slug).toBe("permesso-soggiorno-lavoro");
    // C is a different country than A, even though they share a slug value.
    expect(res.procedure.countryCode).not.toBe(PROCEDURE_A.countryCode);
    // Dopo la rimozione dei placeholder, FR/DE sono marcati explicitly
    // needs_review, non più falsamente verificati.
    expect(res.procedure.dataSource).toBe("needs_review");
  });

  it("A !== B: distinct ids and distinct datasets, no bleeding", () => {
    const a = assessRequirements(baseProfile, PROCEDURE_A.id);
    const b = assessRequirements(baseProfile, PROCEDURE_B.id);
    expect(a.procedure.id).not.toBe(b.procedure.id);
    // B's reunification documents must not appear inside A's work-permit result.
    const idsA = new Set(a.documents.map((d) => d.item.id));
    expect(idsA.has("certificato-matrimonio")).toBe(false);
    expect(idsA.has("permesso-coniuge")).toBe(false);
  });

  it("A !== C: distinct by country, dataset resolved to C", () => {
    const a = assessRequirements(baseProfile, PROCEDURE_A.id);
    const c = assessRequirements(baseProfile, PROCEDURE_C.id);
    expect(a.procedure.countryCode).toBe("IT");
    expect(c.procedure.countryCode).toBe("FR");
    expect(c.procedure.id).not.toBe(a.procedure.id);
  });

  it("routing to a different country does not turn into the IT residence permit (no fallback)", () => {
    // Requesting France must return France, NOT PROCEDURES[0] (Italia work permit).
    const c = assessRequirements(baseProfile, PROCEDURE_C.id);
    expect(c.procedure.countryCode).toBe("FR");
    expect(c.procedure.id).not.toBe("IT-permesso-soggiorno-lavoro");
  });

  it("each country exposes its selectable procedure(s) for the wizard", () => {
    expect(proceduresForCountry("IT").map((p) => p.id)).toEqual(
      expect.arrayContaining(["IT-permesso-soggiorno-lavoro", "IT-ricongiungimento-familiare"])
    );
    expect(proceduresForCountry("FR").map((p) => p.id)).toContain("FR-permesso-soggiorno-lavoro");
    expect(proceduresForCountry("DE").map((p) => p.id)).toContain("DE-permesso-soggiorno-lavoro");
    // Italy must not appear in France's list and vice-versa.
    expect(proceduresForCountry("FR").map((p) => p.id)).not.toContain("IT-permesso-soggiorno-lavoro");
  });
});