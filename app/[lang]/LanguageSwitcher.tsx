"use client";

import { LANGUAGES } from "@/lib/i18n/config";

export default function LanguageSwitcher({ lang }: { lang: string }) {
  return (
    <select
      className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
      defaultValue={lang}
      onChange={(e) => (window.location.href = `/${e.target.value}`)}
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.nativeName}
        </option>
      ))}
    </select>
  );
}