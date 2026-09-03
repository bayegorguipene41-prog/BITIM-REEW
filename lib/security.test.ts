import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isTrustedOrigin,
  isTrustedHost,
  parseAllowedOrigins,
  contentLengthTooLarge,
  readBodyWithLimit,
  MAX_BODY_BYTES,
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