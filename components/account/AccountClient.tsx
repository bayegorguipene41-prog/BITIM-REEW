"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTranslation } from "@/lib/i18n/translations";
import { getSession, logout, getApps } from "@/lib/storage";

export default function AccountClient({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  const router = useRouter();
  const [session] = useState(() => getSession());
  const [appCount] = useState(() => getApps().length);

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-6">{t.nav_account}</p>
        <Link href={`/${lang}/login`} className="btn-primary">
          {t.nav_login}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-navy text-white grid place-items-center text-2xl font-bold">
          {(session.name || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-navy">{session.name || t.nav_account}</h1>
          {session.email && <p className="text-slate-500">{session.email}</p>}
          <p className="text-sm text-slate-400 mt-1">
            {t.your_applications}: {appCount}
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push(`/${lang}`);
            router.refresh();
          }}
          className="btn-secondary"
        >
          {t.nav_logout}
        </button>
      </div>

      <div className="text-center py-10">
        <Link href={`/${lang}/applications`} className="btn-primary">
          {t.your_applications} →
        </Link>
      </div>
    </div>
  );
}
