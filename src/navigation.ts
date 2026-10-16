import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['ar', 'en'] as const;
export const defaultLocale = 'ar';
export const localePrefix = 'as-needed';
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  // hreflang is emitted in <head> and the sitemap (see src/lib/seo.ts); a third,
  // header-based copy from the middleware would only risk disagreeing with them.
  alternateLinks: false
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
