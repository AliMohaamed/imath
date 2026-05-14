"use client";

import { useTranslations } from 'next-intl';
import { Check, Users } from 'lucide-react';
import { BookingCtaButton } from '@/components/booking/BookingCtaButton';
import { useGeoPricing } from '@/components/pricing/GeoPricingProvider';
import { EG_PLAN_DETAILS } from '@/lib/pricing';

export default function Pricing() {
  const common = useTranslations('Common');
  const t = useTranslations('Marketing.pricing');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tPlans = useTranslations('Marketing.pricing.plans') as any;
  const {
    currency,
    plans,
    selectedCountry,
  } = useGeoPricing();

  const isEG = selectedCountry === 'EG';

  return (
    <section id="pricing" className="scroll-mt-28 py-16 md:py-28 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-violet/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 space-y-3">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-lg text-slate-600">{t('description')}</p>
        </div>

        {/* Subtitle badge */}
        <div className="flex justify-center mb-14 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-primary text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-brand-violet/10 rounded-full shrink-0">
              <Users className="w-5 h-5 text-brand-violet" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span className="text-lg md:text-xl font-black leading-tight">
                {t('subtitleHighlight')}
              </span>
              <span className="text-sm md:text-md font-medium ">
                {t('subtitleText')}
              </span>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => {
            const detail = isEG ? EG_PLAN_DETAILS[idx] : null;
            const badge = detail?.badge ?? (plan.isPopular ? 'mostPopular' : null);
            const isFeatured = badge === 'mostPopular';
            const isBestValue = badge === 'bestValue';
            const isHighlighted = isFeatured || isBestValue;

            return (
              <div
                key={idx}
                className={`bg-white rounded-3xl border transition-all duration-300 hover:-translate-y-1 relative flex flex-col
                  ${isFeatured
                    ? 'border-brand-violet shadow-lg shadow-brand-violet/10 ring-2 ring-brand-violet/20'
                    : isBestValue
                      ? 'border-brand-orange shadow-lg shadow-brand-orange/10 ring-2 ring-brand-orange/20'
                      : 'border-slate-100 shadow-sm'
                  }`}
              >
                {/* Badge */}
                {badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-md whitespace-nowrap
                      ${isBestValue ? 'bg-brand-orange' : 'bg-brand-violet'}`}
                  >
                    {t(badge)}
                  </div>
                )}

                {/* Card body */}
                <div className="p-7 flex flex-col flex-1">
                  {/* Plan name */}
                  <h3 className={`text-sm font-bold mb-5 leading-snug
                    ${isHighlighted ? (isBestValue ? 'text-brand-orange' : 'text-brand-violet') : 'text-slate-700'}`}
                  >
                    {isEG && detail ? tPlans(detail.nameKey) : t('packageLabel', { months: plan.months })}
                  </h3>

                  {/* Price block */}
                  <div className="mb-4">
                    {/* Main price */}
                    <div className={`text-5xl font-black tracking-tight leading-none mb-1
                      ${isHighlighted ? (isBestValue ? 'text-brand-orange' : 'text-brand-violet') : 'text-slate-900'}`}
                    >
                      {t('priceLabel', { price: plan.price, currency })}
                    </div>

                    {/* Price per session row */}
                    {isEG && detail ? (
                      <div className="flex items-center gap-2 mt-2">
                        {/* Discounted per-session price */}
                        <span className={`text-sm font-bold
                          ${isHighlighted ? (isBestValue ? 'text-brand-orange' : 'text-brand-violet') : 'text-slate-600'}`}>
                          ≈ {detail.pricePerSession} {currency}/حصة
                        </span>
                        {/* Original per-session price (strikethrough) */}
                        {detail.originalPricePerSession && (
                          <span className="text-xs text-slate-400 line-through">
                            {detail.originalPricePerSession} {currency}/حصة
                          </span>
                        )}
                      </div>
                    ) : (
                      plan.savingsPercent > 0 && (
                        <div className="text-xs font-bold text-brand-orange bg-brand-orange/10 rounded-full inline-block mt-2 px-3 py-1">
                          {t('savePercent', { percent: plan.savingsPercent })}
                        </div>
                      )
                    )}
                  </div>

                  {/* Divider */}
                  <div className={`h-px mb-5 ${isHighlighted ? (isBestValue ? 'bg-brand-orange/15' : 'bg-brand-violet/15') : 'bg-slate-100'}`} />

                  {/* Sessions count */}
                  {isEG && detail && (
                    <p className={`text-sm font-semibold mb-4 text-center
                      ${isHighlighted ? (isBestValue ? 'text-brand-orange/80' : 'text-brand-violet/80') : 'text-slate-500'}`}
                    >
                      {t('sessionsCount', { sessions: detail.sessions })}
                    </p>
                  )}

                  {/* Features list */}
                  <ul className="space-y-3 mb-7 flex-1">
                    {isEG && detail ? (
                      detail.featuresKeys.map((key) => (
                        <li key={key} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                            ${isHighlighted
                              ? (isBestValue ? 'bg-brand-orange/10' : 'bg-brand-violet/10')
                              : 'bg-slate-100'}`}
                          >
                            <Check
                              className={`w-3 h-3
                                ${isHighlighted ? (isBestValue ? 'text-brand-orange' : 'text-brand-violet') : 'text-brand-orange'}`}
                              strokeWidth={3}
                            />
                          </span>
                          <span>{tPlans(key)}</span>
                        </li>
                      ))
                    ) : (
                      // Fallback generic features for non-EG countries
                      [
                        t('features.sessionsPerMonth'),
                        t('features.sessionsPerWeek'),
                        t('features.sessionLength'),
                        t('features.oneToOneFocus'),
                      ].map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-brand-orange" strokeWidth={3} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))
                    )}
                  </ul>

                  {/* CTA */}
                  <BookingCtaButton
                    source={`pricing_${selectedCountry}_${plan.months}_months`}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 mt-auto
                      ${isHighlighted
                        ? (isBestValue
                          ? 'bg-brand-orange text-white hover:opacity-90 shadow-md shadow-brand-orange/25'
                          : 'bg-brand-violet text-white hover:opacity-90 shadow-md shadow-brand-violet/25')
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                      }`}
                  >
                    {common('startWithFreeTrial')}
                  </BookingCtaButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
