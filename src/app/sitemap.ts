import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/navigation";
import { DEFAULT_OG_IMAGE, getLocaleAlternates, getLocalePath, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/assessment", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/assessment/personality", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/assessment/level", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${SITE_URL}${getLocalePath(locale, page.path)}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      // Rounded so the XML gets 0.7, not 0.7000000000000001.
      priority: locale === defaultLocale ? page.priority : Math.round((page.priority - 0.1) * 10) / 10,
      ...(page.path === "/" ? { images: [`${SITE_URL}${DEFAULT_OG_IMAGE}`] } : {}),
      alternates: {
        languages: Object.fromEntries(
          Object.entries(getLocaleAlternates(page.path)).map(([key, value]) => [key, `${SITE_URL}${value}`])
        ),
      },
    }))
  );
}
