import { describe, it, expect, beforeEach } from "vitest";
import {
  setAccountScope,
  getApps,
  upsertApp,
  deleteApp,
  loadWizard,
  saveWizard,
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

// Preserve the module-level scope state across tests: reset to guest first.
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

describe("account storage isolation", () => {
  it("guest sees legacy/plain data", () => {
    upsertApp(app("g1"));
    expect(getApps().map((a) => a.id)).toEqual(["g1"]);
  });

  it("two accounts never see each other's apps", () => {
    // Write as Account A
    setAccountScope("account-a-user-id");
    upsertApp(app("A1"));
    expect(getApps().map((a) => a.id)).toEqual(["A1"]);

    // Switch to Account B — must NOT see A's app
    setAccountScope("account-b-user-id");
    expect(getApps().map((a) => a.id)).toEqual([]);

    // B writes its own
    upsertApp(app("B1"));
    expect(getApps().map((a) => a.id)).toEqual(["B1"]);
  });

  it("guest data is not attributed to a signed-in account (no legacy fallback leak)", () => {
    // Guest saves an app on the plain key
    setAccountScope(null);
    upsertApp(app("guest1"));

    // A logs in: must NOT inherit the guest app via legacy fallback
    setAccountScope("account-a-user-id");
    expect(getApps().map((a) => a.id)).toEqual([]);
  });

  it("account can edit/delete only its own apps", () => {
    setAccountScope("acct-x");
    upsertApp(app("x1"));
    upsertApp(app("x2"));
    expect(getApps().map((a) => a.id)).toEqual(["x2", "x1"]);

    deleteApp("x1");
    expect(getApps().map((a) => a.id)).toEqual(["x2"]);

    // Another account unaffected
    setAccountScope("acct-y");
    expect(getApps().map((a) => a.id)).toEqual([]);
  });

  it("re-login of the same account returns its apps", () => {
    setAccountScope("acct-z");
    upsertApp(app("z1"));
    setAccountScope(null); // logout
    expect(getApps().map((a) => a.id)).toEqual([]);
    setAccountScope("acct-z"); // login again
    expect(getApps().map((a) => a.id)).toEqual(["z1"]);
  });

  it("wizard profile is isolated per account", () => {
    setAccountScope("acct-1");
    saveWizard({ destination: "FR", lang: "fr" });
    expect(loadWizard()?.destination).toBe("FR");

    setAccountScope("acct-2");
    expect(loadWizard()).toBeNull();
  });
});