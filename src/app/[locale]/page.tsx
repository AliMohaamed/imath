import { BookingCtaButton } from '@/components/booking/BookingCtaButton';
import { BookingModalProvider } from '@/components/booking/BookingModalProvider';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Common');

  return (
    <BookingModalProvider>
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
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
            <button className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full font-bold hover:opacity-90 transition-opacity">
              {t('contactUs')}
            </button>
          </div>
        </div>
      </main>
    </BookingModalProvider>
  );
}
