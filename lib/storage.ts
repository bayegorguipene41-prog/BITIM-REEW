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

const APP_KEY = "bitimreew.apps.v1";
const RECENT_KEY = "bitimreew.recentCountries.v1";
const PROFILE_KEY = "bitimreew.wizard.v1";
const SESSION_KEY = "bitimreew.session.v1";

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

export function getApps(): SavedApplication[] {
  const raw = safeGet(APP_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveApps(apps: SavedApplication[]) {
  safeSet(APP_KEY, JSON.stringify(apps));
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

export function getRecentCountries(): string[] {
  const raw = safeGet(RECENT_KEY);
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
  safeSet(RECENT_KEY, JSON.stringify(recents.slice(0, 8)));
}

export function saveWizard(profile: Record<string, unknown>) {
  safeSet(PROFILE_KEY, JSON.stringify({ ...profile, savedAt: Date.now() }));
}

export function loadWizard(): Record<string, unknown> | null {
  const raw = safeGet(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearWizard() {
  safeRemove(PROFILE_KEY);
}

export function isLoggedIn(): boolean {
  return !!safeGet(SESSION_KEY);
}

export function login(user: { name?: string; email?: string }) {
  safeSet(SESSION_KEY, JSON.stringify({ ...user, at: Date.now() }));
}

export function logout() {
  safeRemove(SESSION_KEY);
}

export function getSession() {
  const raw = safeGet(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
