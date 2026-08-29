"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { COUNTRIES, SITUATIONS } from "@/lib/db/countries";
import { getTranslation } from "@/lib/i18n/translations";
import { DEFAULT_LANG } from "@/lib/i18n/config";

export default function Homepage() {
  const params = useParams();
  const lang = (params?.lang as string) || DEFAULT_LANG;
  const t = getTranslation(lang);

  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    country: "",
    nationality: "",
    situation: "",
    requestText: "",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(1, s - 1));
  const canProceed = () => {
    switch (step) {
      case 1: return !!profile.country;
      case 2: return !!profile.nationality;
      case 3: return !!profile.situation;
      case 4: return profile.requestText.length >= 5;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/${lang}/api/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, lang }),
      });
      const data = await res.json();
      setResult(data);
      setStep(5);
    } catch (e) {
      alert("Errore / Error");
    }
    setLoading(false);
  };

  if (step === 5 && result) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.results_title}</h1>
        <div className="space-y-4 mb-8">
          {result.documents?.map((d: any, i: number) => (
            <div key={i} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">
                  {d.status === "required" ? "🔴" : d.status === "conditional" ? "🟡" : "🔵"}
                </span>
                <div>
                  <h3 className="font-semibold">{d.item.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{d.item.description}</p>
                  {d.sourceName && (
                    <p className="text-xs text-slate-400 mt-2">
                      {t.source}: {d.sourceName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          {t.disclaimer}
        </div>
        <button
          onClick={() => {
            setResult(null);
            setStep(1);
            setProfile({ country: "", nationality: "", situation: "", requestText: "" });
          }}
          className="mt-6 btn-secondary w-full"
        >
          {t.restart}
        </button>
      </main>
    );
  }

  const getSituationLabel = (s: (typeof SITUATIONS)[0]) => {
    const labels: Record<string, string> = { it: s.it, en: s.en, fr: s.fr, es: s.es, ar: s.ar };
    return labels[lang] || s.en;
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t.tagline}</h1>
      </div>

      <div className="card p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t.step1_title}</h2>
            <p className="text-slate-600">{t.step1_question}</p>
            <select
              className="w-full p-3 rounded-xl border border-slate-200 text-lg"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            >
              <option value="">{t.step1_placeholder}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <button className="btn-primary w-full" onClick={next} disabled={!canProceed()}>
              {t.continue}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t.step2_title}</h2>
            <p className="text-slate-600">{t.step2_question}</p>
            <select
              className="w-full p-3 rounded-xl border border-slate-200 text-lg"
              value={profile.nationality}
              onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
            >
              <option value="">{t.select_nationality}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={back}>
                {t.back}
              </button>
              <button className="btn-primary flex-1" onClick={next} disabled={!canProceed()}>
                {t.continue}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t.step3_title}</h2>
            <p className="text-slate-600">{t.step3_question}</p>
            <div className="grid grid-cols-2 gap-3">
              {SITUATIONS.map((s) => (
                <button
                  key={s.value}
                  className={`btn-option ${profile.situation === s.value ? "active" : ""}`}
                  onClick={() => {
                    setProfile({ ...profile, situation: s.value });
                    next();
                  }}
                >
                  {getSituationLabel(s)}
                </button>
              ))}
            </div>
            <button className="text-slate-500 text-sm" onClick={back}>
              {t.back}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t.step4_title}</h2>
            <p className="text-slate-600">{t.step4_question}</p>
            <textarea
              className="w-full p-3 rounded-xl border border-slate-200 text-lg h-28"
              placeholder={t.step4_placeholder}
              value={profile.requestText}
              onChange={(e) => setProfile({ ...profile, requestText: e.target.value })}
            />
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={back}>
                {t.back}
              </button>
              <button
                className="btn-primary flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
              >
                {loading ? t.loading : t.discover}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}