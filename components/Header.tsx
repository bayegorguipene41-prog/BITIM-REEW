"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/translations";
import { useClientAuth } from "@/lib/auth-client";

export default function Header({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  const pathname = usePathname();
  const router = useRouter();
  const { logged, session, signOut } = useClientAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { key: "nav_home", href: `/${lang}` },
    { key: "nav_how", href: `/${lang}/how`, anchor: true },
    { key: "nav_explore", href: `/${lang}/explore` },
    { key: "nav_apps", href: `/${lang}/applications` },
  ];

  const selectedLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const closeLang = useCallback(() => setShowLang(false), []);

  useEffect(() => {
    if (!showLang) return;
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        closeLang();
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") closeLang();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showLang, closeLang]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 shrink-0"
            onClick={() => setMobileMenu(false)}
          >
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-navy text-white font-extrabold text-sm" aria-hidden="true">
              BR
            </span>
            <span className="text-lg font-extrabold tracking-tight text-navy">
              BITIM <span className="text-primary">REEW</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((l) => {
              const active =
                l.key === "nav_home"
                  ? pathname === `/${lang}`
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.key}
                  href={l.anchor ? `/${lang}#how` : l.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-slate-600 hover:text-navy hover:bg-slate-100"
                  }`}
                >
                  {t[l.key as keyof typeof t] as string}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => router.push(`/${lang}/search`)}
              aria-label={t.search_placeholder}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 text-sm w-44 transition-colors"
            >
              <SearchIcon />
              <span className="truncate text-slate-400">{t.search_placeholder}</span>
            </button>

            {/* Language */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setShowLang((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                aria-expanded={showLang}
                aria-haspopup="listbox"
                aria-label={`${lang} - ${t.mobile_menu}`}
              >
                <GlobeIcon />
                <span className="hidden md:inline uppercase">{lang}</span>
                <ChevronDown />
              </button>
              {showLang && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-card p-1.5 z-50 animate-fade-in"
                  role="listbox"
                  aria-label="Select language"
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      role="option"
                      aria-selected={l.code === lang}
                      onClick={() => {
                        setShowLang(false);
                        window.location.href = `/${l.code}`;
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 flex justify-between transition-colors ${
                        l.code === lang ? "text-primary font-semibold" : "text-slate-700"
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      {l.code === lang && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Account */}
            <Link
              href={logged ? `/${lang}/account` : `/${lang}/login`}
              className="hidden md:inline-flex items-center gap-2 btn-primary !py-2 !px-4 text-sm"
            >
              <UserIcon />
              {logged ? session?.name || t.nav_account : t.nav_login}
            </Link>

            {/* Hamburger */}
            <button
              className="lg:hidden grid place-items-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenu((v) => !v)}
              aria-label={t.mobile_menu}
              aria-expanded={mobileMenu}
            >
              {mobileMenu ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <nav className="lg:hidden border-t border-slate-100 bg-white animate-fade-in" aria-label="Mobile navigation">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setMobileMenu(false)}
                className="block px-3 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {t[l.key as keyof typeof t] as string}
              </Link>
            ))}
            <Link
              href={`/${lang}/search`}
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 px-3 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <SearchIcon />
              {t.search_placeholder}
            </Link>
            <Link
              href={logged ? `/${lang}/account` : `/${lang}/login`}
              onClick={() => setMobileMenu(false)}
              className="block px-3 py-3 rounded-xl text-base font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              {logged ? t.nav_account : t.nav_login}
            </Link>
            {logged && (
              <button
                onClick={async () => {
                  await signOut();
                  setMobileMenu(false);
                  router.push(`/${lang}`);
                }}
                className="block w-full text-left px-3 py-3 rounded-xl text-base font-medium text-danger hover:bg-red-50 transition-colors"
              >
                {t.nav_logout}
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
