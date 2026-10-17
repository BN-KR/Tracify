"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPath, localeNames, localizedPath, locales, stripLocale, type Locale } from "@/lib/i18n";

// Only the home page and pricing exist in every language so far. Elsewhere the switcher
// sends people to that language's home page instead of a page that does not exist.
const translated = new Set(["/", "/pricing"]);

export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const current = localeFromPath(pathname);
  const base = stripLocale(pathname);
  const target = (locale: Locale) => localizedPath(locale, translated.has(base) ? base : "/");
  return (
    <nav aria-label="Language" className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] ${className}`}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={target(locale)}
          hrefLang={locale === "no" ? "nb" : locale}
          lang={locale === "no" ? "nb" : locale}
          aria-current={locale === current ? "true" : undefined}
          className={`px-2 py-1.5 ${locale === current ? "bg-[#f4d44d] text-black" : "text-white/65 hover:text-white"}`}
        >
          {locale === "en" ? "EN" : locale === "no" ? "NO" : "DE"}
          <span className="sr-only"> {localeNames[locale]}</span>
        </Link>
      ))}
    </nav>
  );
}
