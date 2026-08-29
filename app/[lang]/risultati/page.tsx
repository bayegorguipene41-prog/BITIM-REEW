'use client';

import { useParams } from 'next/navigation';
import { PROCEDURES } from '@/lib/db/procedures';
import { useState, useEffect } from 'react';

// Definisci il tipo per le traduzioni
type LocalizedText = {
  titolo: string;
  descrizione: string;
  [lingua: string]: string;
};

// --- Le tue traduzioni ---
const traduzioni: Record<string, LocalizedText> = {
  it: {
    titolo: 'Elenco documenti necessari',
    descrizione: 'Ecco la lista dei documenti richiesti',
  },
  fr: {
    titolo: 'Liste des documents nécessaires',
    descrizione: 'Voici la liste des documents demandés',
  },
  en: {
    titolo: 'List of required documents',
    descrizione: 'Here is the list of required documents',
  },
};

export default function RisultatiPage() {
  const params = useParams();
  const lingua = params.lang as string;
  const paese = params.paese as string;

  // ✅ RIGA 31 — CORRETTA
  const testo = traduzioni[lingua as keyof typeof traduzioni];

  // ✅ RIGA 42 — CORRETTA
  const titolo = testo?.titolo;

  // ... il tuo codice ...

  // ✅ RIGA 53 — CORRETTA
  const messaggio = testo?.descrizione;

  return (
    <div>
      <h1>{titolo}</h1>
      <p>{messaggio}</p>
      {/* resto del contenuto */}
    </div>
  );
}