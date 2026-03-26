"use client";

import { useTranslations, useLocale } from 'next-intl';
import { BookingCtaButton } from '@/components/booking/BookingCtaButton';
import { Link, usePathname, useRouter } from '@/navigation';
import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLocale = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };
  const menuAriaLabel = isMenuOpen
    ? locale === "ar" ? "إغلاق قائمة التنقل" : "Close navigation menu"
    : locale === "ar" ? "فتح قائمة التنقل" : "Open navigation menu";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-premium">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-2xl font-black tracking-tight">
          <span className="text-brand-orange">i</span>
          <span className="text-brand-violet text-3xl">Math</span>
          <div className="w-2 h-2 rounded-full bg-brand-yellow mb-4" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-bold text-sm">
          <Link href="#why-imath" className="text-muted-foreground hover:text-brand-violet transition-colors">{t('sections.whyImath')}</Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-brand-violet transition-colors">{t('sections.howItWorks')}</Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-brand-violet transition-colors">{t('sections.pricing')}</Link>
          <Link href="#faq" className="text-muted-foreground hover:text-brand-violet transition-colors">{t('sections.faq')}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLocale}
            className="p-2 rounded-full hover:bg-muted flex items-center gap-2 text-xs font-bold transition-colors"
            title={locale === 'ar' ? t('switchToEnglish') : t('switchToArabic')}
            aria-label={locale === 'ar' ? t('switchToEnglish') : t('switchToArabic')}
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{locale === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          <BookingCtaButton source="header_desktop" className="hidden sm:block px-6 py-2.5 bg-brand-orange text-white rounded-full font-black text-sm hover:opacity-90 transition-all shadow-premium hover:scale-105">
            {t('bookFreeTrial')}
          </BookingCtaButton>

          <button
            className="md:hidden p-2 rounded-full hover:bg-muted"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={menuAriaLabel}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-nav" className="md:hidden bg-white border-b p-4 space-y-4 font-bold flex flex-col items-center">
          <Link href="#why-imath" onClick={() => setIsMenuOpen(false)}>{t('sections.whyImath')}</Link>
          <Link href="#how-it-works" onClick={() => setIsMenuOpen(false)}>{t('sections.howItWorks')}</Link>
          <Link href="#pricing" onClick={() => setIsMenuOpen(false)}>{t('sections.pricing')}</Link>
          <Link href="#faq" onClick={() => setIsMenuOpen(false)}>{t('sections.faq')}</Link>
          <BookingCtaButton source="header_mobile" className="w-full py-3 bg-brand-orange text-white rounded-full font-black">
            {t('bookFreeTrial')}
          </BookingCtaButton>
        </div>
      )}
    </header>
  );
}
