"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTranslation } from "@/lib/i18n/translations";
import { getApps, setAccountScope } from "@/lib/storage";
import { useClientAuth } from "@/lib/auth-client";

export default function AccountClient({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  const router = useRouter();
  const { status, session, signOut } = useClientAuth();
  setAccountScope(session?.id as string | undefined ?? null);
  const appCount = getApps().length;

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center" aria-busy="true" role="status">
        <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse mx-auto mb-4" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-32 mx-auto" />
      </div>
    );
  }

  if (status !== "authenticated" || !session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 grid place-items-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-navy mb-2">{t.nav_login}</h1>
        <p className="text-slate-500 mb-6 text-sm">
          {lang === "it"
            ? "Accedi per gestire le tue pratiche e il tuo profilo."
            : "Log in to manage your applications and profile."}
        </p>
        <Link href={`/${lang}/login`} className="btn-primary">
          {t.nav_login}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-navy text-white grid place-items-center text-2xl font-bold shrink-0" aria-hidden="true">
          {(session.name || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-navy">{session.name || t.nav_account}</h1>
          {session.email && <p className="text-slate-500 truncate">{session.email}</p>}
          <p className="text-sm text-slate-400 mt-1">
            {t.your_applications}: {appCount}
          </p>
        </div>
        <button
          onClick={async () => {
            await signOut();
            router.push(`/${lang}`);
            router.refresh();
          }}
          className="btn-secondary shrink-0"
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
