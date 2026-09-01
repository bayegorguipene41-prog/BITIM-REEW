import type { Procedure } from "./types";

// Clock iniettabile per test. `referenceNow()` restituisce l'orologio corrente.
// `__setNow()` permette ai test di fissare il riferimento e rendere il calcolo
// di obsolescenza deterministico (niente dipendenza da data/fuso della macchina).
let currentNow: Date | undefined;
export function referenceNow(): Date {
  return currentNow ?? new Date();
}
export function __setNow(d: Date | undefined): void {
  currentNow = d;
}

// Procedura considerata "da verificare" se la fonte più recente non è stata
// verificata nell'ultimo periodo. Soglia standard: 12 mesi.
export const MAX_FRESH_MONTHS = 12;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function cutoffDate(maxMonths: number): Date {
  const d = new Date(referenceNow());
  d.setMonth(d.getMonth() - maxMonths);
  return d;
}

/**
 * True se la procedura HA fonti e la più recente è più vecchia di `maxMonths`,
 * Oppure se la procedura non ha alcuna fonte verificabile (data mancante).
 * Una procedura con fonte recente → false (aggiornata, non stale).
 */
export function isProcedureStale(
  procedure: Pick<Procedure, "sources">,
  maxMonths = MAX_FRESH_MONTHS
): boolean {
  const sources = procedure.sources || [];
  if (sources.length === 0) return false;
  const parsed = sources
    .map((s) => {
      if (!s.lastVerifiedAt) return null;
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s.lastVerifiedAt.trim());
      if (!m) return null;
      // Costruisce una data LOCALE a mezzanotte: niente interpretazioni di fuso
      // (una stringa 'YYYY-MM-DD' sarebbe altrimenti letta come mezzanotte UTC).
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    })
    .filter((d): d is Date => !!d && !isNaN(d.getTime()));
  if (parsed.length === 0) return false;
  const newest = parsed.reduce((a, b) => (a > b ? a : b), parsed[0]);
  // Confronto per giorno di calendario (ignora orario/fuso):
  // "più vecchia di maxMonths" ≡ giorno della fonte < giorno soglia.
  return startOfDay(newest) < startOfDay(cutoffDate(maxMonths));
}