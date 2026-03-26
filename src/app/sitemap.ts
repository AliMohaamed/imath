import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/navigation";
import { DEFAULT_OG_IMAGE, getLocaleAlternates, getLocalePath, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return locales.map((locale) => ({
    url: `${SITE_URL}${getLocalePath(locale, "/")}`,
    lastModified,
    changeFrequency: "weekly",
    priority: locale === defaultLocale ? 1 : 0.9,
    images: [`${SITE_URL}${DEFAULT_OG_IMAGE}`],
    alternates: {
      languages: Object.fromEntries(
        Object.entries(getLocaleAlternates("/")).map(([key, value]) => [key, `${SITE_URL}${value}`])
      ),
    },
  }));
}
