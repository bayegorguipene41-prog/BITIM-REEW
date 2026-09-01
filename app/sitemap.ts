import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/lib/db/countries";
import { LANGUAGES } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

// La home pubblica e' / (bloccata su /it via vercel.json). Elenchiamo le entry
// point pubbliche: home, lingue, explore e search. Le pagine private
// (account/applications/login) sono escluse.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ];

  for (const lang of LANGUAGES) {
    entries.push({
      url: `${SITE_URL}/${lang.code}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    });
    entries.push({
      url: `${SITE_URL}/${lang.code}/explore`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    entries.push({
      url: `${SITE_URL}/${lang.code}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Una entry per paese nell'esplora (mondo reale disponibile).
  for (const c of COUNTRIES) {
    entries.push({
      url: `${SITE_URL}/it/explore?country=${c.code}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}