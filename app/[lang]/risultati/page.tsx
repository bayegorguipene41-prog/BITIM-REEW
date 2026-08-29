import { assessRequirements } from "@/lib/engine";
import { getTranslation } from "@/lib/i18n/translations";
import { DEFAULT_LANG } from "@/lib/i18n/config";
import type { LangCode } from "@/lib/i18n/translations";

export default async function RisultatiPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang || DEFAULT_LANG) as LangCode;
  const t = getTranslation(lang);

  // Per MVP: profilo vuoto, l'engine restituisce la procedura di riferimento
  const result = assessRequirements({
    country: "",
    nationality: "",
    situation: "",
    requestText: "",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-[#165DFF] mb-2">
        {t.results_title}
      </h1>
      <p className="text-slate-600 mb-8">{t.documents_required}</p>

      <h2 className="text-xl font-bold mb-4">
        {result.procedure.title[lang] ?? result.procedure.title.it}
      </h2>

      <div className="space-y-4">
        {result.documents.map(({ item, status }) => (
          <div
            key={item.id}
            className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-900">
                {item.name[lang] ?? item.name.it}
              </h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                {status === "required"
                  ? t.required
                  : status === "conditional"
                  ? t.conditional
                  : t.recommended}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              {item.description[lang] ?? item.description.it}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          {t.source}
        </h3>
        <ul className="text-sm text-slate-500 space-y-1">
          {result.sources.map((source) => (
            <li key={source.id}>
              
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#165DFF] hover:underline"
              >
                {source.name}
              </a>{" "}
              — {source.authority}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-8 text-xs text-slate-400">{t.disclaimer}</p>
    </div>
  );
}