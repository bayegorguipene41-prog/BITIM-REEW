"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { getTranslation } from "@/lib/i18n/translations";
import { getApps, deleteApp, type SavedApplication } from "@/lib/storage";
import { useClientAuth } from "@/lib/auth-client";

type AppItem = SavedApplication & { pct: number; total: number; ready: number };

function toItem(a: SavedApplication): AppItem {
  const total = a.docs.length;
  const ready = a.docs.filter((d) => d.status === "ready").length;
  return { ...a, total, ready, pct: total ? Math.round((ready / total) * 100) : 0 };
}

export default function ApplicationsClient({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  const [apps, setApps] = useState<AppItem[]>(() => getApps().map(toItem));
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { logged } = useClientAuth();

  const handleDelete = useCallback((id: string) => {
    deleteApp(id);
    setApps(getApps().map(toItem));
    setConfirmDelete(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">
            {logged ? t.welcome_back : t.your_applications}
          </h1>
          <p className="text-slate-500 mt-1">{t.your_applications}</p>
        </div>
        <Link href={`/${lang}/wizard`} className="btn-primary">
          + {t.new_application}
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 grid place-items-center mx-auto mb-4" aria-hidden="true">
            <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6M12 9v6M3 7V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-navy mb-2">{t.no_apps}</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">{t.no_apps_desc}</p>
          <Link href={`/${lang}/wizard`} className="btn-primary">
            {t.start_guide} →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.map((a) => (
            <div key={a.id} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-navy text-lg truncate">{a.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {t.destination}: {a.destinationName}
                  </p>
                  {a.nationality && (
                    <p className="text-xs text-slate-400 mt-1">
                      {t.nationality}: {a.nationality}
                    </p>
                  )}
                </div>
                {confirmDelete === a.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-xs px-2 py-1 rounded-lg bg-danger text-white hover:bg-red-600 transition-colors font-medium"
                    >
                      {lang === "it" ? "Conferma" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium"
                    >
                      {lang === "it" ? "Annulla" : "Cancel"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(a.id)}
                    className="text-slate-300 hover:text-danger transition-colors p-1"
                    aria-label={lang === "it" ? "Elimina pratica" : "Delete application"}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                  <span>
                    {a.ready} / {a.total} {t.documents_of}
                  </span>
                  <span>{a.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-5">
                <span className="text-xs text-slate-400">
                  {new Date(a.updatedAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/${lang}/applications/${a.id}`}
                  className="btn-primary !py-2 !px-4 text-sm"
                >
                  {t.continue_btn} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </svg>
);
