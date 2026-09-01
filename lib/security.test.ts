import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isTrustedOrigin,
  isTrustedHost,
  parseAllowedOrigins,
  contentLengthTooLarge,
  readBodyWithLimit,
  MAX_BODY_BYTES,
  registerRateLimited,
  loginRateLimited,
  SESSION_MAX_AGE,
  clientIp,
} from "./security";

const ORIGINAL_ALLOWED = process.env.AUTH_ALLOWED_ORIGINS;

function setAllowedOrigins(value: string | undefined) {
  if (value === undefined) delete process.env.AUTH_ALLOWED_ORIGINS;
  else process.env.AUTH_ALLOWED_ORIGINS = value;
}

beforeEach(() => {
  if (ORIGINAL_ALLOWED === undefined) delete process.env.AUTH_ALLOWED_ORIGINS;
  else process.env.AUTH_ALLOWED_ORIGINS = ORIGINAL_ALLOWED;
});

afterEach(() => {
  if (ORIGINAL_ALLOWED === undefined) delete process.env.AUTH_ALLOWED_ORIGINS;
  else process.env.AUTH_ALLOWED_ORIGINS = ORIGINAL_ALLOWED;
});

describe("isTrustedHost / isTrustedOrigin", () => {
  it("allows localhost with any port", () => {
    expect(isTrustedHost("localhost")).toBe(true);
    expect(isTrustedHost("localhost:3000")).toBe(true);
    expect(isTrustedHost("127.0.0.1:3000")).toBe(true);
    expect(isTrustedHost("[::1]:3000")).toBe(true);
  });

  it("allows production origin from AUTH_ALLOWED_ORIGINS", () => {
    setAllowedOrigins("https://bitim-reew.example.com");
    expect(isTrustedHost("bitim-reew.example.com")).toBe(true);
    expect(isTrustedHost("bitim-reew.example.com:443")).toBe(true);
    expect(isTrustedOrigin("https", "bitim-reew.example.com")).toBe(true);
  });

  it("rejects unknown / attacker-controlled hosts", () => {
    expect(isTrustedHost("evil.com")).toBe(false);
    expect(isTrustedHost("bitim-reew.evil.com")).toBe(false);
    expect(isTrustedHost(null)).toBe(false);
    expect(isTrustedHost("")).toBe(false);
  });

  it("rejects non-http schemes", () => {
    expect(isTrustedOrigin("javascript", "localhost")).toBe(false);
    expect(isTrustedOrigin("file", "localhost")).toBe(false);
    expect(isTrustedOrigin(null, "localhost")).toBe(false);
  });
});

describe("parseAllowedOrigins", () => {
  it("parses comma-separated values and normalizes", () => {
    setAllowedOrigins(" https://A.example.com ,http://b.example.com/ ");
    const origins = parseAllowedOrigins();
    expect(origins).toContain("https://a.example.com");
    expect(origins).toContain("http://b.example.com");
  });

  it("returns empty when unset", () => {
    expect(parseAllowedOrigins()).toEqual([]);
  });
});

describe("payload guard", () => {
  it("flags oversized Content-Length", () => {
    expect(contentLengthTooLarge(String(MAX_BODY_BYTES + 1))).toBe(true);
    expect(contentLengthTooLarge(String(MAX_BODY_BYTES))).toBe(false);
    expect(contentLengthTooLarge(null)).toBe(false);
  });

  it("rejects a body larger than the limit with 413", async () => {
    const big = new Request("http://localhost:3000/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: "x".repeat(MAX_BODY_BYTES + 1024) }),
    });
    const res = await readBodyWithLimit(big);
    if (res.state === "ok") throw new Error("expected oversized body to be rejected");
    expect(res.status).toBe(413);
  });

  it("accepts a normal body within the limit", async () => {
    const okBody = new Request("http://localhost:3000/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hello: "world", n: 42 }),
    });
    const res = await readBodyWithLimit(okBody);
    if (res.state !== "ok") throw new Error("expected ok");
    expect(JSON.parse(res.text)).toEqual({ hello: "world", n: 42 });
  });

  it("rejects with 413 via Content-Length before reading", async () => {
    const req = new Request("http://localhost:3000/", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": String(MAX_BODY_BYTES + 1) },
      body: "{}",
    });
    const res = await readBodyWithLimit(req);
    if (res.state === "ok") throw new Error("expected Content-Length rejection");
    expect(res.status).toBe(413);
  });
});

describe("rate limiting", () => {
  it("allows normal attempts then rejects with retry-after", () => {
    // register limiter: 5/min
    let last: ReturnType<typeof registerRateLimited>;
    for (let i = 0; i < 5; i++) {
      last = registerRateLimited("1.2.3.4");
      expect(last.ok).toBe(true);
    }
    const blocked = registerRateLimited("1.2.3.4");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    // different IP is not affected
    expect(registerRateLimited("9.9.9.9").ok).toBe(true);
  });

  it("login limiter rejects after threshold", () => {
    for (let i = 0; i < 10; i++) expect(loginRateLimited("5.6.7.8").ok).toBe(true);
    expect(loginRateLimited("5.6.7.8").ok).toBe(false);
  });
});

describe("clientIp", () => {
  it("uses first x-forwarded-for value", () => {
    const req = new Request("http://localhost:3000/", {
      headers: { "x-forwarded-for": "10.0.0.1, 10.0.0.2" },
    });
    expect(clientIp(req)).toBe("10.0.0.1");
  });

  it("falls back to x-real-ip then unknown", () => {
    expect(
      clientIp(new Request("http://localhost:3000/", { headers: { "x-real-ip": "172.16.0.9" } }))
    ).toBe("172.16.0.9");
    expect(clientIp(new Request("http://localhost:3000/"))).toBe("unknown");
  });
});

describe("SESSION_MAX_AGE", () => {
  it("is between 1 and 7 days inclusive", () => {
    const days = SESSION_MAX_AGE / 86400;
    expect(days).toBeGreaterThanOrEqual(1);
    expect(days).toBeLessThanOrEqual(7);
    expect(SESSION_MAX_AGE).toBe(7 * 24 * 60 * 60);
  });
});