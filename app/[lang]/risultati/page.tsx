'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [paeseScelto, setPaeseScelto] = useState('');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Intestazione */}
      <header className="py-8 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">BITIM REEW</h1>
        <p className="mt-2 text-lg text-gray-600">
          Ti aiutiamo a capire quali documenti ti servono, ovunque nel mondo.
        </p>
      </header>

      {/* Contenuto principale */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <section className="my-8">
          <h2 className="text-xl font-semibold text-center mb-6">
            🌍 Paese di destinazione
          </h2>
          <p className="text-center text-gray-600 mb-6">
            In quale Paese devi fare la procedura?
          </p>

          {/* Elenco Paesi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { codice: 'italia', nome: 'Italia' },
              { codice: 'francia', nome: 'Francia' },
              { codice: 'germania', nome: 'Germania' },
              { codice: 'spagna', nome: 'Spagna' },
              { codice: 'regnounito', nome: 'Regno Unito' },
              { codice: 'austria', nome: 'Austria' },
              { codice: 'belgio', nome: 'Belgio' },
              { codice: 'svizzera', nome: 'Svizzera' },
              { codice: 'portogallo', nome: 'Portogallo' },
              { codice: 'irlanda', nome: 'Irlanda' },
              { codice: 'svezia', nome: 'Svezia' },
              { codice: 'statuniti', nome: 'Stati Uniti' },
              { codice: 'marocco', nome: 'Marocco' },
              { codice: 'algeria', nome: 'Algeria' },
              { codice: 'tunisia', nome: 'Tunisia' },
              { codice: 'senegal', nome: 'Senegal' },
              { codice: 'cina', nome: 'Cina' },
              { codice: 'mali', nome: 'Mali' },
              { codice: 'paesibassi', nome: 'Paesi Bassi' },
            ].map((paese) => (
              <Link
                key={paese.codice}
                href={`/it/${paese.codice}`}
                className="block px-4 py-3 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-400 transition-colors"
              >
                {paese.nome}
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* ✅ MESSAGGIO DI ASSISTENZA AGGIUNTO IN FONDO */}
      <footer className="mt-12 py-6 px-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          ✨ Questo progetto è stato realizzato con l'assistenza di un assistente AI
        </p>
        <p className="mt-2 text-xs text-gray-400">
          © 2026 BITIM REEW — Guida ai documenti per nuovi residenti ovunque nel mondo
        </p>
      </footer>
    </div>
  );
}