"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getTranslation } from "@/lib/i18n/translations";
import { PROCEDURES } from "@/lib/db/procedures";
import { COUNTRIES, countryName } from "@/lib/db/countries";
import { localize } from "@/lib/data";

export default function SearchClient({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { countries: [], procedures: [], documents: [] };
    const countries = COUNTRIES.filter(
      (c) =>
        c.it.toLowerCase().includes(query) ||
        c.en.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query)
    ).slice(0, 8);

    const procedures = PROCEDURES.filter((p) => {
      const title = localize(p.title, lang).toLowerCase();
      const desc = localize(p.description, lang).toLowerCase();
      const country = COUNTRIES.find((c) => c.code === p.countryCode);
      const cname = country ? countryName(country, lang).toLowerCase() : "";
      return title.includes(query) || desc.includes(query) || cname.includes(query);
    }).slice(0, 8);

    const documents = PROCEDURES.flatMap((p) =>
      p.requirements
        .filter((r) => localize(r.name, lang).toLowerCase().includes(query))
        .map((r) => ({ r, p }))
    ).slice(0, 10);

    return { countries, procedures, documents };
  }, [q, lang]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-extrabold text-navy mb-2">{t.search_placeholder}</h1>
      <div className="mb-8">
        <label htmlFor="global-search" className="sr-only">{t.search_placeholder}</label>
        <input
          id="global-search"
          autoFocus
          className="input"
          placeholder={t.search_placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {q.trim() !== "" && (
        <div className="space-y-8">
          {results.countries.length > 0 && (
            <Section title={t.filter_country}>
              {results.countries.map((c) => (
                <Link key={c.code} href={`/${lang}/explore?country=${c.code}`} className="card card-hover p-4 flex items-center gap-3">
                  <span className="text-2xl">{c.flag}</span>
                  <span className="font-semibold">{countryName(c, lang)}</span>
                </Link>
              ))}
            </Section>
          )}

          {results.procedures.length > 0 && (
            <Section title={t.procedure}>
              {results.procedures.map((p) => (
                <Link key={p.id} href={`/${lang}/wizard?procedureId=${encodeURIComponent(p.id)}`} className="card card-hover p-4">
                  <p className="font-semibold text-navy">{localize(p.title, lang)}</p>
                  <p className="text-sm text-slate-500 line-clamp-1">{localize(p.description, lang)}</p>
                </Link>
              ))}
            </Section>
          )}

          {results.documents.length > 0 && (
            <Section title={t.document_name}>
              {results.documents.map(({ r, p }) => (
                <Link key={r.id + p.id} href={`/${lang}/wizard?procedureId=${encodeURIComponent(p.id)}`} className="card card-hover p-4">
                  <p className="font-semibold text-navy">{localize(r.name, lang)}</p>
                  <p className="text-xs text-slate-400">{localize(p.title, lang)}</p>
                </Link>
              ))}
            </Section>
          )}

          {results.countries.length === 0 &&
            results.procedures.length === 0 &&
            results.documents.length === 0 && (
              <div className="text-center text-slate-500 py-10">{t.no_results}</div>
            )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
