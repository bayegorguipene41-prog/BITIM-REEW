import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LANG_CODES, DEFAULT_LANG } from "./lib/i18n/config";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Se la lingua è già nell'URL → procedi
  const pathHasLang = LANG_CODES.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );
  if (pathHasLang) return NextResponse.next();

  // Altrimenti rileva lingua preferita dal browser
  const acceptLanguage = request.headers.get("accept-language") || "";
  const preferredLang = acceptLanguage
    .split(",")
    .map((l) => l.split(";")[0].split("-")[0])
    .find((lang) => LANG_CODES.includes(lang));

  const targetLang = preferredLang || DEFAULT_LANG;

  // Reindirizza alla lingua rilevata
  return NextResponse.redirect(new URL(`/${targetLang}${pathname}`, request.url));
}

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico).*)"],
};