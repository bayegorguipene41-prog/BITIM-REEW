// ==========================================
// UNVERIFIED PROCEDURES — dati da verificare (fonte: FR.json / DE.json)
// ==========================================
//
// Refactor Sessione 3: i dati FR/DE vivono nei file canonici
// data/procedures/FR.json e data/procedures/DE.json, marcati needs_review.
//
// Questi dati erano placeholder copiati dall'Italia (testo "in Italia", fonte
// "Questura" persino per Francia/Germania). QUEI dati NON erano veritieri.
//
// Per rispettare il principio "mai inventare dati ufficiali" e "mai placeholder
// silenziosi", vengono conservati SOLO per backward-compatibility (gli ID
// stabili continuano a risolvere via getProcedureById / proceduresForCountry),
// ma sono esplicitamente marcati:
//   - dataSource: "needs_review"
//   - fonti senza autorità/URL inventati
//   - descrizioni neutrali, NON "in Italia"
//
// La UI (esplora/risultati) li mostra come "da verificare". Verranno sostituiti
// con dati reali nella Fase 2B.

import { loadCountryProceduresJson } from "./json-loader";
import type { Procedure } from "@/lib/types";

export const UNVERIFIED_PROCEDURES: Procedure[] = [
  ...loadCountryProceduresJson("FR"),
  ...loadCountryProceduresJson("DE"),
];
