import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { stableClientKey, rateLimit, readBodyWithLimit } from "@/lib/security";

export async function POST(req: Request) {
  try {
    // Rate limit by a hardened client key (backed by Upstash when configured,
    // otherwise the in-memory fallback; see lib/security).
    const ipDecision = await rateLimit("register", stableClientKey(req));
    if (!ipDecision.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(1, ipDecision.retryAfterSeconds)) },
        }
      );
    }

    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 415 }
      );
    }

    const bodyRes = await readBodyWithLimit(req);
    let raw: string;
    if (bodyRes.state === "ok") {
      raw = bodyRes.text;
    } else {
      return NextResponse.json(
        { error: bodyRes.state === "too_large" ? "Payload too large." : "Invalid request body." },
        { status: bodyRes.status }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { name, email, password } = body as Record<string, unknown>;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Please provide a password." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password is too long." },
        { status: 400 }
      );
    }

    const result = await createUser({
      name: typeof name === "string" ? name : "",
      email: email.trim().toLowerCase(),
      password,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again." },
      { status: 500 }
    );
  }
}