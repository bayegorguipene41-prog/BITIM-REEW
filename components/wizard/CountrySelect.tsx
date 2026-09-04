"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES } from "@/lib/db/countries";
import { POPULAR_COUNTRIES } from "@/lib/data";
import { getRecentCountries } from "@/lib/storage";
import { getTranslation } from "@/lib/i18n/translations";
import { countryName } from "@/lib/db/countries";
import { getCountryMeta } from "@/lib/db/procedures/lookup";
import StatusBadge from "@/components/StatusBadge";

export default function CountrySelect({
  lang,
  value,
  onChange,
  placeholder,
}: {
  lang: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}) {
  const t = getTranslation(lang);
  const [query, setQuery] = useState("");
  const [openList, setOpenList] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenList(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!value) setQuery("");
    else {
      const c = COUNTRIES.find((x) => x.code === value);
      if (c) setQuery(countryName(c, lang));
    }
  }, [value, lang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.it.toLowerCase().includes(q) ||
        c.en.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const recents = getRecentCountries();

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          className="input !pl-10"
          placeholder={placeholder || t.search_country}
          aria-label={t.search_country}
          aria-haspopup="listbox"
          aria-expanded={openList}
          aria-autocomplete="list"
          role="combobox"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenList(true);
            if (value && e.target.value !== countryName(COUNTRIES.find((c) => c.code === value)!, lang)) {
              onChange("");
            }
          }}
          onFocus={() => setOpenList(true)}
        />
      </div>

      {openList && (
        <div
          role="listbox"
          aria-label={t.search_country}
          className="absolute z-40 mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-card max-h-80 overflow-auto animate-fade-in"
        >
          {!query.trim() && recents.length > 0 && (
            <section>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.recent}
              </p>
              <div className="p-1.5">
                {recents.map((code) => {
                  const c = COUNTRIES.find((x) => x.code === code);
                  if (!c) return null;
                  return (
                    <button
                      key={code}
                      role="option"
                      aria-selected={code === value}
                      onClick={() => {
                        onChange(code);
                        setOpenList(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-left"
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-slate-700 font-medium">{countryName(c, lang)}</span>
                      <span className="ml-auto">
                        <StatusBadge status={getCountryMeta(c.code)?.status} lang={lang} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {!query.trim() && (
            <section>
              <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.popular}
              </p>
              <div className="p-1.5">
                {POPULAR_COUNTRIES.map((code) => {
                  const c = COUNTRIES.find((x) => x.code === code);
                  if (!c) return null;
                  return (
                    <button
                      key={code}
                      role="option"
                      aria-selected={code === value}
                      onClick={() => {
                        onChange(code);
                        setOpenList(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-left"
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-slate-700 font-medium">{countryName(c, lang)}</span>
                      <span className="ml-auto">
                        <StatusBadge status={getCountryMeta(c.code)?.status} lang={lang} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <div className="p-1.5">
              {query.trim() && filtered.length === 0 && (
                <p className="px-3 py-4 text-center text-slate-500 text-sm">{t.no_results}</p>
              )}
              {filtered.map((c) => (
                <button
                  key={c.code}
                  role="option"
                  aria-selected={c.code === value}
                  onClick={() => {
                    onChange(c.code);
                    setOpenList(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-left ${
                    c.code === value ? "bg-primary/5" : ""
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-slate-700 font-medium">{countryName(c, lang)}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <StatusBadge status={getCountryMeta(c.code)?.status} lang={lang} />
                    <span className="text-xs text-slate-300">{c.code}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
