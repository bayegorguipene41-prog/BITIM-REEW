import ApplicationsClient from "@/components/applications/ApplicationsClient";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";

export const metadata = { title: "My applications — BITIM REEW" };

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ lang?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang && LANGUAGES.some((l) => l.code === rawLang) ? rawLang : DEFAULT_LANG;
  return <ApplicationsClient lang={lang} />;
}
