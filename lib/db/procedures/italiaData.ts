// ==========================================
// ITALIA DATA — procedure verificate (fonte: IT.json)
// ==========================================
//
// Refactor Sessione 3: i dati non vivono più qui come TS, ma nel file canonico
// data/procedures/IT.json. Questo modulo è un thin adapter che importa il JSON
// e lo espone come Procedure[], mantenendo la compatibilità con i consumer.
//
// L'obiettivo è che il contenuto sia editabile come JSON senza toccare codice,
// e che in futuro il loader possa passare a un import() dinamico on-demand.

import { loadCountryProceduresJson } from "./json-loader";
import type { Procedure } from "@/lib/types";

export function buildItaliaProcedures(): Procedure[] {
  return loadCountryProceduresJson("IT");
}
