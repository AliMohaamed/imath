import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['ar', 'en'] as const;
export const defaultLocale = 'ar';
export const localePrefix = 'as-needed';
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
