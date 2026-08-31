"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTranslation } from "@/lib/i18n/translations";
import { login } from "@/lib/storage";

export default function LoginClient({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function doLogin(finalName?: string) {
    const displayName = finalName || name || email?.split("@")[0] || "Guest";
    login({ name: displayName, email });
    router.push(`/${lang}/account`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email to continue.");
      return;
    }
    doLogin();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-navy">
          {mode === "login" ? t.nav_login : t.start_guide}
        </h1>
        <p className="text-slate-500 mt-1">{t.tagline}</p>
      </div>

      <div className="card p-6 sm:p-8">
        {/* Mode switch */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-500"
            }`}
          >
            {t.nav_login}
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "signup" ? "bg-white text-primary shadow-sm" : "text-slate-500"
            }`}
          >
            {t.start_guide}
          </button>
        </div>

        {/* Google */}
        <button
          onClick={() => doLogin()}
          className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 font-semibold text-slate-700 hover:bg-slate-50 mb-4 transition-colors"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4 text-xs text-slate-400">
          <span className="flex-1 h-px bg-slate-200" /> or <span className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="label">{t.nav_account}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {mode === "login" && (
            <button type="button" onClick={() => doLogin()} className="text-sm text-primary font-medium hover:underline">
              Forgot password?
            </button>
          )}
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            {mode === "login" ? t.nav_login : t.start_guide}
          </button>
        </form>
        <p className="text-xs text-slate-400 text-center mt-5">
          {t.info_change}
        </p>
      </div>
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);
