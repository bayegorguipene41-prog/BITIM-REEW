"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTranslation } from "@/lib/i18n/translations";
import CountrySelect from "@/components/wizard/CountrySelect";
import { countryByCode, countryLabel } from "@/lib/data";
import {
  saveWizard,
  loadWizard,
  clearWizard,
  addRecentCountry,
  upsertApp,
  setAccountScope,
  uid,
  type SavedApplication,
  type SavedDoc,
} from "@/lib/storage";
import { useClientAuth } from "@/lib/auth-client";
import { proceduresForCountry } from "@/lib/db/procedures/lookup";
import { localize } from "@/lib/data";

const STEP_LABELS = ["wiz_dest_title", "wiz_origin_question", "wiz_nationality_question", "wiz_procedure_question", "wiz_personal_title"];

const MARITAL_OPTIONS = [
  { value: "single", en: "Single", it: "Celibe/Nubile", fr: "Célibataire", es: "Soltero", de: "Single", pt: "Solteiro", ar: "أعزب" },
  { value: "married", en: "Married", it: "Sposato/a", fr: "Marié(e)", es: "Casado/a", de: "Verheiratet", pt: "Casado/a", ar: "متزوج" },
  { value: "other", en: "Other", it: "Altro", fr: "Autre", es: "Otro", de: "Andere", pt: "Outro", ar: "أخرى" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "employed", en: "Employed", it: "Impiegato/a", fr: "Salarié(e)", es: "Empleado/a", de: "Beschäftigt", pt: "Empregado/a", ar: "موظف" },
  { value: "self_employed", en: "Self-employed", it: "Autonomo/a", fr: "Indépendant", es: "Autónomo/a", de: "Selbstständig", pt: "Autônomo/a", ar: "عمل حر" },
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
  const searchParams = useSearchParams();
  const { session } = useClientAuth();
  setAccountScope(session?.id as string | undefined ?? null);

  // Optional ?procedureId=<stable id> pre-selects a concrete procedure (from a
  // linked card, e.g. /explore or /search). No fallback to a default procedure.
  const initialProcedureId = useMemo(
    () => searchParams.get("procedureId")?.trim() || undefined,
    [searchParams]
  );

  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [subStatus, setSubStatus] = useState("");
  const [personalIndex, setPersonalIndex] = useState(0);

  const totalSteps = 5;

  // Real, distinct procedures available for the selected destination country.
  // The user must pick one concrete procedure, captured as its stable id.
  const availableProcedures = useMemo(
    () => proceduresForCountry(profile.destination),
    [profile.destination]
  );

  const selectedProcedure = useMemo(
    () => availableProcedures.find((p) => p.id === profile.procedureId),
    [availableProcedures, profile.procedureId]
  );

  useEffect(() => {
    const saved = loadWizard();
    let next = saved && saved.lang === lang ? { ...saved } : {};
    const destCode =
      typeof next.destination === "string"
        ? next.destination
        : typeof next.country === "string"
          ? next.country
          : "";

    if (initialProcedureId) {
      const maybe = proceduresForCountry(destCode).find(
        (p) => p.id === initialProcedureId
      );
      next = {
        ...next,
        procedureId: initialProcedureId,
        category: maybe?.category ?? next.category,
        destination: next.destination ?? maybe?.countryCode,
      };
    } else if (!next.procedureId) {
      // Legacy profiles carried only a category, not a concrete procedureId.
      // Migrate deterministically: if the destination has exactly one available
      // procedure, promote it; otherwise require an explicit selection in step 4.
      const one = proceduresForCountry(destCode);
      if (one.length === 1) next.procedureId = one[0].id;
    }

    setProfile(next);
    if (next.step) setStep(Number(next.step));
  }, [lang, initialProcedureId]);

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
      case 4: return !!profile.procedureId;
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
    if (selectedProcedure) return localize(selectedProcedure.title, lang);
    if (availableProcedures.length === 1) return localize(availableProcedures[0].title, lang);
    return "";
  }, [selectedProcedure, availableProcedures, lang]);

  async function submit() {
    const procedureId = profile.procedureId || selectedProcedure?.id;
    if (!procedureId) {
      setSubStatus(
        lang === "it"
          ? "Seleziona una procedura."
          : "Select a procedure."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          procedureId,
          profile: {
            country: profile.destination,
            destination: profile.destination,
            origin: profile.origin,
            nationality: profile.nationality,
            category: profile.category,
            situation: profile.situation,
            age: profile.age,
            maritalStatus: profile.maritalStatus,
            employment: profile.employment,
          },
          country: profile.destination,
          destination: profile.destination,
          origin: profile.origin,
          nationality: profile.nationality,
          category: profile.category,
          situation: profile.situation,
          age: profile.age,
          maritalStatus: profile.maritalStatus,
          employment: profile.employment,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubStatus(data.error || (lang === "it" ? "Errore nell'elaborazione." : "Processing error."));
        return;
      }
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
        procedureId: data.procedure?.id || procedureId,
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
          procedureId: data.procedure?.id || procedureId,
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
            {availableProcedures.length === 0 ? (
              <p className="text-danger">{t.no_results}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableProcedures.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => patch({ procedureId: p.id, category: p.category, step })}
                    aria-pressed={profile.procedureId === p.id}
                    className={`btn-option flex flex-col items-start gap-2 !p-5 text-left ${
                      profile.procedureId === p.id ? "active" : ""
                    }`}
                  >
                    <span className="text-lg font-semibold">
                      {localize(p.title, lang)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {localize(p.description, lang)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Step>
        )}

        {step === 5 && (
          <Step title={t.wiz_personal_title} subtitle="">
            {personalIndex === 0 && (
              <div className="space-y-2">
                <label htmlFor="wiz-age" className="label">{t.age}</label>
                <input
                  id="wiz-age"
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
                      aria-pressed={profile.maritalStatus === opt.value}
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
                      aria-pressed={profile.employment === opt.value}
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
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.loading}
                </span>
              ) : step === totalSteps ? (
                t.discover
              ) : (
                t.cta_continue
              )}
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
