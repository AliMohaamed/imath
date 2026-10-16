import type { Metadata } from "next";
import { locales, type Locale } from "@/navigation";
import { DEFAULT_OG_IMAGE, getLocaleAlternates, getLocalePath, SITE_NAME } from "@/lib/site";

/**
 * Every indexable page, used by the sitemap and the SEO tests. Add new pages here.
 * `lastModified` is the date the page's content last changed meaningfully.
 */
export const INDEXABLE_PAGES = [
  { path: "/", lastModified: "2026-10-16" },
  { path: "/assessment", lastModified: "2026-10-16" },
  { path: "/assessment/personality", lastModified: "2026-10-16" },
  { path: "/assessment/level", lastModified: "2026-10-16" },
  { path: "/privacy", lastModified: "2026-10-01" },
  { path: "/terms", lastModified: "2024-03-01" },
] as const;

export const OG_LOCALES: Record<Locale, string> = {
  ar: "ar_AR",
  en: "en_US",
};

type PageMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** Use the title as-is instead of appending "| iMath" via the layout template. */
  absoluteTitle?: boolean;
};

/**
 * Per-page metadata with a self-referencing canonical, the full hreflang set and
 * matching Open Graph tags. Pages must use this instead of inheriting from the
 * layout, otherwise they inherit the homepage canonical.
 */
export function buildPageMetadata({ locale, path, title, description, absoluteTitle }: PageMetadataInput): Metadata {
  const url = getLocalePath(locale, path);
  const socialTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: getLocaleAlternates(path),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      title: socialTitle,
      description,
      url,
      images: [{ url: DEFAULT_OG_IMAGE, width: 512, height: 512, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}
