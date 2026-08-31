import ApplicationClient from "@/components/results/ApplicationClient";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";

export async function generateStaticParams() {
  return [];
}

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ lang?: string; id: string }>;
}) {
  const { lang: rawLang, id } = await params;
  const lang = rawLang && LANGUAGES.some((l) => l.code === rawLang) ? rawLang : DEFAULT_LANG;
  return <ApplicationClient lang={lang} id={id} />;
}
