import { NextResponse } from "next/server";
import { PROCEDURES } from "@/lib/db/procedures"; // ✅ adesso prende TUTTE dalla cartella

export async function POST(request: Request) {
  try {
    const profile = await request.json();
    const country = profile.country || "IT";
    const procedure = PROCEDURES.find((p) => p.countryCode === country) || PROCEDURES[0];

    const documents = procedure?.requirements.map((req) => ({
      item: req,
      status: req.necessity,
      sourceName: procedure.sources.find((s) => s.id === req.sourceId)?.authority,
    }));

    return NextResponse.json({
      procedure,
      documents,
      sources: procedure.sources,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}