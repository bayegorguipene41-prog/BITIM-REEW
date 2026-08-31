"use client";

import { useState } from "react";
import Link from "next/link";
import { getTranslation } from "@/lib/i18n/translations";
import { getApps, deleteApp, isLoggedIn, type SavedApplication } from "@/lib/storage";

type AppItem = SavedApplication & { pct: number; total: number; ready: number };

function toItem(a: SavedApplication): AppItem {
  const total = a.docs.length;
  const ready = a.docs.filter((d) => d.status === "ready").length;
  return { ...a, total, ready, pct: total ? Math.round((ready / total) * 100) : 0 };
}

export default function ApplicationsClient({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  const [apps, setApps] = useState<AppItem[]>(() => getApps().map(toItem));
  const logged = isLoggedIn();

  function handleDelete(id: string) {
    deleteApp(id);
    setApps(getApps().map(toItem));
  }

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
          <div className="text-6xl mb-4">🗂️</div>
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
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-slate-300 hover:text-danger transition-colors"
                  aria-label="Delete"
                >
                  <TrashIcon />
                </button>
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
                    className="h-full rounded-full bg-primary transition-all"
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
