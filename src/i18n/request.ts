import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '../navigation';

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale || defaultLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(currentLocale as Locale)) notFound();

  return {
    locale: currentLocale,
    messages: (await import(`../../messages/${currentLocale}.json`)).default
  };
});
