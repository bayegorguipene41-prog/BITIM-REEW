import WizardClient from "@/components/wizard/WizardClient";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";

export const metadata = {
  title: "Start your document guide — BITIM REEW",
};

export default async function WizardPage({
  params,
}: {
  params: Promise<{ lang?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang && LANGUAGES.some((l) => l.code === rawLang) ? rawLang : DEFAULT_LANG;
  return <WizardClient lang={lang} />;
}
