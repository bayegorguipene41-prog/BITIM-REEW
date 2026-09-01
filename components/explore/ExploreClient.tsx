"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getTranslation } from "@/lib/i18n/translations";
import { PROCEDURES } from "@/lib/db/procedures";
import { COUNTRIES, countryName } from "@/lib/db/countries";
import { PROCEDURE_CATEGORIES } from "@/lib/data";
import { localize } from "@/lib/data";

export default function ExploreClient({ lang, initialCategory, initialCountry }: { lang: string; initialCategory?: string; initialCountry?: string }) {
  const t = getTranslation(lang);
  const [country, setCountry] = useState(initialCountry || "");
  const [category, setCategory] = useState(initialCategory || "");
  const [query, setQuery] = useState("");

  const categoryKey = (slug: string) => {
    const map: Record<string, string> = {
      visa: "cat_visa", immigration: "cat_immigration", residency: "cat_residency",
      citizenship: "cat_citizenship", marriage: "cat_marriage", birth: "cat_birth",
      work: "cat_work", study: "cat_study", business: "cat_business",
      driving: "cat_driving", tax: "cat_tax", other: "cat_other",
    };
    return map[slug] || "cat_other";
  };

  const filtered = useMemo(() => {
    return PROCEDURES.filter((p) => {
      if (country && p.countryCode !== country) return false;
      if (category && p.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const name = localize(p.title, lang).toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [country, category, query, lang]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-navy">{t.explore_title}</h1>
        <p className="text-slate-500 mt-1">{t.explore_subtitle}</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="label" htmlFor="explore-country">{t.filter_country}</label>
          <select id="explore-country" className="input !py-2.5" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">{t.all}</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {countryName(c, lang)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="explore-category">{t.filter_category}</label>
          <select id="explore-category" className="input !py-2.5" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t.all}</option>
            {PROCEDURE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t[categoryKey(c) as keyof typeof t] as string}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="explore-query">{t.search_placeholder}</label>
          <input
            id="explore-query"
            className="input !py-2.5"
            placeholder={t.search_placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        {filtered.length} {t.results}
      </p>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">{t.no_results}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const c = COUNTRIES.find((x) => x.code === p.countryCode);
            const name = localize(p.title, lang);
            return (
              <Link
                key={p.id}
                href={`/${lang}/wizard`}
                className="card card-hover p-5 flex items-start gap-3"
              >
                <span className="text-3xl">{c?.flag || "🌍"}</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-navy">{name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {countryName(c || { code: "", it: "", en: "", flag: "" }, lang)}
                    {" · "}
                    {t[categoryKey(p.category) as keyof typeof t] as string}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
