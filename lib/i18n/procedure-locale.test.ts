import { describe, it, expect } from "vitest";
import { resolveLocalized } from "./procedure-locale";
import { localize } from "@/lib/data";
import type { LocalizedText } from "@/lib/types";

const sample: LocalizedText = {
  it: "Permesso di soggiorno per lavoro",
  en: "Residence permit for work",
  fr: "Titre de séjour pour travail",
  de: "Aufenthaltstitel für Arbeit",
};

describe("resolveLocalized (contenuti procedura, 7 lingue)", () => {
  it("restituisce la lingua richiesta se presente", () => {
    expect(resolveLocalized(sample, "fr")).toBe("Titre de séjour pour travail");
    expect(resolveLocalized(sample, "de")).toBe("Aufenthaltstitel für Arbeit");
  });

  it("ricade su en quando la lingua richiesta non è compilata", () => {
    expect(resolveLocalized(sample, "es")).toBe("Residence permit for work");
    expect(resolveLocalized(sample, "pt")).toBe("Residence permit for work");
    expect(resolveLocalized(sample, "ar")).toBe("Residence permit for work");
  });

  it("ricade su it come ultimo ripiego se manca en", () => {
    const itOnly: LocalizedText = { it: "Solo italiano", en: "" };
    expect(resolveLocalized(itOnly, "en")).toBe("Solo italiano");
    expect(resolveLocalized(itOnly, "fr")).toBe("Solo italiano");
  });

  it("supporta slot parziali per le 5 lingue extra senza rompere it/en", () => {
    const base: LocalizedText = { it: "X", en: "Y" };
    expect(resolveLocalized(base, "it")).toBe("X");
    expect(resolveLocalized(base, "en")).toBe("Y");
  });

  it("normalizza la lingua richiesta (minuscolo)", () => {
    expect(resolveLocalized(sample, "DE")).toBe("Aufenthaltstitel für Arbeit");
  });

  it("gestisce input undefined/vuoto", () => {
    expect(resolveLocalized(undefined, "en")).toBe("");
    expect(resolveLocalized({ it: "", en: "" }, "en")).toBe("");
  });

  it("localize() delega al resolver (backward-compat)", () => {
    expect(localize(sample, "it")).toBe("Permesso di soggiorno per lavoro");
    expect(localize(sample, "fr")).toBe("Titre de séjour pour travail");
    expect(localize(sample, "zz")).toBe("Residence permit for work");
  });
});