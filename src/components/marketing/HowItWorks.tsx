"use client";

import { useTranslations } from 'next-intl';
import { CalendarCheck, BookOpen, GraduationCap } from 'lucide-react';
import { BookingCtaButton } from '@/components/booking/BookingCtaButton';

export default function HowItWorks() {
  const t = useTranslations('Marketing.howItWorks');
  const steps = [
    {
      icon: CalendarCheck,
      title: t('steps.bookTrial.title'),
      description: t('steps.bookTrial.description'),
      color: "border-brand-orange text-brand-orange"
    },
    {
      icon: BookOpen,
      title: t('steps.assessment.title'),
      description: t('steps.assessment.description'),
      color: "border-brand-violet text-brand-violet"
    },
    {
      icon: GraduationCap,
      title: t('steps.startLearning.title'),
      description: t('steps.startLearning.description'),
      color: "border-brand-yellow text-brand-yellow"
    }
  ];

  return (
    <section id="how-it-works" className="scroll-mt-28 bg-white py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">{t('title')}</h2>
          <p className="text-lg text-slate-600">{t('description')}</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative">
          <div className="absolute left-1/2 top-16 h-[calc(100%-8rem)] w-[2px] -translate-x-1/2 bg-brand-violet/15 md:hidden" />
          <div className="hidden md:block absolute top-[28%] left-[10%] right-[10%] h-[3px] bg-brand-violet/15 -z-10" />

          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center max-w-xs space-y-6">
              <div className={`w-24 h-24 rounded-full border-4 ${step.color} bg-white flex items-center justify-center shadow-lg relative group overflow-hidden transition-all duration-300 hover:scale-110`}>
                <step.icon className="w-10 h-10" />
                <div className="absolute top-0 right-0 bg-slate-100 text-slate-400 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner">
                  0{idx + 1}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <BookingCtaButton source="how_it_works_cta" className="rounded-full bg-brand-orange px-8 py-4 text-sm font-black text-white shadow-premium transition-all hover:opacity-90">
            {t('cta')}
          </BookingCtaButton>
        </div>
      </div>
    </section>
  );
}
