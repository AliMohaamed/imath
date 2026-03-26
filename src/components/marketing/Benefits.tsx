import { useTranslations } from 'next-intl';
import { Brain, Zap, Target, Award } from "lucide-react";

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
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
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
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-premium hover:-translate-y-2 transition-all duration-300 group"
            >
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
      </div>
    </section>
  );
}
