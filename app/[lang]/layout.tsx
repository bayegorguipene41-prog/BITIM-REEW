import "../globals.css";
import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/translations";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-serif",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export function generateMetadata({ params }: { params: { lang?: string } }): Metadata {
  const lang = params?.lang || DEFAULT_LANG;
  const t = getTranslation(lang);
  const title = `${SITE_NAME} — ${t.tagline}`;
  const description = t.hero_subtitle;
  const url = `${SITE_URL}/${lang}`;
  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    creator: SITE_NAME,
    applicationName: SITE_NAME,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l.code, `${SITE_URL}/${l.code}`])
      ),
    },
    openGraph: {
      type: "website",
      locale: lang === "ar" ? "ar" : lang === "it" ? "it_IT" : lang,
      url,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

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
    <html lang={lang} dir={dir} className={`${fraunces.variable} ${plexSans.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: `${SITE_URL}/${lang}`,
              inLanguage: lang,
              description: t.hero_subtitle,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/${lang}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Header lang={lang} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
