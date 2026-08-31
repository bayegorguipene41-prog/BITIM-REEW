import Link from "next/link";
import { getTranslation } from "@/lib/i18n/translations";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";

export const metadata = { title: "How it works — BITIM REEW" };

export default async function HowPage({
  params,
}: {
  params: Promise<{ lang?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang && LANGUAGES.some((l) => l.code === rawLang) ? rawLang : DEFAULT_LANG;
  const t = getTranslation(lang);

  const steps = [
    { n: "01", title: t.step3_1_title, desc: t.step3_1_desc },
    { n: "02", title: t.step3_2_title, desc: t.step3_2_desc },
    { n: "03", title: t.step3_3_title, desc: t.step3_3_desc },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-navy">{t.nav_how}</h1>
        <p className="text-slate-500 mt-3 max-w-xl mx-auto">{t.hero_subtitle}</p>
      </div>

      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.n} className="card p-6 flex items-start gap-5 card-hover">
            <span className="text-2xl font-extrabold text-primary">{s.n}</span>
            <div>
              <h2 className="text-xl font-bold text-navy">{s.title}</h2>
              <p className="text-slate-600 mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
        {[
          { icon: "🌍", title: t.why_1_title },
          { icon: "📄", title: t.why_2_title },
          { icon: "✅", title: t.why_3_title },
          { icon: "🔎", title: t.why_4_title },
        ].map((w) => (
          <div key={w.title} className="card p-4 text-center">
            <div className="text-2xl mb-1">{w.icon}</div>
            <p className="text-sm font-semibold text-navy">{w.title}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link href={`/${lang}/wizard`} className="btn-primary text-base px-8">
          {t.cta_start}
        </Link>
      </div>
    </div>
  );
}
