"use client";

export type DocStatus = "not_started" | "to_obtain" | "in_progress" | "ready" | "expired";

export type SavedDoc = {
  id: string;
  status: DocStatus;
  note?: string;
  deadline?: string;
  done?: boolean;
};

export type SavedApplication = {
  id: string;
  title: string;
  destination: string;
  destinationName: string;
  procedureSlug: string;
  procedureName: string;
  nationality?: string;
  origin?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  docs: SavedDoc[];
  procedure?: any;
  sources?: any[];
  profile?: Record<string, unknown>;
};

const LEGACY_APP_KEY = "bitimreew.apps.v1";
const LEGACY_RECENT_KEY = "bitimreew.recentCountries.v1";
const LEGACY_PROFILE_KEY = "bitimreew.wizard.v1";

let currentScope: string | null = null;

/**
 * Accounts are isolated in localStorage by a namespace derived from the
 * authenticated user id (a stable random hex, not PII). When set, app/wizard/
 * recent data is stored under `.<namespace>` so two accounts on the same
 * browser never see each other's data. `null` = guest / not signed in.
 *
 * IMPORTANT: this is a UX/safety mitigation only. localStorage is NOT secure
 * storage and things are isolated per-browser, not per-account across devices.
 * The production-grade solution is server-side persistence with per-user
 * authorization (see the audit notes).
 */
export function setAccountScope(userId: string | null) {
  currentScope = userId && userId.trim() ? safeScope(userId) : null;
}

function safeScope(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  // Keep it short, URL/label-safe, non-PII.
  return (h >>> 0).toString(36);
}

function scopedKey(base: string): string {
  return currentScope ? `${base}.${currentScope}` : base;
}

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function safeRemove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

/**
 * Read the current scope's value. The legacy unscoped key is ONLY consulted
 * for the guest scope (where the scoped key equals the legacy key), so that:
 *  - guest data is never silently attributed to a signed-in account;
 *  - two different accounts never read a shared/unscoped bucket.
 * Migration of legacy data is therefore confined to the guest session.
 */
function scopedGet(scoped: string, legacy: string): string | null {
  const v = safeGet(scoped);
  if (v !== null) return v;
  // Only when the scoped key IS the legacy key (guest scope) do we treat it as
  // a migration target; otherwise the fallback would leak guest data into an
  // account namespace.
  return scoped === legacy ? safeGet(legacy) : null;
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export function getApps(): SavedApplication[] {
  const raw = scopedGet(scopedKey(LEGACY_APP_KEY), LEGACY_APP_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveApps(apps: SavedApplication[]) {
  safeSet(scopedKey(LEGACY_APP_KEY), JSON.stringify(apps));
}

export function getApp(id: string): SavedApplication | undefined {
  return getApps().find((a) => a.id === id);
}

export function upsertApp(app: SavedApplication): SavedApplication[] {
  const apps = getApps();
  const idx = apps.findIndex((a) => a.id === app.id);
  if (idx >= 0) apps[idx] = app;
  else apps.unshift(app);
  saveApps(apps);
  return apps;
}

export function deleteApp(id: string): SavedApplication[] {
  const apps = getApps().filter((a) => a.id !== id);
  saveApps(apps);
  return apps;
}

// ---------------------------------------------------------------------------
// Recent countries
// ---------------------------------------------------------------------------

export function getRecentCountries(): string[] {
  const raw = scopedGet(scopedKey(LEGACY_RECENT_KEY), LEGACY_RECENT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addRecentCountry(code: string) {
  const recents = getRecentCountries().filter((c) => c !== code);
  recents.unshift(code);
  safeSet(scopedKey(LEGACY_RECENT_KEY), JSON.stringify(recents.slice(0, 8)));
}

// ---------------------------------------------------------------------------
// Wizard profile
// ---------------------------------------------------------------------------

export function saveWizard(profile: Record<string, unknown>) {
  safeSet(scopedKey(LEGACY_PROFILE_KEY), JSON.stringify({ ...profile, savedAt: Date.now() }));
}

export function loadWizard(): Record<string, unknown> | null {
  const raw = scopedGet(scopedKey(LEGACY_PROFILE_KEY), LEGACY_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearWizard() {
  safeRemove(scopedKey(LEGACY_PROFILE_KEY));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}