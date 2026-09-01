import { describe, it, expect, afterEach } from "vitest";
import {
  activeRateLimitMode,
  rateLimit,
  stableClientKey,
  RateLimitDecision,
} from "./security";

const ORIGINAL_URL = process.env.UPSTASH_REDIS_REST_URL;
const ORIGINAL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function setRedisEnv(url?: string, token?: string) {
  if (url === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = url;
  if (token === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = token;
}

afterEach(() => {
  if (ORIGINAL_URL === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = ORIGINAL_URL;
  if (ORIGINAL_TOKEN === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = ORIGINAL_TOKEN;
});

describe("activeRateLimitMode", () => {
  it("returns memory when Upstash env is absent", () => {
    setRedisEnv();
    expect(activeRateLimitMode()).toBe("memory");
  });

  it("returns upstash when both env vars are set", () => {
    setRedisEnv("https://instance.upstash.io", "token");
    expect(activeRateLimitMode()).toBe("upstash");
  });

  it("stays memory when only one var is set", () => {
    setRedisEnv("https://instance.upstash.io", undefined);
    expect(activeRateLimitMode()).toBe("memory");
  });
});

describe("stableClientKey (hardened IP resolution)", () => {
  it("uses the rightmost x-forwarded-for value (nearest trusted proxy)", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "203.0.113.5, 198.51.100.7" },
    });
    expect(stableClientKey(req)).toBe("198.51.100.7");
  });

  it("does NOT trust client-spoofable x-real-ip / cf-connecting-ip", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-real-ip": "1.2.3.4", "cf-connecting-ip": "5.6.7.8" },
    });
    // No x-forwarded-for present → key is the safe "unknown", ignoring spoofable headers.
    expect(stableClientKey(req)).toBe("unknown");
  });

  it("returns unknown when no proxy header is present", () => {
    expect(stableClientKey(new Request("http://localhost/"))).toBe("unknown");
  });

  it("caps over-long forwarded values to avoid key abuse", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "x".repeat(500) },
    });
    expect(stableClientKey(req)).toBe("unknown");
  });
});

describe("rateLimit in-memory backend", () => {
  it("register: allows 5/min/key then rejects with Retry-After", async () => {
    setRedisEnv();
    let last: RateLimitDecision;
    for (let i = 0; i < 5; i++) {
      last = await rateLimit("register", "10.0.0.1");
      expect(last.ok).toBe(true);
    }
    const blocked = await rateLimit("register", "10.0.0.1");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    // A different client key is not affected.
    expect((await rateLimit("register", "10.0.0.2")).ok).toBe(true);
  });

  it("login: allows 10/min/key then rejects", async () => {
    setRedisEnv();
    for (let i = 0; i < 10; i++) {
      expect((await rateLimit("login", "10.1.1.1")).ok).toBe(true);
    }
    expect((await rateLimit("login", "10.1.1.1")).ok).toBe(false);
  });

  it("assess: uses a generous 60/min/key limit", async () => {
    setRedisEnv();
    for (let i = 0; i < 60; i++) {
      expect((await rateLimit("assess", "10.2.2.2")).ok).toBe(true);
    }
    expect((await rateLimit("assess", "10.2.2.2")).ok).toBe(false);
  });

  it("keys are hashed so different routes/IPs never collide", async () => {
    setRedisEnv();
    // Register bucket full for IP 10.3.3.3
    for (let i = 0; i < 5; i++) await rateLimit("register", "10.3.3.3");
    // Login on the SAME ip has a separate namespace and is still allowed.
    expect((await rateLimit("login", "10.3.3.3")).ok).toBe(true);
    // A different IP can still register.
    expect((await rateLimit("register", "10.3.3.4")).ok).toBe(true);
  });
});