import postgres from "postgres";

// Serverless-safe PostgreSQL connection via the `postgres` (porsager) driver.
// A single connection is created lazily and reused across requests on a
// warm instance. When DATABASE_URL is unset (local/MVP), callers fall back to
// the file store and `getDbSql()` returns null.
//
// DATABASE_URL is read lazily so tests/setup can toggle it per environment.

let sql: postgres.Sql | null = null;

function currentDatabaseUrl(): string | null {
  return process.env.DATABASE_URL?.trim() || null;
}

export function isDatabaseConfigured(): boolean {
  return !!currentDatabaseUrl();
}

export function getDbSql(): postgres.Sql | null {
  const url = currentDatabaseUrl();
  if (!url) return null;
  if (!sql) {
    sql = postgres(url, {
      ssl: "require",
      max: 1, // one connection per instance for serverless/queries
      connect_timeout: 10,
    });
  }
  return sql;
}

// Create the `users` table if it does not already exist (idempotent).
// The UNIQUE(email) constraint is what makes concurrent registration safe.
export async function ensureSchema(): Promise<void> {
  const db = getDbSql();
  if (!db) return;
  await db`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL DEFAULT '',
      email       TEXT NOT NULL UNIQUE,
      salt        TEXT NOT NULL,
      hash        TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
}

// Close the underlying connection (used mainly in tests to release handles).
export async function closeDb(): Promise<void> {
  if (sql) {
    await sql.end({ timeout: 2 }).catch(() => {});
    sql = null;
  }
}