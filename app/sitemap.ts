import type { MetadataRoute } from "next";
import { LANGS, SITE_URL } from "@/lib/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return LANGS.map((lang) => ({
    url: `${SITE_URL}/${lang}`,
    changeFrequency: "weekly" as const,
    priority: lang === "en" ? 1 : 0.9,
    alternates: {
      languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE_URL}/${l}`])),
    },
  }));
}
