import AccountClient from "@/components/account/AccountClient";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";

export const metadata = { title: "Account — BITIM REEW" };

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang && LANGUAGES.some((l) => l.code === rawLang) ? rawLang : DEFAULT_LANG;
  return <AccountClient lang={lang} />;
}
