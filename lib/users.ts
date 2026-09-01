import { promises as fs } from "fs";
import path from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: number;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user?: StoredUser; error?: string }> {
  const email = String(input.email || "").trim().toLowerCase();
  if (!email || !input.password) return { error: "Email and password are required." };
  if (String(input.password).length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  const users = await readUsers();
  if (users.some((u) => u.email === email)) {
    return { error: "An account with this email already exists." };
  }
  const { salt, hash } = hashPassword(String(input.password));
  const user: StoredUser = {
    id: randomBytes(8).toString("hex"),
    name: String(input.name || "").trim() || email.split("@")[0],
    email,
    salt,
    hash,
    createdAt: Date.now(),
  };
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
  const users = await readUsers();
  const user = users.find((u) => u.email === normalized);
  if (!user) return null;
  if (!verifyPassword(String(password), user.salt, user.hash)) return null;
  return user;
}
