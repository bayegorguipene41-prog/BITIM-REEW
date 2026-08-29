export const LANGUAGES = [
  { code: "it", name: "Italiano", nativeName: "Italiano", isRTL: false },
  { code: "en", name: "English", nativeName: "English", isRTL: false },
  { code: "fr", name: "Français", nativeName: "Français", isRTL: false },
  { code: "es", name: "Español", nativeName: "Español", isRTL: false },
  { code: "de", name: "Deutsch", nativeName: "Deutsch", isRTL: false },
  { code: "ar", name: "Arabo", nativeName: "العربية", isRTL: true },
  { code: "pt", name: "Português", nativeName: "Português", isRTL: false },
  { code: "ru", name: "Russo", nativeName: "Русский", isRTL: false },
  { code: "uk", name: "Ucraino", nativeName: "Українська", isRTL: false },
  { code: "bn", name: "Bengalese", nativeName: "বাংলা", isRTL: false },
  { code: "ur", name: "Urdu", nativeName: "اردو", isRTL: true },
  { code: "zh", name: "Cinese", nativeName: "中文", isRTL: false },
];

export const DEFAULT_LANG = "it";
export const LANG_CODES = LANGUAGES.map((l) => l.code);