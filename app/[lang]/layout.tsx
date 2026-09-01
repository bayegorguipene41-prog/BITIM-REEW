import "../globals.css";
import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/translations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";

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
  return {
    title: `BITIM REEW — ${t.tagline}`,
    description: t.hero_subtitle,
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
  const selectedLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const dir = selectedLang.isRTL ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} className={`${fraunces.variable} ${plexSans.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <SessionProvider>
          <Header lang={lang} />
          <main className="flex-1">{children}</main>
          <Footer lang={lang} />
        </SessionProvider>
      </body>
    </html>
  );
}
