import "../globals.css";
import Link from "next/link";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/translations";
import LanguageSwitcher from "./LanguageSwitcher";

export const metadata = {
  title: "BITIM REEW — Documents guide worldwide",
  description: "Discover which documents you need, anywhere in the world.",
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang || DEFAULT_LANG;
  const t = getTranslation(lang);
  const selectedLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const dir = selectedLang.isRTL ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href={`/${lang}`} className="text-2xl font-extrabold text-[#165DFF]">
              BITIM REEW
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher lang={lang} />
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-slate-50 border-t border-slate-100 py-6 mt-12">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
            <p className="font-bold text-[#165DFF] mb-1">BITIM REEW</p>
            <p>{t.disclaimer}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}