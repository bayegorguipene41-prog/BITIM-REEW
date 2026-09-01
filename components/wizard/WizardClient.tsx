"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getTranslation } from "@/lib/i18n/translations";
import CountrySelect from "@/components/wizard/CountrySelect";
import { countryByCode, countryLabel } from "@/lib/data";
import {
  saveWizard,
  loadWizard,
  clearWizard,
  addRecentCountry,
  upsertApp,
  uid,
  type SavedApplication,
  type SavedDoc,
} from "@/lib/storage";

const CATEGORIES = [
  { slug: "visa", icon: "🛂", key: "cat_visa" },
  { slug: "immigration", icon: "🌍", key: "cat_immigration" },
  { slug: "residency", icon: "🏠", key: "cat_residency" },
  { slug: "citizenship", icon: "🪪", key: "cat_citizenship" },
  { slug: "marriage", icon: "💍", key: "cat_marriage" },
  { slug: "birth", icon: "👶", key: "cat_birth" },
  { slug: "work", icon: "💼", key: "cat_work" },
  { slug: "study", icon: "🎓", key: "cat_study" },
  { slug: "business", icon: "🏢", key: "cat_business" },
  { slug: "driving", icon: "🚗", key: "cat_driving" },
  { slug: "tax", icon: "🧾", key: "cat_tax" },
  { slug: "other", icon: "📄", key: "cat_other" },
];

const STEP_LABELS = ["wiz_dest_title", "wiz_origin_question", "wiz_nationality_question", "wiz_procedure_question", "wiz_personal_title"];

const MARITAL_OPTIONS = [
  { value: "single", en: "Single", it: "Celibe/Nubile", fr: "Célibataire", es: "Soltero", de: "Single", pt: "Solteiro", ar: "أعزب" },
  { value: "married", en: "Married", it: "Sposato/a", fr: "Marié(e)", es: "Casado/a", de: "Verheiratet", pt: "Casado/a", ar: "متزوج" },
  { value: "other", en: "Other", it: "Altro", fr: "Autre", es: "Otro", de: "Andere", pt: "Outro", ar: "أخرى" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "employed", en: "Employed", it: "Impiegato/a", fr: "Salarié(e)", es: "Empleado/a", de: "Beschäftigt", pt: "Empregado/a", ar: "موظف" },
  { value: "self_employed", en: "Self-employed", it: "Autonomo/a", fr: "Indépendant", es: "Autónomo/a", de: "Selbstständig", pt: "Autônomo/a", ar: "自营职业" },
  { value: "student", en: "Student", it: "Studente", fr: "Étudiant", es: "Estudiante", de: "Student", pt: "Estudante", ar: "طالب" },
  { value: "unemployed", en: "Unemployed", it: "Disoccupato/a", fr: "Sans emploi", es: "Desempleado/a", de: "Arbeitslos", pt: "Desempregado", ar: "عاطل" },
  { value: "retired", en: "Retired", it: "Pensionato/a", fr: "Retraité(e)", es: "Jubilado/a", de: "Rentner", pt: "Aposentado/a", ar: "متقاعد" },
  { value: "other", en: "Other", it: "Altro", fr: "Autre", es: "Otro", de: "Andere", pt: "Outro", ar: "أخرى" },
];

function optionLabel(options: typeof MARITAL_OPTIONS, value: string, lang: string): string {
  const opt = options.find((o) => o.value === value);
  if (!opt) return value;
  return (opt as any)[lang] || opt.en;
}

export default function WizardPage({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [subStatus, setSubStatus] = useState("");
  const [personalIndex, setPersonalIndex] = useState(0);

  const totalSteps = 5;

  useEffect(() => {
    const saved = loadWizard();
    if (saved && saved.lang === lang) {
      setProfile(saved);
      if (saved.step) setStep(Number(saved.step));
    }
  }, [lang]);

  const patch = (p: any) => {
    const next = { ...profile, ...p, lang, step };
    setProfile(next);
    saveWizard(next);
  };

  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return !!profile.destination;
      case 2: return true;
      case 3: return !!profile.nationality;
      case 4: return !!profile.category;
      case 5: return personalComplete();
      default: return true;
    }
  }, [step, profile, personalIndex]);

  function personalComplete() {
    const p = profile;
    if (personalIndex === 0) return !!p.age && Number(p.age) > 0;
    if (personalIndex === 1) return !!p.maritalStatus;
    if (personalIndex === 2) return !!p.employment;
    return true;
  }

  const next = () => {
    if (step === 1) addRecentCountry(profile.destination);
    if (step < totalSteps) {
      setStep(step + 1);
      setPersonalIndex(0);
      patch({ step: step + 1 });
    } else {
      submit();
    }
  };

  const back = () => {
    if (step === 5 && personalIndex > 0) {
      setPersonalIndex(personalIndex - 1);
      return;
    }
    if (step > 1) {
      setStep(step - 1);
      setPersonalIndex(0);
      patch({ step: step - 1 });
    } else {
      router.push(`/${lang}`);
    }
  };

  const procedureLabel = useMemo(() => {
    if (!profile.category) return "";
    const cat = CATEGORIES.find((c) => c.slug === profile.category);
    return cat ? (t[cat.key as keyof typeof t] as string) : "";
  }, [profile.category, lang]);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: profile.destination,
          destination: profile.destination,
          origin: profile.origin,
          nationality: profile.nationality,
          category: profile.category,
          procedureSlug: profile.category === "residency" ? "permesso-soggiorno-lavoro" : undefined,
          situation: profile.situation,
          age: profile.age,
          maritalStatus: profile.maritalStatus,
          employment: profile.employment,
          lang,
        }),
      });
      const data = await res.json();
      const docs: SavedDoc[] = (data.documents || []).map((d: any) => ({
        id: d.item?.id || d.item?.code || "doc",
        status: "not_started",
      }));
      const destLabel = countryLabel(profile.destination, lang);
      const procTitle =
        data.procedure?.title?.[lang] ||
        data.procedure?.title?.en ||
        procedureLabel ||
        "";
      const app: SavedApplication = {
        id: uid(),
        title: `${destLabel} — ${procTitle || t.app_name}`,
        destination: profile.destination,
        destinationName: destLabel,
        procedureSlug: data.procedure?.slug || "",
        procedureName: procTitle,
        nationality: countryLabel(profile.nationality, lang),
        origin: profile.origin ? countryLabel(profile.origin, lang) : "",
        language: lang,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        docs,
        procedure: data.procedure,
        sources: data.sources || [],
        profile: {
          destination: profile.destination,
          origin: profile.origin,
          nationality: profile.nationality,
          category: profile.category,
          age: profile.age,
          maritalStatus: profile.maritalStatus,
          employment: profile.employment,
          situation: profile.situation,
        },
      };
      upsertApp(app);
      addRecentCountry(profile.destination);
      clearWizard();
      router.push(`/${lang}/applications/${app.id}`);
    } catch {
      setSubStatus(
        lang === "it"
          ? "Non è stato possibile elaborare la richiesta. Riprova."
          : "Could not process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const selection = [
    { label: t.destination, value: profile.destination ? countryLabel(profile.destination, lang) : "" },
    { label: t.nationality, value: profile.nationality ? countryLabel(profile.nationality, lang) : "" },
    { label: t.procedure, value: procedureLabel },
  ].filter((s) => s.value);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">
            {t.step} {step} {t.of} {totalSteps} —{" "}
            {t[STEP_LABELS[step - 1] as keyof typeof t] as string}
          </span>
          <span className="text-sm font-semibold text-primary">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < step ? "bg-primary" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Selection recap */}
      {step > 1 && selection.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selection.map((s) => (
            <span
              key={s.label}
              className="chip bg-primary/10 text-primary border border-primary/20"
            >
              {s.label}: {s.value}
            </span>
          ))}
        </div>
      )}

      <div className="card p-6 sm:p-8 animate-fade-in">
        {step === 1 && (
          <Step title={t.wiz_dest_question} subtitle="">
            <CountrySelect
              lang={lang}
              value={profile.destination || ""}
              onChange={(code) => patch({ destination: code })}
            />
          </Step>
        )}

        {step === 2 && (
          <Step title={t.wiz_origin_question} subtitle="">
            <CountrySelect
              lang={lang}
              value={profile.origin || ""}
              onChange={(code) => patch({ origin: code })}
            />
          </Step>
        )}

        {step === 3 && (
          <Step title={t.wiz_nationality_question} subtitle="">
            <CountrySelect
              lang={lang}
              value={profile.nationality || ""}
              onChange={(code) => patch({ nationality: code })}
            />
          </Step>
        )}

        {step === 4 && (
          <Step title={t.wiz_procedure_question} subtitle="">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => patch({ category: c.slug, step })}
                  className={`btn-option flex flex-col items-center gap-2 !p-5 text-center ${
                    profile.category === c.slug ? "active" : ""
                  }`}
                >
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-sm font-semibold">
                    {t[c.key as keyof typeof t] as string}
                  </span>
                </button>
              ))}
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step title={t.wiz_personal_title} subtitle="">
            {personalIndex === 0 && (
              <div className="space-y-2">
                <label className="label">{t.age}</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  className="input"
                  placeholder={t.age_placeholder}
                  value={profile.age || ""}
                  onChange={(e) => patch({ age: e.target.value })}
                />
              </div>
            )}
            {personalIndex === 1 && (
              <div className="space-y-2">
                <label className="label">{t.marital_status}</label>
                <div className="grid grid-cols-3 gap-2">
                  {MARITAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => patch({ maritalStatus: opt.value })}
                      className={`btn-option !p-3 text-center text-sm ${
                        profile.maritalStatus === opt.value ? "active" : ""
                      }`}
                    >
                      {optionLabel(MARITAL_OPTIONS, opt.value, lang)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {personalIndex === 2 && (
              <div className="space-y-2">
                <label className="label">{t.employment_status}</label>
                <div className="grid grid-cols-2 gap-2">
                  {EMPLOYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => patch({ employment: opt.value })}
                      className={`btn-option !p-3 text-center text-sm ${
                        profile.employment === opt.value ? "active" : ""
                      }`}
                    >
                      {optionLabel(EMPLOYMENT_OPTIONS, opt.value, lang)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Step>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
          <button className="btn-secondary w-28" onClick={back}>
            {t.back}
          </button>
          {step === 5 && personalIndex < 2 ? (
            <button
              className="btn-primary flex-1"
              onClick={() => setPersonalIndex(personalIndex + 1)}
              disabled={!canProceed}
            >
              {t.cta_continue}
            </button>
          ) : (
            <button
              className="btn-primary flex-1"
              onClick={next}
              disabled={loading || !canProceed}
            >
              {loading
                ? t.loading
                : step === totalSteps
                ? t.discover
                : t.cta_continue}
            </button>
          )}
        </div>
        {subStatus && (
          <p className="text-danger text-sm text-center mt-4">{subStatus}</p>
        )}
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
