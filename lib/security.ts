// ==========================================
// SECURITY HELPERS (pure, unit-testable)
// ==========================================

import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const WINDOW_MS = 60 * 1000; // 1 minute

// Defaults tuned for the MVP (generous to avoid breaking normal use).
const REGISTER_LIMIT = 5; // 5 registrations / min / IP
const LOGIN_LIMIT = 10; // 10 credentials sign-in attempts / min / IP
const ASSESS_LIMIT = 60; // 60 assessment calls / min / IP (public, unauthenticated)

/**
 * Rate-limit decision returned by every store backend.
 */
export type RateLimitDecision = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

// ---------------------------------------------------------------------------
// In-memory fixed-window store (single-instance).
// Used when no Upstash Redis is configured. Bounded to avoid memory exhaustion.
// ---------------------------------------------------------------------------

type WindowState = { count: number; resetAt: number };

const MEMORY_CAP = 10_000; // max tracked IP buckets per limiter

class MemoryRateLimitStore {
  private buckets = new Map<string, WindowState>();
  private readonly max: number;
  private readonly windowMs: number;

  constructor(max: number, windowMs: number = WINDOW_MS) {
    this.max = max;
    this.windowMs = windowMs;
  }

  private prune(now: number) {
    for (const [key, state] of this.buckets) {
      if (state.resetAt <= now) this.buckets.delete(key);
    }
    // Bound memory: if we exceed the cap, evict oldest expired entries, then the
    // least-recently-seen, so a flood of distinct keys cannot exhaust process RAM.
    while (this.buckets.size > MEMORY_CAP) {
      const oldest = this.buckets.entries().next();
      if (oldest.done) break;
      this.buckets.delete(oldest.value[0]);
    }
  }

  /** Memory backend ignores `max`/`windowMs` params (its own apply). */
  check(key: string): RateLimitDecision {
    this.prune(Date.now());
    const now = Date.now();
    const current = this.buckets.get(key);

    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { ok: true, remaining: this.max - 1, retryAfterSeconds: 0 };
    }

    if (current.count >= this.max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000)
      );
      return { ok: false, remaining: 0, retryAfterSeconds };
    }

    current.count += 1;
    return {
      ok: true,
      remaining: this.max - current.count,
      retryAfterSeconds: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Upstash Redis store (serverless-safe, shared across instances).
// ---------------------------------------------------------------------------

let cachedUpstashRatelimit: Ratelimit | null = null;

function upstashConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return !!(url && token);
}

/**
 * Picks a fixed-window limit striategy backed by Upstash REST Redis, lazily.
 * The prefix routes each route's keys into its own namespace.
 */
function getUpstashRatelimit(prefix: string): Ratelimit {
  if (!cachedUpstashRatelimit) {
    const redis = Redis.fromEnv();
    cachedUpstashRatelimit = new Ratelimit({
      redis,
      prefix: "bitim-rl",
      limiter: Ratelimit.fixedWindow(1, "1 m"),
      analytics: false,
    });
  }
  return cachedUpstashRatelimit;
}

class UpstashRateLimitStore {
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  async check(key: string): Promise<RateLimitDecision> {
    const rl = getUpstashRatelimit(this.prefix);
    const res = await rl.limit(key);
    return {
      ok: res.success,
      remaining: res.remaining,
      retryAfterSeconds: res.reset > 0
        ? Math.max(1, Math.ceil((res.reset * 1000 - Date.now()) / 1000))
        : 1,
    };
  }
}

// ---------------------------------------------------------------------------
// Key derivation: fixed-size SHA-256 of the input. This (a) bounds key length,
// (b) prevents header-injection via weird IP strings, and (c) keeps lookups
// constant-size for both in-memory and Redis keys.
// ---------------------------------------------------------------------------

function rateLimitKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/**
 * A hardened client key derived ONLY from the trusted `x-forwarded-for` header
 * (set by the hosting platform/reverse proxy), using the rightmost address
 * appended by the nearest trusted proxy. Client-supplied `x-real-ip` /
 * `cf-connecting-ip` are NOT trusted because an attacker can spoof them to
 * rotate an arbitrary identity and bypass the limiter.
 */
export function stableClientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    const resolved = parts[parts.length - 1] || "unknown";
    return resolved.length > 128 ? "unknown" : resolved;
  }
  return "unknown";
}

// ---------------------------------------------------------------------------
// Active store selection + route facades.
// ---------------------------------------------------------------------------

type RateLimitMode = "memory" | "upstash";

export function activeRateLimitMode(): RateLimitMode {
  return upstashConfigured() ? "upstash" : "memory";
}

type ActiveRateLimitStore = MemoryRateLimitStore | UpstashRateLimitStore;

const limiterCache = new Map<string, ActiveRateLimitStore>();

function limiterFor(route: string, max: number): ActiveRateLimitStore {
  const cached = limiterCache.get(route);
  if (cached) return cached;
  const store: ActiveRateLimitStore =
    activeRateLimitMode() === "upstash"
      ? new UpstashRateLimitStore(route)
      : new MemoryRateLimitStore(max);
  limiterCache.set(route, store);
  return store;
}

/**
 * Checks + increments the counter for `route` from `rawKey`.
 * Returns a normalized decision regardless of backend.
 */
export async function rateLimit(
  route: "login" | "register" | "assess",
  rawKey: string
): Promise<RateLimitDecision> {
  const limits: Record<typeof route, number> = {
    login: LOGIN_LIMIT,
    register: REGISTER_LIMIT,
    assess: ASSESS_LIMIT,
  };
  const store = limiterFor(route, limits[route]);
  const key = `${route}:${rateLimitKey(rawKey)}`;

  if (activeRateLimitMode() === "upstash") {
    return (store as UpstashRateLimitStore).check(key);
  }

  // In-memory branch.
  if (process.env.NODE_ENV === "production") {
    // Never pretend this single-instance limiter is a real production limiter.
    // Emit one clear warning so operators are unmistakably informed, then keep
    // best-effort in-memory protection rather than silently succeeding.
    if (!(globalThis as { __bitimRlWarned?: boolean }).__bitimRlWarned) {
      (globalThis as { __bitimRlWarned?: boolean }).__bitimRlWarned = true;
      console.warn(
        "[security] Production/build is running WITHOUT a distributed rate-limit store " +
          "(UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set). Falling back to " +
          "single-instance in-memory rate limiting, which is NOT safe across Vercel/serverless " +
          "instances. Configure Upstash Redis before production traffic."
      );
    }
  }
  return (store as MemoryRateLimitStore).check(key);
}

// Synchronous in-memory facades. These power the in-memory (local/MVP) path and
// are what the existing rate-limit unit tests exercise. Production routes use
// the async `rateLimit()` above so they can share an Upstash Redis store.
//
// A shared singleton per route keeps counters persistent across calls within a
// single process (single-instance semantics, matching the original design).
const memoryLoginLimiter = new MemoryRateLimitStore(LOGIN_LIMIT);
const memoryRegisterLimiter = new MemoryRateLimitStore(REGISTER_LIMIT);

export function loginRateLimited(ip: string): RateLimitDecision {
  return memoryLoginLimiter.check(`login:${rateLimitKey(ip ?? "unknown")}`);
}

export function registerRateLimited(ip: string): RateLimitDecision {
  return memoryRegisterLimiter.check(`register:${rateLimitKey(ip ?? "unknown")}`);
}

export async function assessRateLimited(ip: string): Promise<RateLimitDecision> {
  return rateLimit("assess", ip ?? "unknown");
}

// ---------------------------------------------------------------------------
// Host / origin allowlist
// ---------------------------------------------------------------------------

const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

function stripPort(host: string): string {
  // host may be "localhost:3000", "127.0.0.1:3000", "[::1]:3000" or just "host"
  const bracket = host.startsWith("[");
  if (bracket) {
    const end = host.indexOf("]");
    return host.slice(0, end + 1).toLowerCase(); // "[::1]"
  }
  const idx = host.indexOf(":");
  return idx === -1 ? host.toLowerCase() : host.slice(0, idx).toLowerCase();
}

/**
 * Parse the AUTH_ALLOWED_ORIGINS env variable (comma separated) into a list
 * of normalized origins ("scheme://host[:port]"). Values are lower-cased for
 * host and scheme; trailing slashes stripped.
 */
export function parseAllowedOrigins(): string[] {
  const raw = process.env.AUTH_ALLOWED_ORIGINS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, "").toLowerCase());
}

/**
 * True when `host` (hostname[:port]) is a local development host (loopback)
 * or matches an origin in AUTH_ALLOWED_ORIGINS.
 */
export function isTrustedHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const trimmed = host.trim();
  const hostname = stripPort(trimmed);

  if (LOCALHOST_HOSTNAMES.has(hostname)) return true;

  const allowedOrigins = parseAllowedOrigins();
  for (const origin of allowedOrigins) {
    const originHost = origin.replace(/^[a-z]+:\/\//, "");
    if (!originHost) continue;
    // Match the trusted origin's hostname regardless of a port suffix, so
    // "bitim-reew.example.com" and "bitim-reew.example.com:443" both resolve
    // to the same trusted origin.
    if (stripPort(originHost) === hostname) return true;
  }
  return false;
}

/**
 * True when an origin made of `proto://host` is trusted.
 * proto must be http/https.
 */
export function isTrustedOrigin(proto: string | null | undefined, host: string | null | undefined): boolean {
  if (!proto || !host) return false;
  const scheme = proto.split(":")[0].toLowerCase();
  if (scheme !== "http" && scheme !== "https") return false;
  const trimmedHost = host.trim();
  if (LOCALHOST_HOSTNAMES.has(stripPort(trimmedHost))) return true;
  return isTrustedHost(trimmedHost);
}

// ---------------------------------------------------------------------------
// Payload guard
// ---------------------------------------------------------------------------

/** Upper bound for accepted JSON bodies (bytes). */
export const MAX_BODY_BYTES = 256 * 1024; // 256 KB

/** JWT session lifetime in seconds (7 days), capped below the 30-day default. */
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * Cheap pre-check using Content-Length header when present.
 * Returns true when the declared length exceeds MAX_BODY_BYTES.
 */
export function contentLengthTooLarge(contentLength: string | null): boolean {
  if (!contentLength) return false;
  const n = Number.parseInt(contentLength, 10);
  if (Number.isNaN(n) || n < 0) return false;
  return n > MAX_BODY_BYTES;
}

/**
 * Reads `req` body as text, enforcing a hard byte cap so a malicious or
 * oversized payload cannot be buffered into memory.
 *
 * Returns a discriminated result:
 *  - `{ state: "ok", text }` when the body was read successfully.
 *  - `{ state: "too_large", status: 413 }` when the payload exceeds MAX_BODY_BYTES.
 *  - `{ state: "invalid", status: 400 }` when the body cannot be read.
 */
export async function readBodyWithLimit(
  req: Request
): Promise<
  | { state: "ok"; text: string }
  | { state: "too_large"; status: 413 }
  | { state: "invalid"; status: 400 }
> {
  const declared = contentLengthTooLarge(req.headers.get("content-length"));
  if (declared) return { state: "too_large", status: 413 };

  if (!req.body) return { state: "ok", text: "" };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  const decoder = new TextDecoder();

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > MAX_BODY_BYTES) {
          await reader.cancel();
          return { state: "too_large", status: 413 };
        }
        chunks.push(value);
      }
    }
  } catch {
    return { state: "invalid", status: 400 };
  }

  return { state: "ok", text: decoder.decode(Buffer.concat(chunks)) };
}

/** Best-effort client IP from the standard proxy headers. Never logs the body. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0].trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}