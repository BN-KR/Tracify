import { notFound } from "next/navigation";
import { htmlLang, isLocale, otherLocales } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return otherLocales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  // Umlauts and the Norwegian ring-above letters sit above the cap height of the pixel font,
  // so display headings need looser line spacing here than in English.
  return <div lang={htmlLang[locale]} className="pixel-loose">{children}</div>;
}
