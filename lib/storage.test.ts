import { describe, it, expect, beforeEach } from "vitest";
import {
  setAccountScope,
  getApps,
  upsertApp,
  deleteApp,
  loadWizard,
  saveWizard,
  getSavedProcedureIds,
  isProcedureSaved,
  toggleSavedProcedure,
  type SavedApplication,
} from "./storage";

// Minimal localStorage stub so the client module is testable in node.
function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
}

// Reset to guest scope before each test.
beforeEach(() => {
  (globalThis as any).window = { localStorage: createMemoryStorage() };
  setAccountScope(null);
});

const LEGACY_APP_KEY = "bitimreew.apps.v1";

function app(id: string): SavedApplication {
  return {
    id,
    title: `App ${id}`,
    destination: "IT",
    destinationName: "Italy",
    procedureSlug: "x",
    procedureName: "Residence",
    language: "en",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    docs: [],
  };
}

describe("guest storage (no account scoping)", () => {
  it("stores and retrieves apps", () => {
    upsertApp(app("g1"));
    expect(getApps().map((a) => a.id)).toEqual(["g1"]);
  });

  it("setAccountScope is a no-op (always guest)", () => {
    setAccountScope("account-a-user-id");
    upsertApp(app("A1"));
    expect(getApps().map((a) => a.id)).toEqual(["A1"]);
  });

  it("can edit/delete apps", () => {
    upsertApp(app("x1"));
    upsertApp(app("x2"));
    expect(getApps().map((a) => a.id)).toEqual(["x2", "x1"]);

    deleteApp("x1");
    expect(getApps().map((a) => a.id)).toEqual(["x2"]);
  });

  it("wizard profile is stored and retrieved", () => {
    saveWizard({ destination: "FR", lang: "fr" });
    expect(loadWizard()?.destination).toBe("FR");
  });
});

describe("saved procedures (bookmarks)", () => {
  it("starts empty", () => {
    expect(getSavedProcedureIds()).toEqual([]);
    expect(isProcedureSaved("p1")).toBe(false);
  });

  it("toggle adds then removes an id", () => {
    expect(toggleSavedProcedure("p1")).toEqual(["p1"]);
    expect(isProcedureSaved("p1")).toBe(true);
    expect(toggleSavedProcedure("p1")).toEqual([]);
    expect(isProcedureSaved("p1")).toBe(false);
  });

  it("new saves are unshifted at the front", () => {
    toggleSavedProcedure("p1");
    toggleSavedProcedure("p2");
    expect(getSavedProcedureIds()).toEqual(["p2", "p1"]);
  });

  it("caps the list at 100 entries", () => {
    for (let i = 0; i < 150; i++) toggleSavedProcedure(`bulk-${i}`);
    expect(getSavedProcedureIds()).toHaveLength(100);
  });
});
