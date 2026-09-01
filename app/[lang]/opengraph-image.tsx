import { ImageResponse } from "next/og";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/translations";
import { SITE_NAME } from "@/lib/site";

// Image statica Open Graph di fallback (Server Component, nessun asset binario).
export const runtime = "nodejs";

export default function OpengraphImage({ params }: { params: { lang?: string } }) {
  const lang = (params?.lang && LANGUAGES.some((l) => l.code === params.lang!) ? params.lang : DEFAULT_LANG) as string;
  const t = getTranslation(lang);
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#12213D",
          color: "#F7F5F0",
          fontFamily: "sans-serif",
          padding: 64,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 56, fontWeight: 800 }}>{t.tagline}</div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#A63D40", fontWeight: 600 }}>
          {t.hero_subtitle}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}