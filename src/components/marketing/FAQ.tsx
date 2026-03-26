"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/site';

export default function FAQ() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations('Marketing.faq');
  const whatsAppUrl = getWhatsAppUrl(locale);
  const faqs = [
    {
      q: t('items.ages.question'),
      a: t('items.ages.answer')
    },
    {
      q: t('items.format.question'),
      a: t('items.format.answer')
    },
    {
      q: t('items.mentalMath.question'),
      a: t('items.mentalMath.answer')
    },
    {
      q: t('items.ucmath.question'),
      a: t('items.ucmath.answer')
    },
    {
      q: t('items.progress.question'),
      a: t('items.progress.answer')
    },
    {
      q: t('items.schedule.question'),
      a: t('items.schedule.answer')
    },
    {
      q: t('items.languages.question'),
      a: t('items.languages.answer')
    }
  ];

  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-12 md:py-24 bg-white border-t border-slate-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{t('title')}</h2>
          <p className="text-lg text-slate-600">{t('description')}</p>
        </div>

        <div className="space-y-4 font-bold text-slate-800">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`border rounded-2xl transition-all duration-300 ${activeIdx === idx ? 'border-brand-violet ring-4 ring-brand-violet/5 bg-brand-violet/[0.02]' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
            >
              <button
                onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left"
                aria-expanded={activeIdx === idx}
                aria-controls={`faq-panel-${idx}`}
                id={`faq-trigger-${idx}`}
              >
                <div className="flex gap-4 items-center">
                  <HelpCircle className={`w-5 h-5 ${activeIdx === idx ? 'text-brand-violet' : 'text-slate-400'}`} />
                  <span className="text-base font-black tracking-tight">{faq.q}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${activeIdx === idx ? 'rotate-180 text-brand-violet' : 'text-slate-400'}`} />
              </button>

              {activeIdx === idx && (
                <div
                  id={`faq-panel-${idx}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${idx}`}
                  className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-4 duration-300"
                >
                  <p className="text-sm font-medium leading-relaxed text-slate-500 border-t pt-4">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center space-y-4 p-8 bg-brand-orange/5 border border-brand-orange/10 rounded-3xl">
          <h4 className="text-lg font-black text-brand-orange">{t('ctaTitle')}</h4>
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex px-10 py-3 bg-brand-orange text-white rounded-full font-black text-sm hover:opacity-90 transition-all shadow-lg hover:scale-105"
          >
            {t('ctaButton')}
          </a>
        </div>
      </div>
    </section>
  );
}
