import Link from "next/link";
import { getTranslation } from "@/lib/i18n/translations";

export default function Footer({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  return (
    <footer className="bg-navy text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/10 font-extrabold text-sm text-white" aria-hidden="true">
                BR
              </span>
              <span className="text-lg font-extrabold text-white">
                BITIM <span className="text-primary">REEW</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">{t.tagline}</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">{t.explore_title}</p>
            <ul className="space-y-2 text-sm list-none p-0">
              <li><Link href={`/${lang}/explore`} className="hover:text-white transition-colors">{t.nav_explore}</Link></li>
              <li><Link href={`/${lang}#how`} className="hover:text-white transition-colors">{t.nav_how}</Link></li>
              <li><Link href={`/${lang}/applications`} className="hover:text-white transition-colors">{t.nav_apps}</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">{t.official_source}</p>
            <p className="text-sm text-slate-400 leading-relaxed">{t.info_change}</p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-slate-500 leading-relaxed">
          &copy; {new Date().getFullYear()} BITIM REEW
        </div>
      </div>
    </footer>
  );
}
