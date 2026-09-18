import type { Lang } from "./content";

export const LANGS: Lang[] = ["en", "de", "es", "ru"];
export const DEFAULT_LANG: Lang = "en";

/** Short label shown in the header switch. */
export const LANG_LABEL: Record<Lang, string> = {
  en: "EN",
  de: "DE",
  es: "ES",
  ru: "RU",
};

/** Cookie remembering a visitor's explicit choice. */
export const LANG_COOKIE = "lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLang(value: string | undefined): value is Lang {
  return !!value && (LANGS as string[]).includes(value);
}

/**
 * Picks a language from an Accept-Language header. German, Spanish and
 * Russian speakers get their own version; everyone else gets English.
 * Quality values are honoured, so "fr,es;q=0.8" lands on Spanish rather
 * than English-by-default.
 */
export function langFromAcceptHeader(header: string | null): Lang {
  if (!header) return DEFAULT_LANG;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.base && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  for (const { base } of ranked) {
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://prompta-aut-perire.vercel.app"
).replace(/\/$/, "");
