import { useTranslations } from 'next-intl';
import { Brain, Zap, Target, Award } from "lucide-react";
import { BookingCtaButton } from '@/components/booking/BookingCtaButton';

export default function Benefits() {
  const t = useTranslations('Marketing.benefits');
  const benefits = [
    {
      title: t('items.focus.title'),
      description: t('items.focus.description'),
      icon: Target,
      color: "bg-brand-violet/10 text-brand-violet"
    },
    {
      title: t('items.progress.title'),
      description: t('items.progress.description'),
      icon: Zap,
      color: "bg-brand-orange/10 text-brand-orange"
    },
    {
      title: t('items.confidence.title'),
      description: t('items.confidence.description'),
      icon: Brain,
      color: "bg-brand-yellow/10 text-brand-yellow"
    },
    {
      title: t('items.excellence.title'),
      description: t('items.excellence.description'),
      icon: Award,
      color: "bg-slate-100 text-slate-600"
    }
  ];

  return (
    <section className="bg-slate-50 py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            {t.rich('title', {
              highlight: (chunks) => <span className="text-brand-violet">{chunks}</span>,
            })}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className={`group rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-premium ${idx === 0 ? 'border-brand-violet/20 bg-brand-violet/[0.03] lg:-translate-y-3' : 'border-slate-100 bg-white'}`}
            >
              <div className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">0{idx + 1}</div>
              <div className={`w-14 h-14 ${benefit.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <benefit.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-4 text-slate-800 tracking-tight">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <BookingCtaButton source="benefits_cta" className="rounded-full bg-brand-orange px-8 py-4 text-sm font-black text-white shadow-premium transition-all hover:opacity-90">
            {t('cta')}
          </BookingCtaButton>
        </div>
      </div>
    </section>
  );
}
