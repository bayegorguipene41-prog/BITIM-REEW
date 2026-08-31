import SearchClient from "@/components/search/SearchClient";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";

export const metadata = { title: "Search — BITIM REEW" };

export default async function SearchPage({
  params,
}: {
  params: Promise<{ lang?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang && LANGUAGES.some((l) => l.code === rawLang) ? rawLang : DEFAULT_LANG;
  return <SearchClient lang={lang} />;
}
