import { describe, it, expect } from "vitest";
import { evaluateCondition, isApplicable, applicableOf, type Conditioned } from "./conditions";

const ctx = (overrides: Record<string, unknown> = {}) => ({
  name: "Italy",
  age: 25,
  score: 10,
  flag: false,
  empty: "",
  zero: 0,
  maritalStatus: "married",
  tags: ["work", "study"],
  nullValue: null,
  ...overrides,
});

describe("evaluateCondition — eq (strict)", () => {
  it("equal strings → true", () => {
    expect(evaluateCondition({ field: "name", operator: "eq", value: "Italy" }, ctx())).toBe(true);
  });
  it("different strings → false", () => {
    expect(evaluateCondition({ field: "name", operator: "eq", value: "France" }, ctx())).toBe(false);
  });
  it("equal numbers → true", () => {
    expect(evaluateCondition({ field: "age", operator: "eq", value: 25 }, ctx())).toBe(true);
  });
  it("different numbers → false", () => {
    expect(evaluateCondition({ field: "age", operator: "eq", value: 26 }, ctx())).toBe(false);
  });
  it("equal booleans → true", () => {
    expect(evaluateCondition({ field: "flag", operator: "eq", value: false }, ctx())).toBe(true);
  });
  it("different booleans → false", () => {
    expect(evaluateCondition({ field: "flag", operator: "eq", value: true }, ctx())).toBe(false);
  });
  it("null vs undefined are distinct (no conflation)", () => {
    expect(evaluateCondition({ field: "nullValue", operator: "eq", value: undefined }, ctx())).toBe(false);
    expect(evaluateCondition({ field: "nullValue", operator: "eq", value: null }, ctx())).toBe(true);
  });
  it("0 is not treated as missing", () => {
    expect(evaluateCondition({ field: "zero", operator: "eq", value: 0 }, ctx())).toBe(true);
    expect(evaluateCondition({ field: "zero", operator: "eq", value: false }, ctx())).toBe(false);
  });
  it("empty string is not treated as missing", () => {
    expect(evaluateCondition({ field: "empty", operator: "eq", value: "" }, ctx())).toBe(true);
    expect(evaluateCondition({ field: "empty", operator: "eq", value: undefined }, ctx())).toBe(false);
  });
  it("missing field eq undefined → true", () => {
    expect(evaluateCondition({ field: "missing", operator: "eq", value: undefined }, ctx())).toBe(true);
  });
  it("missing field eq anything else → false", () => {
    expect(evaluateCondition({ field: "missing", operator: "eq", value: "x" }, ctx())).toBe(false);
  });
});

describe("evaluateCondition — neq (strict)", () => {
  it("different values → true", () => {
    expect(evaluateCondition({ field: "name", operator: "neq", value: "France" }, ctx())).toBe(true);
  });
  it("same values → false", () => {
    expect(evaluateCondition({ field: "name", operator: "neq", value: "Italy" }, ctx())).toBe(false);
  });
  it("missing field neq undefined → false", () => {
    expect(evaluateCondition({ field: "missing", operator: "neq", value: undefined }, ctx())).toBe(false);
  });
});

describe("evaluateCondition — in", () => {
  it("value exists in collection → true", () => {
    expect(evaluateCondition({ field: "maritalStatus", operator: "in", value: ["single", "married"] }, ctx())).toBe(true);
  });
  it("value does not exist → false", () => {
    expect(evaluateCondition({ field: "maritalStatus", operator: "in", value: ["single"] }, ctx())).toBe(false);
  });
  it("empty collection → false", () => {
    expect(evaluateCondition({ field: "maritalStatus", operator: "in", value: [] }, ctx())).toBe(false);
  });
  it("number membership in array", () => {
    expect(evaluateCondition({ field: "age", operator: "in", value: [20, 25, 30] }, ctx())).toBe(true);
    expect(evaluateCondition({ field: "age", operator: "in", value: [20, 30] }, ctx())).toBe(false);
  });
});

describe("evaluateCondition — not_in", () => {
  it("value does not exist → true", () => {
    expect(evaluateCondition({ field: "maritalStatus", operator: "not_in", value: ["single"] }, ctx())).toBe(true);
  });
  it("value exists → false", () => {
    expect(evaluateCondition({ field: "maritalStatus", operator: "not_in", value: ["single", "married"] }, ctx())).toBe(false);
  });
  it("empty collection → true", () => {
    expect(evaluateCondition({ field: "maritalStatus", operator: "not_in", value: [] }, ctx())).toBe(true);
  });
});

describe("evaluateCondition — gte / lte / gt / lt", () => {
  it("gte: 10 >= 10 → true (boundary)", () => {
    expect(evaluateCondition({ field: "score", operator: "gte", value: 10 }, ctx())).toBe(true);
  });
  it("gte: 11 >= 10 → true (above)", () => {
    expect(evaluateCondition({ field: "score", operator: "gte", value: 9 }, ctx())).toBe(true);
  });
  it("gte: 9 >= 10 → false (below)", () => {
    expect(evaluateCondition({ field: "score", operator: "gte", value: 11 }, ctx())).toBe(false);
  });
  it("lte: 10 <= 10 → true (boundary)", () => {
    expect(evaluateCondition({ field: "score", operator: "lte", value: 10 }, ctx())).toBe(true);
  });
  it("lte: 9 <= 10 → true (below)", () => {
    expect(evaluateCondition({ field: "score", operator: "lte", value: 11 }, ctx())).toBe(true);
  });
  it("lte: 11 <= 10 → false (above)", () => {
    expect(evaluateCondition({ field: "score", operator: "lte", value: 9 }, ctx())).toBe(false);
  });
  it("gt: 11 > 10 → true", () => {
    expect(evaluateCondition({ field: "age", operator: "gt", value: 24 }, ctx())).toBe(true);
  });
  it("gt: 10 > 10 → false (boundary)", () => {
    expect(evaluateCondition({ field: "score", operator: "gt", value: 10 }, ctx())).toBe(false);
  });
  it("gt: 9 > 10 → false", () => {
    expect(evaluateCondition({ field: "age", operator: "gt", value: 30 }, ctx())).toBe(false);
  });
  it("lt: 9 < 10 → true", () => {
    expect(evaluateCondition({ field: "age", operator: "lt", value: 26 }, ctx())).toBe(true);
  });
  it("lt: 10 < 10 → false (boundary)", () => {
    expect(evaluateCondition({ field: "score", operator: "lt", value: 10 }, ctx())).toBe(false);
  });
  it("lt: 11 < 10 → false", () => {
    expect(evaluateCondition({ field: "age", operator: "lt", value: 24 }, ctx())).toBe(false);
  });
});

describe("evaluateCondition — contains", () => {
  it("string substring: 'Italy' contains 'Ita' → true", () => {
    expect(evaluateCondition({ field: "name", operator: "contains", value: "Ita" }, ctx())).toBe(true);
  });
  it("string substring not present → false", () => {
    expect(evaluateCondition({ field: "name", operator: "contains", value: "xyz" }, ctx())).toBe(false);
  });
  it("array membership: ['work','study'] contains 'work' → true", () => {
    expect(evaluateCondition({ field: "tags", operator: "contains", value: "work" }, ctx())).toBe(true);
  });
  it("array membership absent → false", () => {
    expect(evaluateCondition({ field: "tags", operator: "contains", value: "tourism" }, ctx())).toBe(false);
  });
});

describe("evaluateCondition — edge cases and type robustness", () => {
  it("numeric operators on non-number field → false (no NaN coercion)", () => {
    expect(evaluateCondition({ field: "name", operator: "gte", value: 5 }, ctx())).toBe(false);
    expect(evaluateCondition({ field: "name", operator: "lt", value: 5 }, ctx())).toBe(false);
  });
  it("numeric operator with string expected value → false", () => {
    expect(evaluateCondition({ field: "age", operator: "gt", value: "24" }, ctx())).toBe(false);
  });
  it("numeric operators on null field → false", () => {
    expect(evaluateCondition({ field: "nullValue", operator: "gte", value: 0 }, ctx())).toBe(false);
  });
  it("false does not equal 0", () => {
    expect(evaluateCondition({ field: "flag", operator: "eq", value: 0 }, ctx())).toBe(false);
    expect(evaluateCondition({ field: "zero", operator: "eq", value: false }, ctx())).toBe(false);
  });
  it("does not throw on missing field for non-eq operators", () => {
    expect(() => evaluateCondition({ field: "missing", operator: "gte", value: 1 }, ctx())).not.toThrow();
  });
});

describe("isApplicable — no condition vs condition", () => {
  it("entity without condition → applicable", () => {
    expect(isApplicable({ id: 1 } as any, ctx())).toBe(true);
  });
  it("entity with true condition → applicable", () => {
    expect(isApplicable({ condition: { field: "maritalStatus", operator: "eq", value: "married" } }, ctx())).toBe(true);
  });
  it("entity with false condition → not applicable", () => {
    expect(isApplicable({ condition: { field: "maritalStatus", operator: "eq", value: "single" } }, ctx())).toBe(false);
  });
});

describe("applicableOf — filters a list", () => {
  interface Item extends Conditioned {
    id: string;
  }
  it("keeps only applicable entities", () => {
    const list: Item[] = [
      { id: "a" },
      { id: "b", condition: { field: "maritalStatus", operator: "eq", value: "married" } },
      { id: "c", condition: { field: "maritalStatus", operator: "eq", value: "single" } },
    ];
    expect(applicableOf(list, ctx()).map((e) => e.id)).toEqual(["a", "b"]);
  });
});
