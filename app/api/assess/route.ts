import { NextResponse } from "next/server";
import type { Procedure } from "@/lib/types";
import { PROCEDURES, PROCEDURES_ALL } from "@/lib/db/procedures";
import { conditionContextFromProfile, isApplicable } from "@/lib/conditions";

export async function POST(request: Request) {
  try {
    const profile = await request.json();
    const country = profile.country || profile.destination || "IT";
    const procedureSlug = profile.procedureSlug || profile.procedure;

    const context = conditionContextFromProfile(profile);

    const candidates = [
      PROCEDURES.find((p) => p.slug === procedureSlug && p.countryCode === country),
      PROCEDURES.find((p) => p.countryCode === country),
      PROCEDURES.find((p) => p.slug === procedureSlug),
      PROCEDURES[0],
    ].filter((p): p is Procedure => Boolean(p));

    // Sceglie la prima procedura applicabile al contesto utente;
    // se nessuna è applicabile ripiega sulla prima candidata.
    const procedure = candidates.find((p) => isApplicable(p, context)) || candidates[0];

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
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
