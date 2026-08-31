import { describe, it, expect } from "vitest";
import { PROCEDURES, PROCEDURES_ALL } from "./db/procedures";
import { procedureItalia, procedureItaliaRicongiungimento } from "./db/procedures/Italia";
import { isApplicable, applicableOf, conditionContextFromProfile, type Condition } from "./conditions";
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
