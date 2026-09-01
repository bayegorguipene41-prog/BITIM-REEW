// URL base pubblica dell'app. Override con NEXT_PUBLIC_SITE_URL (ad es. dominio
// custom); altrimenti il dominio Vercel predefinito.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://bitim-reew-aalb.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "BITIM REEW";
export const SITE_TAGLINE =
  "Sapere esattamente quali documenti ti servono, in qualsiasi paese del mondo.";
export const SITE_TAGLINE_EN =
  "Know exactly which documents you need, anywhere in the world.";