import { describe, it, expect } from "vitest";
import { PROCEDURES, PROCEDURES_ALL } from "./db/procedures";
import { procedureItalia, procedureItaliaRicongiungimento } from "./db/procedures/Italia";
import { isApplicable, applicableOf, conditionContextFromProfile, type Condition } from "./conditions";
import { resolveNationalityGroups } from "./db/nationality-groups";
import { assessRequirements } from "./engine";
import type { Procedure } from "./types";

// Procedura fittizia senza condizione
const pNoCond: Procedure = {
  id: "p-no-cond",
  countryCode: "XX",
  slug: "no-cond",
  title: { it: "A", en: "A" },
  description: { it: "", en: "" },
  category: "other",
  sources: [],
  requirements: [],
};

// Procedura con condizione vera (user married)
const pCondTrue: Procedure = {
  ...pNoCond,
  id: "p-cond-true",
  slug: "cond-true",
  condition: { field: "maritalStatus", operator: "eq", value: "married" },
};

// Procedura con condizione falsa (user married, but requires single)
const pCondFalse: Procedure = {
  ...pNoCond,
  id: "p-cond-false",
  slug: "cond-false",
  condition: { field: "maritalStatus", operator: "eq", value: "single" },
};

const marriedContext = { maritalStatus: "married" };
const singleContext = { maritalStatus: "single" };

describe("Procedure applicability — filters", () => {
  it("Test A — procedura senza condizione: visibile", () => {
    expect(isApplicable(pNoCond, marriedContext)).toBe(true);
    expect(isApplicable(pNoCond, singleContext)).toBe(true);
  });

  it("Test B — procedura con condizione vera: visibile", () => {
    expect(isApplicable(pCondTrue, marriedContext)).toBe(true);
  });

  it("Test C — procedura con condizione falsa: nascosta", () => {
    expect(isApplicable(pCondFalse, marriedContext)).toBe(false);
  });

  it("Test D — A(senza) + B(vera) + C(falsa) → solo A e B", () => {
    const result = applicableOf([pNoCond, pCondTrue, pCondFalse], marriedContext).map((p) => p.id);
    expect(result).toEqual(["p-no-cond", "p-cond-true"]);
  });
});

describe("Procedure applicability — context (stesso context del sistema)", () => {
  it("la condizione usa i campi del contesto utente reale", () => {
    const condition: Condition = { field: "maritalStatus", operator: "eq", value: "married" };
    expect(conditionContextFromProfile({ maritalStatus: "married" }).maritalStatus).toBe("married");
    expect(isApplicable({ condition }, conditionContextFromProfile({ maritalStatus: "married" }))).toBe(true);
    expect(isApplicable({ condition }, conditionContextFromProfile({ maritalStatus: "tourism" }))).toBe(false);
  });
});

describe("Procedure applicability — dati reali (regression / backward compat)", () => {
  it("tutte le procedure esistenti senza condizione restano applicabili", () => {
    for (const p of PROCEDURES) {
      if (!p.condition) {
        expect(isApplicable(p, {})).toBe(true);
      }
    }
  });

  it("l'esempio Italia condizionale è applicabile solo da sposati", () => {
    expect(procedureItaliaRicongiungimento.condition).toBeDefined();
    expect(isApplicable(procedureItaliaRicongiungimento, conditionContextFromProfile({ maritalStatus: "married" }))).toBe(true);
    expect(isApplicable(procedureItaliaRicongiungimento, conditionContextFromProfile({ maritalStatus: "single" }))).toBe(false);
  });

  it("la procedura principale Italia (senza condizione) è sempre applicabile", () => {
    expect(procedureItalia.condition).toBeUndefined();
    expect(isApplicable(procedureItalia, conditionContextFromProfile({ maritalStatus: "single" }))).toBe(true);
  });

  it("assessRequirements per l'Italia restituisce la procedura principale applicabile", () => {
    const result = assessRequirements({
      country: "Italia",
      nationality: "Marocco",
      situation: "lavoro",
      requestText: "",
    });
    expect(result.procedure.id).toBe(procedureItalia.id);
  });

  it("la nuova procedura condizionale è inclusa nel registro procedure", () => {
    const found = PROCEDURES_ALL.some(
      (p) => p.id === "IT-ricongiungimento-familiare" && p.condition !== undefined
    );
    expect(found).toBe(true);
  });
});

// ── nationalityGroup: condizioni basate sulla nazionalità ────────

describe("Procedure applicability — nationalityGroup", () => {
  // Procedura fittizia applicabile solo a cittadini EU/EEA
  const pEuOnly: Procedure = {
    id: "p-eu-only",
    countryCode: "XX",
    slug: "eu-only",
    title: { it: "Solo EU", en: "EU only" },
    description: { it: "", en: "" },
    category: "other",
    sources: [],
    requirements: [],
    condition: {
      field: "nationalityGroup",
      operator: "in",
      value: ["eu", "eea"],
    },
  };

  // Procedura fittizia applicabile solo a stranieri extra-UE
  const pForeignOnly: Procedure = {
    id: "p-foreign-only",
    countryCode: "XX",
    slug: "foreign-only",
    title: { it: "Solo stranieri", en: "Foreign only" },
    description: { it: "", en: "" },
    category: "other",
    sources: [],
    requirements: [],
    condition: {
      field: "nationalityGroup",
      operator: "not_in",
      value: ["eu", "eea"],
    },
  };

  it("EU citizen context: eu-only is applicable, foreign-only is not", () => {
    const ctx = conditionContextFromProfile({ nationality: "IT" });
    expect(isApplicable(pEuOnly, ctx)).toBe(true);
    expect(isApplicable(pForeignOnly, ctx)).toBe(false);
  });

  it("non-EU citizen context: foreign-only is applicable, eu-only is not", () => {
    const ctx = conditionContextFromProfile({ nationality: "IN" });
    expect(isApplicable(pEuOnly, ctx)).toBe(false);
    expect(isApplicable(pForeignOnly, ctx)).toBe(true);
  });

  it("bilateral citizen context (Morocco): foreign-only is applicable, eu-only is not", () => {
    const ctx = conditionContextFromProfile({ nationality: "MA" });
    expect(isApplicable(pEuOnly, ctx)).toBe(false);
    expect(isApplicable(pForeignOnly, ctx)).toBe(true);
  });

  it("conditionContextFromProfile includes nationalityGroup for EU", () => {
    const ctx = conditionContextFromProfile({ nationality: "IT" }) as any;
    expect(ctx.nationalityGroup).toEqual(expect.arrayContaining(["eu", "eea"]));
  });

  it("conditionContextFromProfile includes nationalityGroup for non-EU", () => {
    const ctx = conditionContextFromProfile({ nationality: "CN" }) as any;
    expect(ctx.nationalityGroup).toEqual(["foreign"]);
  });

  it("resolveNationalityGroups is used inside conditionContextFromProfile", () => {
    const ctx = conditionContextFromProfile({ nationality: "CH" }) as any;
    const expected = resolveNationalityGroups("CH");
    expect(ctx.nationalityGroup).toEqual(expected);
  });
});
