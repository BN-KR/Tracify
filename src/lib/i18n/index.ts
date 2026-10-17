import { de } from "./de";
import { en } from "./en";
import { no } from "./no";
import type { Copy } from "./types";

export const locales = ["en", "no", "de"] as const;
export type Locale = (typeof locales)[number];
export const otherLocales = ["no", "de"] as const;

export const localeNames: Record<Locale, string> = { en: "English", no: "Norsk", de: "Deutsch" };
export const htmlLang: Record<Locale, string> = { en: "en", no: "nb", de: "de" };
export const ogLocale: Record<Locale, string> = { en: "en_US", no: "nb_NO", de: "de_DE" };

const dictionaries: Record<Locale, Copy> = { en, no, de };

export function getCopy(locale: Locale): Copy {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Locale prefix of a pathname: "/no/pricing" -> "no". English has no prefix. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return first === "no" || first === "de" ? first : "en";
}

/** Path with the locale prefix removed: "/de/pricing" -> "/pricing". */
export function stripLocale(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (locale === "en") return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

export function localizedPath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** hreflang map for the pages that exist in every language. */
export function languageAlternates(path: "/" | "/pricing") {
  return {
    en: localizedPath("en", path),
    nb: localizedPath("no", path),
    de: localizedPath("de", path),
    "x-default": localizedPath("en", path),
  };
}
