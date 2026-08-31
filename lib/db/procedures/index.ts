// ==========================================
// INDICE — TUTTE LE PROCEDURE
// ==========================================

// 📌 IMPORTA TUTTE LE PROCEDURE — NOMI FILE ESATTI
import { procedureItalia, procedureItaliaRicongiungimento } from "./Italia";
import { procedureFrancia } from "./francia";
import { procedureGermania } from "./Germania";
import { procedureSpagna } from "./Spagna";
import { procedureRegnoUnito } from "./Regno Unito";
import { procedureAustria } from "./Austria";
import { procedureBelgio } from "./Belgio";
import { procedureSvizzera } from "./Svizzera";
import { procedurePortogallo } from "./Portogallo";
import { procedureIrlanda } from "./Irlanda";
import { procedureSvezia } from "./Svezia";
import { procedureStatiUniti } from "./StatiUniti";
import { procedureMarocco } from "./Marocco";
import { procedureAlgeria } from "./Algeria";
import { procedureTunisia } from "./Tunisia";
import { procedureSenegal } from "./Senegal";
import { procedureCina } from "./Cina";
import { procedureMali } from "./Mali";
import { procedurePaesiBassi } from "./PaesiBassi";

// ✅ Importa le procedure dettagliate dell'Italia
import { PROCEDURE_ITALIA } from "./Italia";
import type { Procedure } from "@/lib/types";
import type { Procedura } from "../tipi";

// 📌 ELENCO COMPLETO DI TUTTE LE PROCEDURE
export const PROCEDURES: Procedure[] = [
  procedureItalia,
  procedureItaliaRicongiungimento,
  procedureFrancia,
  procedureGermania,
  procedureSpagna,
  procedureRegnoUnito,
  procedureAustria,
  procedureBelgio,
  procedureSvizzera,
  procedurePortogallo,
  procedureIrlanda,
  procedureSvezia,
  procedureStatiUniti,
  procedureMarocco,
  procedureAlgeria,
  procedureTunisia,
  procedureSenegal,
  procedureCina,
  procedureMali,
  procedurePaesiBassi,
];

export function addLegacyProcedures(list: Procedura[]): Procedure[] {
  return list.map((p) => ({
    id: p.id,
    countryCode: p.paese,
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
  }));
}

export const PROCEDURES_ALL: Procedure[] = [
  ...PROCEDURES,
  ...addLegacyProcedures(PROCEDURE_ITALIA),
];
