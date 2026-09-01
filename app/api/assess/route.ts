import { NextResponse } from "next/server";
import type { NextResponse as NextResponseType } from "next/server";
import type { Procedure } from "@/lib/types";
import { PROCEDURES, PROCEDURES_ALL } from "@/lib/db/procedures";
import { conditionContextFromProfile, isApplicable } from "@/lib/conditions";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 415 }
      );
    }

    let profile: Record<string, unknown>;
    try {
      profile = await request.json();
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
