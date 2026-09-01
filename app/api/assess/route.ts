import { NextResponse } from "next/server";
import type { NextResponse as NextResponseType } from "next/server";
import type { Procedure } from "@/lib/types";
import { PROCEDURES, PROCEDURES_ALL } from "@/lib/db/procedures";
import { conditionContextFromProfile, isApplicable } from "@/lib/conditions";
import { readBodyWithLimit, stableClientKey, assessRateLimited } from "@/lib/security";

export async function POST(request: Request) {
  try {
    // Public, unauthenticated endpoint doing computation from user input: apply
    // a generous rate limit per client key to curb abuse/DoS (Upstash when
    // configured, in-memory fallback otherwise).
    const rl = await assessRateLimited(stableClientKey(request));
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(1, rl.retryAfterSeconds)) },
        }
      );
    }

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 415 }
      );
    }

    let raw: string;
    const bodyRes = await readBodyWithLimit(request);
    if (bodyRes.state === "ok") {
      raw = bodyRes.text;
    } else {
      return NextResponse.json(
        { error: bodyRes.state === "too_large" ? "Payload too large." : "Invalid request body." },
        { status: bodyRes.status }
      );
    }

    let profile: Record<string, unknown>;
    try {
      profile = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const country = (profile.country as string) || (profile.destination as string) || "IT";
    const procedureSlug = (profile.procedureSlug as string) || (profile.procedure as string);

    const context = conditionContextFromProfile(profile);

    const candidates = [
      PROCEDURES.find((p) => p.slug === procedureSlug && p.countryCode === country),
      PROCEDURES.find((p) => p.countryCode === country),
      PROCEDURES.find((p) => p.slug === procedureSlug),
      PROCEDURES[0],
    ].filter((p): p is Procedure => Boolean(p));

    const procedure = candidates.find((p) => isApplicable(p, context)) || candidates[0];

    if (!procedure) {
      return NextResponse.json(
        { error: "No matching procedure found." },
        { status: 404 }
      );
    }

    const documents = procedure.requirements.map((req) => ({
      item: req,
      status: req.necessity,
      sourceName: procedure.sources.find((s) => s.id === req.sourceId)?.authority,
      sourceUrl: procedure.sources.find((s) => s.id === req.sourceId)?.url,
    }));

    return NextResponse.json({
      procedure,
      documents,
      sources: procedure.sources,
      profile,
      flags: {
        equivalentOf: PROCEDURES_ALL.find((p) => p.id === procedure?.id)?.id,
      },
    });
  } catch (err) {
    console.error("[assess]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
