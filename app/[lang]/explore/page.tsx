import ExploreClient from "@/components/explore/ExploreClient";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";

export const metadata = { title: "Explore procedures — BITIM REEW" };

export default async function ExplorePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang?: string }>;
  searchParams: Promise<{ category?: string; q?: string; country?: string }>;
}) {
  const [{ lang: rawLang }, { category, country }] = await Promise.all([params, searchParams]);
  const lang = rawLang && LANGUAGES.some((l) => l.code === rawLang) ? rawLang : DEFAULT_LANG;
  return <ExploreClient lang={lang} initialCategory={category} initialCountry={country} />;
}
