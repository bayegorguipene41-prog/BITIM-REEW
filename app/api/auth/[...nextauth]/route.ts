import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/auth";
import {
  stableClientKey,
  isTrustedOrigin,
  rateLimit,
} from "@/lib/security";

/**
 * Resolves the effective origin from proxy headers and validates it against
 * the allowed-origins allowlist. Offending/malicious hosts are rejected rather
 * than implicitly trusted.
 */
function trustedRequest(req: NextRequest): NextRequest | null {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ?? (req.nextUrl.protocol === "https:" ? "https" : "http");

  // Never trust an origin we do not recognize.
  if (!isTrustedOrigin(proto, host)) return null;

  // Normalize the internal request URL to the trusted host so Auth.js builds
  // callback/signin/redirect URLs against the host the client actually used.
  try {
    const target = new URL(req.url);
    target.host = host as string;
    target.protocol = proto.endsWith(":") ? proto : `${proto}:`;
    if (target.href !== req.url) {
      return new NextRequest(target, req);
    }
  } catch {
    return req;
  }
  return req;
}

/** Whether the POSTed form-data is a credentials sign-in attempt. */
function isCredentialsSignIn(bodyText: string): boolean {
  return (
    bodyText.includes("provider=credentials") &&
    bodyText.includes("action=signIn")
  );
}

function assertOAuthConfig() {
  const id = process.env.AUTH_GOOGLE_ID;
  const secret = process.env.AUTH_GOOGLE_SECRET;
  const missing =
    !id || id.startsWith("REPLACE") || !secret || secret.startsWith("REPLACE");
  if (missing && process.env.NODE_ENV !== "production") {
    console.warn(
      "[auth] Google OAuth not configured: AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are missing or still placeholders. " +
        "The Google provider is disabled; credentials login still works. Set real values in .env.local to enable it."
    );
  }
}

function tooManyRequests(decision: { retryAfterSeconds: number }) {
  return NextResponse.json(
    { error: "Too many attempts. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, decision.retryAfterSeconds)) },
    }
  );
}

export const GET = (req: NextRequest) => {
  const trusted = trustedRequest(req);
  if (!trusted) return new NextResponse(null, { status: 404 });
  assertOAuthConfig();
  return handlers.GET(trusted);
};

export const POST = async (req: NextRequest) => {
  const trusted = trustedRequest(req);
  if (!trusted) return new NextResponse(null, { status: 404 });
  assertOAuthConfig();

  // Rate-limit credentials sign-in attempts by a hardened client key. We inspect
  // a clone so the original request body remains available for handlers.POST. No
  // password is ever logged or stored here — only a per-key counter (SHA-256 of
  // the client IP resolved from the trusted x-forwarded-for header).
  const clone = trusted.clone();
  try {
    const text = await clone.text();
    if (isCredentialsSignIn(text)) {
      const decision = await rateLimit("login", stableClientKey(trusted));
      if (!decision.ok) return tooManyRequests(decision);
    }
  } catch {
    // If we cannot inspect the body, let the regular handler decide.
  }

  return handlers.POST(trusted);
};