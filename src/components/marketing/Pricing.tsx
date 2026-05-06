"use client";

import { useTranslations } from 'next-intl';
import { Check, Info } from 'lucide-react';
import { BookingCtaButton } from '@/components/booking/BookingCtaButton';
import { useGeoPricing } from '@/components/pricing/GeoPricingProvider';

export default function Pricing() {
  const common = useTranslations('Common');
  const t = useTranslations('Marketing.pricing');
  const {
    currency,
    detectedCountry,
    plans,
    selectedCountry,
    selectionMode,
    setCountrySelection,
    supportedCountries,
  } = useGeoPricing();

  const features = [
    t('features.sessionsPerMonth'),
    t('features.sessionsPerWeek'),
    t('features.sessionLength'),
    t('features.oneToOneFocus')
  ];

  return (
    <section id="pricing" className="scroll-mt-28 py-12 md:py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/4 h-full bg-brand-violet/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{t('title')}</h2>
          <p className="text-lg text-slate-600">{t('description')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-8 border ${plan.isPopular ? 'border-brand-violet ring-2 ring-brand-violet/20' : 'border-slate-100'} shadow-sm relative group transition-all duration-300 hover:shadow-premium`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-violet text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  {t('mostPopular')}
                </div>
              )}

              <div className="text-center mb-8 border-b pb-6 border-slate-50">
                <h3 className="text-lg font-black text-slate-900 mb-2 whitespace-nowrap">
                  {t('packageLabel', { months: plan.months })}
                </h3>
                <div className="text-4xl font-black text-brand-violet mt-4">
                  {t('priceLabel', { price: plan.price, currency })}
                </div>
                {plan.savingsPercent > 0 && (
                  <div className="text-[10px] font-black text-brand-orange bg-brand-orange/10 rounded-full inline-block mt-2 px-3 py-1">
                    {t('savePercent', { percent: plan.savingsPercent })}
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-5 h-5 text-brand-orange shrink-0" strokeWidth={3} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <BookingCtaButton source={`pricing_${selectedCountry}_${plan.months}_months`} className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${plan.isPopular ? 'bg-brand-violet text-white hover:opacity-90' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} flex items-center justify-center gap-2`}>
                {common('startWithFreeTrial')}
              </BookingCtaButton>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
