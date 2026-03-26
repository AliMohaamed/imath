import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { BookingCtaButton } from '@/components/booking/BookingCtaButton';
import { BookingModalProvider } from '@/components/booking/BookingModalProvider';
import { GeoPricingProvider } from '@/components/pricing/GeoPricingProvider';
import { getWhatsAppUrl } from '@/lib/site';
import {
  DETECTED_COUNTRY_COOKIE,
  getInitialCountrySelection,
  OVERRIDE_COUNTRY_COOKIE,
} from '@/lib/pricing';

export default async function Home() {
  const locale = (await getLocale()) as "ar" | "en";
  const t = await getTranslations('Common');
  const cookieStore = await cookies();
  const geoState = getInitialCountrySelection({
    detectedCountry: cookieStore.get(DETECTED_COUNTRY_COOKIE)?.value,
    overrideCountry: cookieStore.get(OVERRIDE_COUNTRY_COOKIE)?.value,
  });

  const whatsAppUrl = getWhatsAppUrl(locale);

  return (
    <GeoPricingProvider
      initialDetectedCountry={geoState.detectedCountry}
      initialSelectedCountry={geoState.selectedCountry}
      initialSelectionMode={geoState.selectionMode}
    >
      <BookingModalProvider>
        <main id="main-content" className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-black text-primary tracking-tight">
              {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Welcome to iMath. The foundation is set for modern, bilingual learning.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <BookingCtaButton source="locale_home" className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-opacity">
                {t('bookFreeTrial')}
              </BookingCtaButton>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                {t('contactUs')}
              </a>
            </div>
          </div>
        </main>
      </BookingModalProvider>
    </GeoPricingProvider>
  );
}
