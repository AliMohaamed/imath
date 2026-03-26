"use client";

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Star } from 'lucide-react';
import { BookingCtaButton } from '@/components/booking/BookingCtaButton';
import { getWhatsAppUrl } from '@/lib/site';

export default function Hero() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations('Marketing.hero');
  const common = useTranslations('Common');
  const whatsAppUrl = getWhatsAppUrl(locale);

  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-brand-violet/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="max-w-2xl text-center lg:text-left rtl:lg:text-right space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-violet/10 text-brand-violet rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <Star className="w-3.5 h-3.5 fill-current" />
              {t('badge')}
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-slate-900">
              {t.rich('title', {
                highlight: (chunks) => <span className="text-brand-violet">{chunks}</span>,
              })}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t('description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <BookingCtaButton source="hero_primary" className="px-10 py-4 bg-brand-orange text-white rounded-full font-black text-lg hover:opacity-90 transition-all shadow-premium hover:scale-105 flex items-center justify-center gap-2">
                {common('bookFreeTrial')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </BookingCtaButton>
              <a
                href="#why-imath"
                className="px-10 py-4 border-2 border-slate-200 text-slate-900 rounded-full font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                {common('learnMore')}
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6 opacity-70 grayscale hover:grayscale-0 transition-all lg:justify-start lg:gap-8">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('trustBadges.certifiedTutors')}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('trustBadges.bilingualSupport')}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('trustBadges.oneToOneSessions')}</div>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold uppercase tracking-widest text-brand-orange underline-offset-4 hover:underline"
              >
                {common('contactUs')}
              </a>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative group animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group-hover:scale-[1.02] transition-transform duration-500 bg-white">
              <div className="aspect-[4/3] relative">
                <Image
                  src="/images/hero.png"
                  alt="iMath Student"
                  fill
                  priority
                  className="object-cover"
                />
                
                {/* Floating Badge on Image */}
                <div className="absolute bottom-6 right-6 left-6 md:left-auto bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                       ))}
                    </div>
                    <div className="text-sm font-black text-slate-900 leading-tight">
                       500+ <span className="text-brand-violet block text-xs">سعيد بانضمامه لـ iMath</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Background for Image */}
            <div className="absolute -top-6 -right-6 w-1/2 h-1/2 bg-brand-yellow/20 rounded-3xl -z-10 animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-1/3 h-1/3 bg-brand-orange/20 rounded-full -z-10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
