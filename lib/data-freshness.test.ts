import { describe, it, expect, afterEach } from "vitest";
import { isProcedureStale, MAX_FRESH_MONTHS, __setNow } from "./data-freshness";
import type { Procedure } from "./types";

// Fissa l'orologio a una data nota locale → rende il calcolo deterministico e
// immune a fuso/ora della macchina.
const REFERENCE = new Date(2026, 8, 2); // 2026-09-02 locale

function parse(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)!;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function ago(months: number): string {
  const d = new Date(REFERENCE);
  d.setMonth(d.getMonth() - months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function procFrom(months: number): Pick<Procedure, "sources"> {
  return { sources: [{ id: "s1", name: "Fonte", authority: "Autorità", url: "", confidence: "high" as const, lastVerifiedAt: ago(months) }] };
}

describe("isProcedureStale (orologio fissato a 2026-09-02)", () => {
  afterEach(() => __setNow(undefined));

  it("fresh source (< 12 mesi) → non stale", () => {
    __setNow(REFERENCE);
    expect(isProcedureStale(procFrom(2))).toBe(false);
    expect(isProcedureStale(procFrom(11))).toBe(false);
    expect(isProcedureStale(procFrom(MAX_FRESH_MONTHS))).toBe(false);
  });

  it("fonte più vecchia di 12 mesi → stale", () => {
    __setNow(REFERENCE);
    expect(isProcedureStale(procFrom(13))).toBe(true);
    expect(isProcedureStale(procFrom(40))).toBe(true);
  });

  it("usa la fonte più recente, non la prima", () => {
    __setNow(REFERENCE);
    const p = {
      sources: [
        { id: "a", name: "vecchia", authority: "X", url: "", confidence: "low" as const, lastVerifiedAt: ago(30) },
        { id: "b", name: "nuova", authority: "Y", url: "", confidence: "high" as const, lastVerifiedAt: ago(3) },
      ],
    };
    expect(isProcedureStale(p)).toBe(false);
  });

  it("fonti assenti → non stale (nessun dato su cui giudicare)", () => {
    __setNow(REFERENCE);
    expect(isProcedureStale({ sources: [] })).toBe(false);
  });

  it("lastVerifiedAt mancante o non valido → non stale", () => {
    __setNow(REFERENCE);
    expect(isProcedureStale({ sources: [{ id: "s", name: "x", authority: "y", url: "", confidence: "high", lastVerifiedAt: "" }] })).toBe(false);
    expect(isProcedureStale({ sources: [{ id: "s", name: "x", authority: "y", url: "", confidence: "high", lastVerifiedAt: "non-data" }] })).toBe(false);
  });

  it("fissa la data via lastVerifiedAt stringa nel formato corretto", () => {
    __setNow(REFERENCE);
    expect(parse("2025-09-02")).toEqual(new Date(2025, 8, 2));
  });
});