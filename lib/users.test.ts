import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { createUser, verifyUser } from "./users";

// Tests the local/MVP file fallback path (DATABASE_URL unset) and confirms the
// Postgres branch is selected when DATABASE_URL is present (without a live DB,
// we only assert routing, not a real round-trip).

const TMP = mkdtempSync(path.join(tmpdir(), "bitim-users-test-"));
const ORIGINAL_DATA_DIR = process.env.BITIM_DATA_DIR;
const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

beforeAll(() => {
  process.env.BITIM_DATA_DIR = "FIXTURE_OVERRIDE"; // replaced below via created tmp dir
  // Ensure the file fallback path is exercised.
  delete process.env.DATABASE_URL;
});

afterAll(() => {
  rmSync(TMP, { recursive: true, force: true });
  if (ORIGINAL_DATA_DIR === undefined) delete process.env.BITIM_DATA_DIR;
  else process.env.BITIM_DATA_DIR = ORIGINAL_DATA_DIR;
  if (ORIGINAL_DATABASE_URL === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
});

describe("file fallback user store", () => {
  it("creates a user and verifies credentials", async () => {
    // Point the file store into the temp dir so real .data is untouched.
    process.env.BITIM_DATA_DIR = path.join(TMP, "data");
    const { user, error } = await createUser({
      name: "Aria",
      email: "Aria@Example.com",
      password: "supersecret1",
    });
    expect(error).toBeUndefined();
    expect(user).toBeDefined();
    expect(user!.email).toBe("aria@example.com"); // normalized lowercase
    expect(existsSync(path.join(TMP, "data", "users.json"))).toBe(true);

    const ok = await verifyUser("aria@example.com", "supersecret1");
    expect(ok).not.toBeNull();
    expect(ok!.name).toBe("Aria");
    expect(ok!.email).toBe("aria@example.com");

    const bad = await verifyUser("aria@example.com", "wrongpass1");
    expect(bad).toBeNull();
  });

  it("rejects duplicate email on the fallback store", async () => {
    process.env.BITIM_DATA_DIR = path.join(TMP, "data2");
    await createUser({ name: "A", email: "dup@example.com", password: "password1" });
    const again = await createUser({ name: "B", email: "dup@example.com", password: "password2" });
    expect(again.error).toBe("An account with this email already exists.");
    expect(again.user).toBeUndefined();
  });
});

describe("Postgres routing", () => {
  it("routes to the DB branch when DATABASE_URL is set (no file write)", async () => {
    // An obviously-invalid connection string forces the DB branch to be taken.
    // We only assert that createUser does NOT silently succeed on the file store:
    // if it were falling through, it would write to BITIM_DATA_DIR and return a user.
    const dbDir = path.join(TMP, "db-routing");
    process.env.BITIM_DATA_DIR = dbDir;
    process.env.DATABASE_URL = "postgres://invalid:nope@127.0.0.1:1/bitim";
    let threw = false;
    try {
      await createUser({ name: "R", email: "route@example.com", password: "password1" });
    } catch {
      threw = true;
    }
    // A real connection failure (or 500) is acceptable here; what must NOT happen
    // is a successful local file write for this user.
    const fs = await import("fs");
    const { existsSync } = fs as typeof import("fs");
    expect(threw).toBe(true);
    expect(existsSync(path.join(dbDir, "users.json"))).toBe(false);
    delete process.env.DATABASE_URL;
  });
});