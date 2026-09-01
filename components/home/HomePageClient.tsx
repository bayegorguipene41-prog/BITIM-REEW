import Link from "next/link";
import { getTranslation } from "@/lib/i18n/translations";

const CATEGORY_META: { key: string; icon: string; slug: string }[] = [
  { key: "cat_visa", icon: "🛂", slug: "visa" },
  { key: "cat_immigration", icon: "🌍", slug: "immigration" },
  { key: "cat_residency", icon: "🏠", slug: "residency" },
  { key: "cat_citizenship", icon: "🪪", slug: "citizenship" },
  { key: "cat_marriage", icon: "💍", slug: "marriage" },
  { key: "cat_birth", icon: "👶", slug: "birth" },
  { key: "cat_work", icon: "💼", slug: "work" },
  { key: "cat_study", icon: "🎓", slug: "study" },
  { key: "cat_business", icon: "🏢", slug: "business" },
  { key: "cat_driving", icon: "🚗", slug: "driving" },
  { key: "cat_tax", icon: "🧾", slug: "tax" },
  { key: "cat_other", icon: "📄", slug: "other" },
];

export default function HomePageClient({ lang }: { lang: string }) {
  const t = getTranslation(lang);

  const why = [
    { icon: "🌍", title: t.why_1_title, desc: t.why_1_desc },
    { icon: "📄", title: t.why_2_title, desc: t.why_2_desc },
    { icon: "✅", title: t.why_3_title, desc: t.why_3_desc },
    { icon: "🔎", title: t.why_4_title, desc: t.why_4_desc },
  ];

  const steps = [
    { n: "1", title: t.step3_1_title, desc: t.step3_1_desc },
    { n: "2", title: t.step3_2_title, desc: t.step3_2_desc },
    { n: "3", title: t.step3_3_title, desc: t.step3_3_desc },
  ];

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(166,61,64,0.55) 0, transparent 50%), radial-gradient(circle at 80% 70%, rgba(76,107,84,0.4) 0, transparent 45%)",
          }}
        />
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.18) 26%, transparent 27%)",
            backgroundSize: "100% 34px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center gap-2 chip bg-white/10 text-white border border-white/15 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {t.tagline}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
            {t.hero_title}
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            {t.hero_subtitle}
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={`/${lang}/wizard`} className="btn-primary text-base px-8 !py-4 shadow-lg shadow-primary/30 w-full sm:w-auto">
              {t.cta_start}
            </Link>
            <Link href={`/${lang}#how`} className="btn-secondary !bg-white/5 !border-white/20 !text-white hover:!bg-white/10 w-full sm:w-auto text-base !py-4">
              {t.cta_how}
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-navy">{t.step3_intro}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="card card-hover p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary font-extrabold grid place-items-center text-xl mb-4">
                {s.n}
              </div>
              <h3 className="font-bold text-navy mb-1">{s.title}</h3>
              <p className="text-slate-600 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-navy">{t.why_title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {why.map((w) => (
              <div key={w.title} className="card card-hover p-6">
                <div className="text-3xl mb-3">{w.icon}</div>
                <h3 className="font-bold text-navy mb-1">{w.title}</h3>
                <p className="text-slate-600 text-sm">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMON PROCEDURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-navy">{t.common_title}</h2>
          <p className="text-slate-600 mt-2">{t.common_subtitle}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORY_META.map((c) => (
            <Link
              key={c.slug}
              href={`/${lang}/explore?category=${c.slug}`}
              className="card card-hover p-5 flex flex-col items-center text-center gap-2"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="font-semibold text-navy">
                {t[c.key as keyof typeof t] as string}
              </span>
              <span className="text-xs text-primary font-medium">→</span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href={`/${lang}/explore`} className="btn-dark">
            {t.explore_all}
          </Link>
        </div>
      </section>
    </div>
  );
}
