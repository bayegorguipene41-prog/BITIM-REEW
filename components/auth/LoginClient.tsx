"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getTranslation } from "@/lib/i18n/translations";

export default function LoginClient({ lang }: { lang: string }) {
  const t = getTranslation(lang);
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((providers) => {
        setGoogleReady(!!providers?.google);
      })
      .catch(() => setGoogleReady(false));
  }, []);

  async function handleGoogle() {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await signIn("google", { callbackUrl: `/${lang}/account` });
    } catch {
      setError(
        lang === "it"
          ? "Accesso con Google non disponibile. Riprova più tardi."
          : "Google sign-in is not available right now. Please try again later."
      );
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");

    if (!email.trim()) {
      setError(
        lang === "it"
          ? "Inserisci l'indirizzo email per continuare."
          : "Please enter your email address to continue."
      );
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "We couldn't create your account. Try again.");
          return;
        }
      }
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError(
          mode === "login"
            ? lang === "it"
              ? "Email o password non corretti. Controlla i dati e riprova."
              : "Incorrect email or password. Please check and try again."
            : lang === "it"
            ? "Non è stato possibile avviare la sessione. Riprova."
            : "Could not start your session. Please try again."
        );
        return;
      }
      router.push(`/${lang}/account`);
      router.refresh();
    } catch {
      setError(
        lang === "it"
          ? "Qualcosa è andato storto. Controlla la connessione e riprova."
          : "Something went wrong. Check your connection and try again."
      );
    } finally {
      setBusy(false);
    }
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
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 mb-6" role="tablist" aria-label="Authentication mode">
          <button
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => { setMode("login"); setError(""); }}
            className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.nav_login}
          </button>
          <button
            role="tab"
            aria-selected={mode === "signup"}
            onClick={() => { setMode("signup"); setError(""); }}
            className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "signup" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.start_guide}
          </button>
        </div>

        {/* Google */}
        {googleReady !== false && (
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 font-semibold text-slate-700 hover:bg-slate-50 mb-4 transition-colors disabled:opacity-50"
            aria-label={lang === "it" ? "Continua con Google" : "Continue with Google"}
          >
            {googleReady === null ? (
              <span className="w-[18px] h-[18px] rounded-full bg-slate-200 animate-pulse" />
            ) : (
              <GoogleIcon />
            )}
            {googleReady === null
              ? lang === "it" ? "Caricamento…" : "Loading…"
              : lang === "it" ? "Continua con Google" : "Continue with Google"}
          </button>
        )}

        {googleReady === false && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center" role="alert">
            {lang === "it"
              ? "Google non è ancora configurato. Usa email e password per accedere."
              : "Google sign-in is not configured yet. Use email and password to log in."}
          </div>
        )}

        <div className="flex items-center gap-3 my-4 text-xs text-slate-400">
          <span className="flex-1 h-px bg-slate-200" aria-hidden="true" />
          <span>{lang === "it" ? "oppure" : "or"}</span>
          <span className="flex-1 h-px bg-slate-200" aria-hidden="true" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === "signup" && (
            <div>
              <label htmlFor="login-name" className="label">{t.nav_account}</label>
              <input
                id="login-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Benadji Amina"
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label htmlFor="login-email" className="label">Email</label>
            <input
              id="login-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={!!error && !email.trim()}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="label">Password</label>
            <input
              id="login-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              aria-required="true"
              minLength={mode === "signup" ? 8 : undefined}
            />
            {mode === "signup" && (
              <p className="text-xs text-slate-400 mt-1">
                {lang === "it"
                  ? "Usa almeno 8 caratteri."
                  : "Use at least 8 characters."}
              </p>
            )}
          </div>
          {mode === "login" && (
            <button
              type="button"
              onClick={() =>
                setError(
                  lang === "it"
                    ? "Contatta un amministratore per reimpostare la password."
                    : "Ask an administrator to reset your password."
                )
              }
              className="text-sm text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
            >
              {lang === "it" ? "Password dimenticata?" : "Forgot password?"}
            </button>
          )}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm" role="alert">
              <svg className="w-4 h-4 text-danger mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-danger">{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full"
            aria-busy={busy}
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.loading}
              </span>
            ) : mode === "login" ? (
              t.nav_login
            ) : (
              t.start_guide
            )}
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
