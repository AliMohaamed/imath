import type { MetadataRoute } from "next";
import { locales } from "@/navigation";
import { getAbsoluteUrl, getLocaleAlternates, getLocalePath } from "@/lib/site";
import { INDEXABLE_PAGES } from "@/lib/seo";

// Google ignores <priority> and <changefreq>, so only <lastmod> and hreflang alternates are emitted.
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PAGES.flatMap((page) =>
    locales.map((locale) => ({
      url: getAbsoluteUrl(getLocalePath(locale, page.path)),
      lastModified: page.lastModified,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(getLocaleAlternates(page.path)).map(([key, value]) => [key, getAbsoluteUrl(value)])
        ),
      },
    }))
  );
}
