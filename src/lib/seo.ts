import type { Metadata } from "next";
import { locales, type Locale } from "@/navigation";
import { getLocaleAlternates, getLocalePath, SITE_NAME } from "@/lib/site";
import { PROGRAM_UPDATED_AT } from "@/content/program";
import { RESOURCES } from "@/content/resources";

/**
 * Every indexable page, used by the sitemap and the SEO tests. Add new pages here.
 * `lastModified` is the date the page's content last changed meaningfully.
 */
export const INDEXABLE_PAGES: ReadonlyArray<{ path: string; lastModified: string }> = [
  { path: "/", lastModified: "2026-10-16" },
  { path: "/program", lastModified: PROGRAM_UPDATED_AT },
  { path: "/resources", lastModified: RESOURCES.map((r) => r.updatedAt).sort().at(-1) ?? PROGRAM_UPDATED_AT },
  ...RESOURCES.map((r) => ({ path: `/resources/${r.slug}`, lastModified: r.updatedAt })),
  { path: "/assessment", lastModified: "2026-10-16" },
  { path: "/assessment/personality", lastModified: "2026-10-16" },
  { path: "/assessment/level", lastModified: "2026-10-16" },
  { path: "/privacy", lastModified: "2026-10-01" },
  { path: "/terms", lastModified: "2024-03-01" },
];

export const OG_LOCALES: Record<Locale, string> = {
  ar: "ar_AR",
  en: "en_US",
};

/** 1200×630 share cards, rendered from HTML so Arabic shapes correctly. Bump the -vN suffix whenever an image changes: social networks cache by URL. */
export const OG_IMAGES: Record<Locale, { url: string; alt: string }> = {
  ar: { url: "/og/imath-ar-v2.jpg", alt: "iMath: دروس حساب ذهني أونلاين 1:1 للأطفال من 4 إلى 14 سنة" },
  en: { url: "/og/imath-en-v3.jpg", alt: "iMath: 1:1 online mental math classes for kids aged 4–14" },
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
      images: [{ ...OG_IMAGES[locale], width: 1200, height: 630, type: "image/jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [OG_IMAGES[locale]],
    },
  };
}
