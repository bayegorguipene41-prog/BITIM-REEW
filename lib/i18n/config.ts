export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", isRTL: false },
  { code: "it", name: "Italiano", nativeName: "Italiano", isRTL: false },
  { code: "fr", name: "Français", nativeName: "Français", isRTL: false },
  { code: "es", name: "Español", nativeName: "Español", isRTL: false },
  { code: "de", name: "Deutsch", nativeName: "Deutsch", isRTL: false },
  { code: "pt", name: "Português", nativeName: "Português", isRTL: false },
  { code: "ar", name: "العربية", nativeName: "العربية", isRTL: true },
];

export const DEFAULT_LANG = "en";
export const LANG_CODES = LANGUAGES.map((l) => l.code);
