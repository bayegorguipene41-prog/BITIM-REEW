import { describe, it, expect } from "vitest";
import {
  resolveNationalityGroups,
  EU_CODES,
  EEA_CODES,
  BILATERAL_AGREEMENTS,
} from "./nationality-groups";

// ── EU membership ───────────────────────────────────────────────

describe("resolveNationalityGroups — EU countries", () => {
  it("Italy → eu + eea", () => {
    expect(resolveNationalityGroups("IT")).toEqual(expect.arrayContaining(["eu", "eea"]));
  });

  it("France → eu + eea", () => {
    expect(resolveNationalityGroups("FR")).toEqual(expect.arrayContaining(["eu", "eea"]));
  });

  it("Germany → eu + eea", () => {
    expect(resolveNationalityGroups("DE")).toEqual(expect.arrayContaining(["eu", "eea"]));
  });

  it("Spain → eu + eea", () => {
    expect(resolveNationalityGroups("ES")).toEqual(expect.arrayContaining(["eu", "eea"]));
  });

  it("Poland → eu + eea", () => {
    expect(resolveNationalityGroups("PL")).toEqual(expect.arrayContaining(["eu", "eea"]));
  });

  it("all 27 EU codes produce eu + eea", () => {
    for (const code of EU_CODES) {
      const groups = resolveNationalityGroups(code);
      expect(groups).toContain("eu");
      expect(groups).toContain("eea");
    }
  });
});

// ── EEA (non-EU) ────────────────────────────────────────────────

describe("resolveNationalityGroups — EEA non-EU", () => {
  it("Norway → eea (no eu)", () => {
    const groups = resolveNationalityGroups("NO");
    expect(groups).toContain("eea");
    expect(groups).not.toContain("eu");
  });

  it("Iceland → eea (no eu)", () => {
    const groups = resolveNationalityGroups("IS");
    expect(groups).toContain("eea");
    expect(groups).not.toContain("eu");
  });

  it("Liechtenstein → eea (no eu)", () => {
    const groups = resolveNationalityGroups("LI");
    expect(groups).toContain("eea");
    expect(groups).not.toContain("eu");
  });
});

// ── Switzerland ─────────────────────────────────────────────────

describe("resolveNationalityGroups — Switzerland", () => {
  it("CH → ch + eea", () => {
    const groups = resolveNationalityGroups("CH");
    expect(groups).toContain("ch");
    expect(groups).toContain("eea");
  });

  it("CH is not in eu", () => {
    expect(resolveNationalityGroups("CH")).not.toContain("eu");
  });
});

// ── Bilateral agreements (Italy-specific) ───────────────────────

describe("resolveNationalityGroups — bilateral agreements (destination=IT)", () => {
  const itPartners = BILATERAL_AGREEMENTS["IT"];

  it("Morocco → bilateral + bilateral_it-maroc + foreign", () => {
    const groups = resolveNationalityGroups("MA");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-maroc");
    expect(groups).toContain("foreign");
  });

  it("Tunisia → bilateral + bilateral_it-tunisia + foreign", () => {
    const groups = resolveNationalityGroups("TN");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-tunisia");
    expect(groups).toContain("foreign");
  });

  it("Albania → bilateral + bilateral_it-albania + foreign", () => {
    const groups = resolveNationalityGroups("AL");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-albania");
    expect(groups).toContain("foreign");
  });

  it("Egypt → bilateral + bilateral_it-egypt + foreign", () => {
    const groups = resolveNationalityGroups("EG");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-egypt");
    expect(groups).toContain("foreign");
  });

  it("Philippines → bilateral + bilateral_it-philippines + foreign", () => {
    const groups = resolveNationalityGroups("PH");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-philippines");
    expect(groups).toContain("foreign");
  });

  it("Bangladesh → bilateral + bilateral_it-bangladesh + foreign", () => {
    const groups = resolveNationalityGroups("BD");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-bangladesh");
    expect(groups).toContain("foreign");
  });

  it("Pakistan → bilateral + bilateral_it-pakistan + foreign", () => {
    const groups = resolveNationalityGroups("PK");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-pakistan");
    expect(groups).toContain("foreign");
  });

  it("India → bilateral + bilateral_it-india + foreign", () => {
    const groups = resolveNationalityGroups("IN");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-india");
    expect(groups).toContain("foreign");
  });

  it("Ecuador → bilateral + bilateral_it-ecuador + foreign", () => {
    const groups = resolveNationalityGroups("EC");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-ecuador");
    expect(groups).toContain("foreign");
  });

  it("Moldavia → bilateral + bilateral_it-moldova + foreign", () => {
    const groups = resolveNationalityGroups("MD");
    expect(groups).toContain("bilateral");
    expect(groups).toContain("bilateral_it-moldova");
    expect(groups).toContain("foreign");
  });

  it("all IT bilateral partners are in the map", () => {
    for (const partnerCode of Object.keys(itPartners)) {
      const groups = resolveNationalityGroups(partnerCode);
      expect(groups).toContain("bilateral");
      expect(groups).toContain(itPartners[partnerCode]);
    }
  });
});

// ── Generic foreign countries ────────────────────────────────────

describe("resolveNationalityGroups — generic foreign", () => {
  it("China → foreign only", () => {
    expect(resolveNationalityGroups("CN")).toEqual(["foreign"]);
  });

  it("Senegal → foreign only (nessun accordo bilaterale attivo)", () => {
    expect(resolveNationalityGroups("SN")).toEqual(["foreign"]);
  });

  it("Sri Lanka → foreign only (nessun accordo bilaterale attivo)", () => {
    expect(resolveNationalityGroups("LK")).toEqual(["foreign"]);
  });

  it("United States → foreign only", () => {
    expect(resolveNationalityGroups("US")).toEqual(["foreign"]);
  });

  it("Brazil → foreign only", () => {
    expect(resolveNationalityGroups("BR")).toEqual(["foreign"]);
  });

  it("Japan → foreign only", () => {
    expect(resolveNationalityGroups("JP")).toEqual(["foreign"]);
  });

  it("Nigeria → foreign only", () => {
    expect(resolveNationalityGroups("NG")).toEqual(["foreign"]);
  });

  it("Algeria → foreign only (nessun accordo bilaterale attivo)", () => {
    expect(resolveNationalityGroups("DZ")).toEqual(["foreign"]);
  });

  it("Perù → foreign only (nessun accordo bilaterale attivo)", () => {
    expect(resolveNationalityGroups("PE")).toEqual(["foreign"]);
  });

  it("Ucraina → foreign only (nessun accordo bilaterale attivo)", () => {
    expect(resolveNationalityGroups("UA")).toEqual(["foreign"]);
  });

  it("Costa d'Avorio → foreign only (nessun accordo bilaterale attivo)", () => {
    expect(resolveNationalityGroups("CI")).toEqual(["foreign"]);
  });

  it("Ghana → foreign only (nessun accordo bilaterale attivo)", () => {
    expect(resolveNationalityGroups("GH")).toEqual(["foreign"]);
  });

  it("Georgia → foreign only (nessun accordo bilaterale attivo)", () => {
    expect(resolveNationalityGroups("GE")).toEqual(["foreign"]);
  });
});

// ── Edge cases: invalid/missing codes ───────────────────────────

describe("resolveNationalityGroups — edge cases", () => {
  it("empty string → foreign", () => {
    expect(resolveNationalityGroups("")).toEqual(["foreign"]);
  });

  it("undefined → foreign", () => {
    expect(resolveNationalityGroups(undefined as unknown as string)).toEqual(["foreign"]);
  });

  it("null → foreign", () => {
    expect(resolveNationalityGroups(null as unknown as string)).toEqual(["foreign"]);
  });

  it("unknown 2-letter code → foreign", () => {
    expect(resolveNationalityGroups("ZZ")).toEqual(["foreign"]);
  });

  it("3-letter code (not ISO 3166-1 alpha-2) → foreign", () => {
    expect(resolveNationalityGroups("USA")).toEqual(["foreign"]);
  });

  it("lowercase input is normalized to uppercase", () => {
    expect(resolveNationalityGroups("it")).toEqual(expect.arrayContaining(["eu", "eea"]));
    expect(resolveNationalityGroups("fr")).toEqual(expect.arrayContaining(["eu", "eea"]));
    expect(resolveNationalityGroups("ch")).toEqual(expect.arrayContaining(["ch", "eea"]));
  });

  it("input with whitespace is trimmed", () => {
    expect(resolveNationalityGroups(" IT ")).toEqual(expect.arrayContaining(["eu", "eea"]));
  });
});

// ── Integrity: no overlap between EU and bilateral ──────────────

describe("resolveNationalityGroups — structural integrity", () => {
  it("no EU country is also in bilateral IT partners", () => {
    const itPartners = Object.keys(BILATERAL_AGREEMENTS["IT"] || {});
    for (const partner of itPartners) {
      expect(EU_CODES).not.toContain(partner);
    }
  });

  it("all EEA codes resolve to at least eea group", () => {
    for (const code of EEA_CODES) {
      const groups = resolveNationalityGroups(code);
      expect(groups).toContain("eea");
    }
  });
});

// ── Condition engine integration ────────────────────────────────

describe("resolveNationalityGroups — condition engine integration", () => {
  it("nationalityGroup in condition context is an array usable with 'in' operator", () => {
    const groups = resolveNationalityGroups("IT");
    // Simulates: { field: "nationalityGroup", operator: "in", value: ["eu", "eea"] }
    expect(groups).toEqual(expect.arrayContaining(["eu", "eea"]));
  });

  it("nationalityGroup for non-EU is usable with 'not_in' operator", () => {
    const groups = resolveNationalityGroups("IN");
    // Simulates: { field: "nationalityGroup", operator: "not_in", value: ["eu"] }
    expect(groups).not.toContain("eu");
  });
});
