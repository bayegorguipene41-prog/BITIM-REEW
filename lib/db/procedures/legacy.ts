// ==========================================
// LEGACY — conversione Procedura legacy → Procedure
// ==========================================
//
// iscritte procedure provenienti dal modello legacy (tipo Procedura in
// lib/db/tipi), es. PROCEDURE_ITALIA. Servono per mantenere PROCEDURES_ALL
// compatibile con il passato. Il modello nuovo (JSON, Sessione 3) non passa da
// qui: questo modulo è solo backward-compatibility.

import type { Procedure } from "@/lib/types";
import type { Procedura } from "../tipi";
import { COUNTRIES } from "../countries";

function countryCodeForPaese(paese: string): string {
  const hit = COUNTRIES.find((c) => c.it.toLowerCase() === paese.trim().toLowerCase());
  return hit?.code ?? paese;
}

export function addLegacyProcedures(list: Procedura[]): Procedure[] {
  return list.map((p) => ({
    id: p.id,
    countryCode: countryCodeForPaese(p.paese),
    slug: p.id,
    title: { it: p.nome_procedura, en: p.nome_procedura },
    description: { it: p.descrizione, en: p.descrizione },
    category: "other",
    sources: [
      {
        id: "source-legacy",
        name: p.fonte_ufficiale,
        authority: p.fonte_ufficiale,
        url: "",
        lastVerifiedAt: p.ultimo_aggiornamento || "2026-08-30",
        confidence: "medium",
        verificationStatus: "needs_review",
      },
    ],
    requirements: [
      ...(p.documenti_obbligatori || []).map((d) => ({
        id: d.nome,
        code: d.nome.toUpperCase().replace(/\s+/g, "_"),
        name: { it: d.nome, en: d.nome },
        description: { it: d.note || "", en: d.note || "" },
        necessity: "required" as const,
        whereToGet: { it: d.dove_andarlo_a_fare || "", en: d.dove_andarlo_a_fare || "" },
        sourceId: "source-legacy",
      })),
      ...(p.documenti_opzionali || []).map((d) => ({
        id: d.nome,
        code: d.nome.toUpperCase().replace(/\s+/g, "_"),
        name: { it: d.nome, en: d.nome },
        description: { it: d.note || "", en: d.note || "" },
        necessity: "recommended" as const,
        whereToGet: { it: d.dove_andarlo_a_fare || "", en: d.dove_andarlo_a_fare || "" },
        sourceId: "source-legacy",
      })),
    ],
    dataSource: "needs_review",
  }));
}
