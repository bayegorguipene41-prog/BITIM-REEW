"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getTranslation } from "@/lib/i18n/translations";
import { localize } from "@/lib/data";
import { isProcedureStale } from "@/lib/data-freshness";
import { getApp, upsertApp, setAccountScope, type SavedApplication, type SavedDoc, type DocStatus } from "@/lib/storage";
import { useClientAuth } from "@/lib/auth-client";

const STATUS_ORDER: DocStatus[] = ["not_started", "to_obtain", "in_progress", "ready", "expired"];

function statusLabel(s: DocStatus, t: any) {
  const map: Record<DocStatus, string> = {
    not_started: t.not_started,
    to_obtain: t.to_obtain,
    in_progress: t.in_progress,
    ready: t.ready,
    expired: t.expired,
  };
  return map[s];
}

function statusColor(s: DocStatus) {
  const map: Record<DocStatus, string> = {
    not_started: "bg-slate-100 text-slate-600",
    to_obtain: "bg-blue-50 text-blue-700",
    in_progress: "bg-amber-50 text-amber-700",
    ready: "bg-success/10 text-success",
    expired: "bg-red-50 text-danger",
  };
  return map[s];
}

export default function ApplicationClient({ lang, id }: { lang: string; id: string }) {
  const t = getTranslation(lang);
  const router = useRouter();
  const { session } = useClientAuth();
  const [app, setApp] = useState<SavedApplication | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setAccountScope(session?.id as string | undefined ?? null);
    const a = getApp(id);
    if (a) {
      if (a.language !== lang) a.language = lang;
      setApp(a);
    } else {
      router.replace(`/${lang}/applications`);
    }
  }, [id, lang, session?.id]);

  const hasProcedureData = useMemo(
    () => !!app?.procedure && Array.isArray(app.procedure.requirements) && app.procedure.requirements.length > 0,
    [app]
  );

  const procedureStale = useMemo(
    () => (app?.procedure ? isProcedureStale(app.procedure) : false),
    [app]
  );

  const docs = useMemo(() => {
    if (!hasProcedureData || !app?.procedure) return [];
    const requirements: any[] = app.procedure.requirements || [];
    return requirements.map((req: any) => {
      const saved: SavedDoc | undefined = app.docs.find((d) => d.id === req.id);
      return {
        req,
        status: saved?.status || "not_started",
        note: saved?.note || "",
        deadline: saved?.deadline || "",
        done: saved?.done || false,
      };
    });
  }, [app]);

  const requiredDocs = useMemo(() => docs.filter((d) => d.req.necessity === "required"), [docs]);
  const conditionalDocs = useMemo(
    () => docs.filter((d) => d.req.necessity === "conditional" || d.req.necessity === "recommended"),
    [docs]
  );

  const readyRequired = requiredDocs.filter((d) => d.status === "ready").length;
  const pct = requiredDocs.length
    ? Math.round((readyRequired / requiredDocs.length) * 100)
    : 0;

  function updateDoc(id: string, patch: Partial<SavedDoc>) {
    if (!app) return;
    const nextDocs = app.docs.map((d) =>
      d.id === id ? { ...d, ...patch } : d
    );
    const next = { ...app, docs: nextDocs, updatedAt: new Date().toISOString() };
    setApp(next);
    upsertApp(next);
  }

  if (!app) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">
        {t.loading}
      </div>
    );
  }

  const complete = readyRequired === requiredDocs.length && requiredDocs.length > 0;
  const missingCount = requiredDocs.filter(
    (d) => d.status === "not_started" || d.status === "to_obtain" || d.status === "expired"
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary uppercase tracking-wide">
          {t.results_eyebrow}
        </p>
        <h1 className="text-3xl font-extrabold text-navy mt-1">{t.results_title}</h1>
        <p className="text-slate-500 mt-1">{t.results_subtitle}</p>
      </div>

      {/* Summary card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <SummaryItem label={t.destination} value={app.destinationName} />
          <SummaryItem label={t.procedure} value={app.procedureName} />
          {app.nationality && <SummaryItem label={t.nationality} value={app.nationality} />}
          {app.origin && <SummaryItem label={t.wiz_origin_question} value={app.origin} />}
        </div>
      </div>

      {/* Procedure overview */}
      <ProcedureOverview lang={lang} t={t} procedure={app.procedure} />

      {!hasProcedureData && (
        <div className="card p-6 mb-6">
          <p className="text-slate-600">{t.proc_no_info}</p>
        </div>
      )}

      {procedureStale && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-dark" role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5" aria-hidden="true">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <span>{t.proc_stale}</span>
        </div>
      )}

      {/* Completion */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-navy">
            {t.preparation}: {pct}% {t.complete}
          </span>
          <span className="text-sm text-slate-500">
            {readyRequired} / {requiredDocs.length} {t.documents_of}
          </span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: complete ? "var(--color-success)" : "var(--color-primary)",
            }}
          />
        </div>

        {/* Completion status */}
        <div
          aria-live="polite"
          className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            complete
              ? "bg-success/10 text-success"
              : "bg-red-50 text-danger"
          }`}
        >
          {complete ? <CircleCheckIcon /> : <CircleAlertIcon />} {complete ? t.checklist_complete : t.missing_required}
          {!complete && ` (${missingCount})`}
        </div>
      </div>

      {/* Required documents */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy mb-4">{t.required_documents}</h2>
        <div className="space-y-3">
          {requiredDocs.map((d) => (
            <DocCard
              key={d.req.id}
              lang={lang}
              t={t}
              doc={d}
              open={openId === d.req.id}
              onToggle={() => setOpenId(openId === d.req.id ? null : d.req.id)}
              onStatus={(s) => updateDoc(d.req.id, { status: s })}
              onNote={(note) => updateDoc(d.req.id, { note })}
              onDeadline={(deadline) => updateDoc(d.req.id, { deadline })}
            />
          ))}
        </div>
      </section>

      {/* Optional / conditional */}
      {conditionalDocs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-navy mb-4">{t.optional_documents}</h2>
          <div className="space-y-3">
            {conditionalDocs.map((d) => (
              <DocCard
                key={d.req.id}
                lang={lang}
                t={t}
                doc={d}
                open={openId === d.req.id}
                onToggle={() => setOpenId(openId === d.req.id ? null : d.req.id)}
                onStatus={(s) => updateDoc(d.req.id, { status: s })}
                onNote={(note) => updateDoc(d.req.id, { note })}
                onDeadline={(deadline) => updateDoc(d.req.id, { deadline })}
              />
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button className="btn-primary flex-1" onClick={() => window.print()}>
          <PrintIcon /> {t.print_checklist}
        </button>
        <button
          className="btn-secondary flex-1"
          onClick={() => {
            openPrintWindow(lang, app, docs, t);
          }}
        >
          <DownloadIcon /> {t.download_checklist}
        </button>
      </div>

      {/* Sources */}
      {(app.sources?.length || 0) > 0 && (
        <section className="card p-6">
          <h2 className="text-xl font-bold text-navy mb-4">{t.official_source}</h2>
          <div className="space-y-4">
            {app.sources.map((s: any, i: number) => (
              <div key={i}>
                <p className="font-bold text-navy">{s.authority || s.name}</p>
                <p className="text-sm text-slate-500">
                  {t.last_verified}:{" "}
                  {s.lastVerifiedAt ? new Date(s.lastVerifiedAt + "T00:00:00").toLocaleDateString(lang === "it" ? "it-IT" : "en-US", { month: "long", year: "numeric" }) : ""}
                </p>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm font-medium underline mt-1 inline-block"
                  >
                    {t.verify_official} ↗
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">{t.info_change}</p>
        </section>
      )}

      {/* Disclaimer (sempre visibile) */}
      <section
        role="note"
        aria-label={t.disclaimer}
        className="card p-6 border-l-4 border-l-navy"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <div>
            <h2 className="font-bold text-navy mb-2">{t.disclaimer_title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{t.disclaimer}</p>
            <p className="mt-3 text-xs text-slate-400">{t.info_change}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-semibold text-navy">{value}</p>
    </div>
  );
}

function ProcedureOverview({ lang, t, procedure }: { lang: string; t: any; procedure?: any }) {
  if (!procedure) return null;
  const description = localize(procedure.description, lang);
  const meta = procedure.meta || {};
  const who = localize(meta.whoCanApply, lang);
  const method = localize(meta.method, lang);
  const cost = localize(meta.estimatedCost, lang);
  const time = localize(meta.processingTime, lang);
  const validity = localize(meta.validity, lang);
  const renewal = localize(meta.renewal, lang);
  const note = localize(meta.note, lang);
  const where = meta.whereToApply as any;

  const facts: { label: string; value?: string }[] = [
    { label: t.doc_cost, value: cost },
    { label: t.doc_time, value: time },
    { label: t.proc_validity, value: validity },
    { label: t.proc_renewal, value: renewal },
    { label: t.proc_method, value: method },
  ].filter((f) => !!f.value);

  return (
    <>
      <section className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-navy mb-2">{t.proc_overview}</h2>
        {description && <p className="text-slate-600 mb-6">{description}</p>}

        {who && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.proc_who_can_apply}</p>
            <p className="text-slate-700">{who}</p>
          </div>
        )}

        {facts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{f.label}</p>
                <p className="font-semibold text-navy">{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {where && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{t.proc_where_to_apply}</p>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-bold text-navy">{localize(where.name, lang)}</p>
              {localize(where.address, lang) && (
                <p className="text-sm text-slate-600 mt-1">📍 {localize(where.address, lang)}</p>
              )}
              {localize(where.hours, lang) && (
                <p className="text-sm text-slate-600 mt-1">🕐 {localize(where.hours, lang)}</p>
              )}
              {localize(where.appointment, lang) && (
                <p className="text-sm text-slate-600 mt-1">📅 {localize(where.appointment, lang)}</p>
              )}
              {where.phone && <p className="text-sm text-slate-600 mt-1">📞 {where.phone}</p>}
              {where.website && (
                <a href={where.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium underline mt-1 inline-block">
                  🌐 {where.website}
                </a>
              )}
              {localize(where.notes, lang) && (
                <p className="text-sm text-slate-500 mt-2 italic">{localize(where.notes, lang)}</p>
              )}
            </div>
          </div>
        )}

        {note && <p className="mt-5 text-xs text-slate-400">{note}</p>}
      </section>

      {Array.isArray(meta.steps) && meta.steps.length > 0 && (
        <section className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-navy mb-4">{t.proc_steps}</h2>
          <ol className="space-y-3">
            {meta.steps.map((s: any, i: number) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-extrabold grid place-items-center text-sm">
                  {i + 1}
                </span>
                <span className="text-slate-700 pt-1">{localize(s, lang)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}

function DocCard({
  lang,
  t,
  doc,
  open,
  onToggle,
  onStatus,
  onNote,
  onDeadline,
}: any) {
  const { req, status, note, deadline } = doc;
  const name = localize(req.name, lang);
  const desc = localize(req.description, lang);
  const where = localize(req.whereToGet, lang);
  const what = localize(req.whatYouNeed, lang);
  const validity = localize(req.validityPeriod, lang);
  const cost = localize(req.estimatedCost, lang);
  const time = localize(req.processingTime, lang);
  const needsTranslation = req.translationRequired === true;
  const needsApostille = req.apostilleRequired === true || req.legalizationType === "apostille";

  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-start gap-3">
          <span className={`chip shrink-0 ${statusColor(status)}`}>{statusLabel(status, t)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-navy">{name}</h3>
            {desc && <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{desc}</p>}
          </div>
          <Chevron open={open} />
        </div>

        {/* Document flags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {needsTranslation && (
            <span className="chip bg-warning/10 text-warning-dark">
              <WarnIcon /> {t.doc_translation}
            </span>
          )}
          {needsApostille && (
            <span className="chip bg-warning/10 text-warning-dark">
              <WarnIcon /> {t.doc_apostille}
            </span>
          )}
          {validity && (
            <span className="chip bg-slate-100 text-slate-600">
              <ClockIcon /> {t.doc_validity}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Field label={t.doc_what} value={desc} />
            <Field label={t.doc_what_need} value={what} />
            <Field label={t.doc_where} value={where} />
            {validity && <Field label={t.doc_validity} value={validity} />}
            {cost && <Field label={t.doc_cost} value={cost} />}
            {time && <Field label={t.doc_time} value={time} />}
            <Field
              label={t.doc_translation}
              value={needsTranslation ? t.translated : t.not_translated}
            />
            <Field
              label={t.doc_apostille}
              value={needsApostille ? t.legalized : t.not_required}
            />
          </div>

          {/* Status selector */}
          <div className="mt-4">
            <p className="label">{t.status}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.status}>
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatus(s)}
                  aria-pressed={status === s}
                  className={`chip border transition-colors ${
                    status === s ? "bg-primary/10 border-primary text-primary" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {statusLabel(s, t)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes & deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div>
              <label htmlFor={`note-${req.id}`} className="label">{t.notes}</label>
              <input
                id={`note-${req.id}`}
                className="input !py-2 text-sm"
                placeholder={t.add_note}
                value={note}
                onChange={(e) => onNote(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`deadline-${req.id}`} className="label">{t.deadline}</label>
              <input
                id={`deadline-${req.id}`}
                type="date"
                className="input !py-2 text-sm"
                value={deadline}
                onChange={(e) => onDeadline(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-slate-700">{value}</p>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`mt-1 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function CircleCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CircleAlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function openPrintWindow(lang: string, app: SavedApplication, docs: any[], t: any) {
  const w = window.open("", "_blank", "width=800,height=1000");
  if (!w) return;
  const rows = docs
    .map((d) => {
      const name = localize(d.req.name, lang);
      const status = d.status === "ready" ? "✅" : d.status === "in_progress" ? "🔄" : d.status === "expired" ? "⏰" : "⬜";
      return `<tr><td>${status}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${name}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${statusLabel(d.status, t)}</td></tr>`;
    })
    .join("");

  w.document.write(`
    <html lang="${lang}">
    <head>
      <title>BITIM REEW — ${app.title}</title>
      <style>
        body{font-family:Inter,system-ui,sans-serif;color:#0B1F3A;padding:32px}
        h1{font-size:22px} h2{margin-top:28px;font-size:16px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th{text-align:left;padding:8px 12px;border-bottom:2px solid #0B1F3A;font-size:13px}
        .meta{color:#64748b;font-size:13px;margin-top:8px}
        .pct{display:inline-block;padding:6px 12px;border-radius:8px;background:#165DFF;color:#fff;font-size:13px;margin-top:16px}
      </style>
    </head>
    <body>
      <h1>BITIM REEW</h1>
      <p class="meta">${app.title}</p>
      <p class="meta">${t.destination}: ${app.destinationName} · ${t.procedure}: ${app.procedureName}</p>
      <span class="pct">${t.preparation}: ${docs.filter((d) => d.status === "ready").length} / ${docs.length} ${t.documents_of}</span>
      <h2>${t.checklist_title}</h2>
      <table>
        <thead><tr><th></th><th>${t.document_name}</th><th>${t.status}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:32px;font-size:11px;color:#94a3b8">${t.disclaimer} — ${t.info_change}</p>
    </body>
    </html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => {
    try {
      w.print();
    } catch {}
  }, 300);
}
