import { NextResponse } from "next/server";
import type { Procedure } from "@/lib/types";
import { PROCEDURES_ALL } from "@/lib/db/procedures";
import { getProcedureById } from "@/lib/db/procedures/lookup";
import { assessRequirements } from "@/lib/engine";
import { readBodyWithLimit, stableClientKey, assessRateLimited } from "@/lib/security";
import type { UserProfileData } from "@/lib/types";

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

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    // The requested procedure is identified by its stable internal id. It is
    // REQUIRED — a missing/empty id is a 400, and an unknown id is a 404. We
    // never fall back to a default procedure ("Permesso di soggiorno").
    const procedureId = (body.procedureId as string | undefined)?.trim();
    if (!procedureId) {
      return NextResponse.json(
        { error: "Inserisci una procedura." },
        { status: 400 }
      );
    }
    const procedure = getProcedureById(procedureId);
    if (!procedure) {
      return NextResponse.json(
        { error: "La procedura richiesta non è disponibile." },
        { status: 404 }
      );
    }

    const profile = (body.profile as Record<string, unknown> | undefined) ?? body;

    // Evaluate the requested procedure deterministically. The engine throws for
    // unknown ids (already guarded above) and also enforces the id contract.
    const result = assessRequirements(profile as unknown as UserProfileData, procedureId);

    const documents = result.procedure.requirements.map((req) => ({
      item: req,
      status: req.necessity,
      sourceName: result.procedure.sources.find((s) => s.id === req.sourceId)?.authority,
      sourceUrl: result.procedure.sources.find((s) => s.id === req.sourceId)?.url,
    }));

    return NextResponse.json({
      procedure: result.procedure,
      procedureId: result.procedure.id,
      documents,
      sources: result.procedure.sources,
      profile,
      flags: {
        equivalentOf: PROCEDURES_ALL.find((p) => p.id === result.procedure.id)?.id,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Procedure not found") {
      return NextResponse.json(
        { error: "La procedura richiesta non è disponibile." },
        { status: 404 }
      );
    }
    console.error("[assess]", err);
    return NextResponse.json(
      { error: "Qualcosa è andato storto. Riprova." },
      { status: 500 }
    );
  }
}

export type { Procedure };