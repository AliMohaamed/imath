import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { locales, defaultLocale } from '../navigation';

export default getRequestConfig(async ({ locale, requestLocale }) => {
  // `locale` is set when a caller passes one explicitly (getTranslations({ locale })); otherwise
  // use the [locale] segment registered by setRequestLocale() in the locale layout.
  const requested = locale ?? (await requestLocale);
  const currentLocale = hasLocale(locales, requested) ? requested : defaultLocale;

  return {
    locale: currentLocale,
    messages: (await import(`../../messages/${currentLocale}.json`)).default
  };
});
