"use client";

import { useTranslations } from 'next-intl';
import { CalendarCheck, BookOpen, GraduationCap } from 'lucide-react';

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
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t('title')}</h2>
          <p className="text-lg text-slate-600">{t('description')}</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative">
          <div className="hidden md:block absolute top-[28%] left-[10%] right-[10%] h-[2px] bg-slate-100 -z-10" />

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
      </div>
    </section>
  );
}
