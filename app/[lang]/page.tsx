import HomePageClient from "@/components/home/HomePageClient";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang && LANGUAGES.some((l) => l.code === rawLang) ? rawLang : DEFAULT_LANG;
  return <HomePageClient lang={lang} />;
}
