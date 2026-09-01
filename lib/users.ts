import { promises as fs } from "fs";
import path from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { isDatabaseConfigured, getDbSql, ensureSchema } from "@/lib/db";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: number;
};

// Test-friendly: BITIM_DATA_DIR overrides the data directory (defaults to .data).
// Computed lazily so an env override set in tests takes effect per call.
function dataDir(): string {
  return path.resolve(process.env.BITIM_DATA_DIR || path.join(process.cwd(), ".data"));
}

const EMAIL_TAKEN = "An account with this email already exists.";

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

// ---------------------------------------------------------------------------
// Local/MVP file fallback (only used when DATABASE_URL is NOT set).
// NOT serverless-safe; single instance only.
// ---------------------------------------------------------------------------

async function readUsers(): Promise<StoredUser[]> {
  const USERS_FILE = path.join(dataDir(), "users.json");
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  const USERS_FILE = path.join(dataDir(), "users.json");
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Public API. Behavior is identical whether backed by Postgres or the file.
// ---------------------------------------------------------------------------

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user?: StoredUser; error?: string }> {
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password.length > 128) {
    return { error: "Password is too long." };
  }
  const { salt, hash } = hashPassword(password);
  const user: StoredUser = {
    id: randomBytes(8).toString("hex"),
    name: String(input.name || "").trim().slice(0, 80) || email.split("@")[0],
    email,
    salt,
    hash,
    createdAt: Date.now(),
  };

  if (isDatabaseConfigured()) {
    const db = getDbSql()!;
    await ensureSchema();
    try {
      await db`
        INSERT INTO users (id, name, email, salt, hash, created_at)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${user.salt}, ${user.hash}, to_timestamp(${user.createdAt} / 1000.0))
      `;
      return { user };
    } catch (err: unknown) {
      // Unique violation (SQLSTATE 23505) => another user has this email.
      const code = (err as { code?: string })?.code;
      if (code === "23505") return { error: EMAIL_TAKEN };
      throw err;
    }
  }

  // File fallback (MVP, single instance).
  const users = await readUsers();
  if (users.some((u) => u.email === email)) {
    return { error: EMAIL_TAKEN };
  }
  users.push(user);
  await writeUsers(users);
  return { user };
}

export async function verifyUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !password) return null;

  if (isDatabaseConfigured()) {
    const db = getDbSql()!;
    await ensureSchema();
    const rows = await db<Pick<StoredUser, "id" | "name" | "email" | "salt" | "hash" | "createdAt">[]>`
      SELECT id, name, email, salt, hash, created_at AS "createdAt"
      FROM users
      WHERE email = ${normalized}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    if (!verifyPassword(String(password), row.salt, row.hash)) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      salt: row.salt,
      hash: row.hash,
      createdAt: Number(row.createdAt),
    };
  }

  const users = await readUsers();
  const user = users.find((u) => u.email === normalized);
  if (!user) return null;
  if (!verifyPassword(String(password), user.salt, user.hash)) return null;
  return user;
}