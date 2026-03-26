import { getTranslations } from 'next-intl/server';
import { ShieldCheck, Users, Target } from "lucide-react";

export default async function TrustSection() {
  const t = await getTranslations('Marketing.trustSection');

  return (
    <section id="why-imath" className="py-12 md:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative order-last group rounded-[4rem] bg-brand-violet/5 p-4 animate-in fade-in zoom-in duration-700 lg:order-first">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/30 rounded-full blur-3xl -z-10" />
            <div className="relative z-10 aspect-square rounded-[3.5rem] bg-slate-100 flex items-center justify-center p-12 overflow-hidden shadow-2xl border-4 border-white transition-transform group-hover:scale-[1.01]">
              <ShieldCheck className="w-1/2 h-1/2 text-brand-violet opacity-10 absolute rotate-12 -bottom-8 -right-8" />
              <div className="space-y-8 relative z-20">
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-premium flex items-center justify-center shrink-0">
                    <Target className="w-8 h-8 text-brand-orange" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-800">{t('focus.title')}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{t('focus.description')}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-premium flex items-center justify-center shrink-0">
                    <Users className="w-8 h-8 text-brand-violet" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-800">{t('tutors.title')}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{t('tutors.description')}</p>
                  </div>
                </div>
                <div className="flex gap-16 items-center pt-8 border-t border-slate-100">
                  <div className="text-center">
                    <div className="text-4xl font-black text-brand-violet">500+</div>
                    <div className="text-[10px] font-black uppercase text-slate-400">{t('stats.totalStudents')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-brand-orange">98%</div>
                    <div className="text-[10px] font-black uppercase text-slate-400">{t('stats.parentSatisfaction')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-first space-y-10 lg:order-last">
            <div className="space-y-4">
              <div className="text-brand-orange font-black text-sm uppercase tracking-widest flex items-center gap-4">
                <div className="h-[2px] w-12 bg-brand-orange" />
                {t('eyebrow')}
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                {t.rich('title', {
                  highlight: (chunks) => (
                    <span className="text-brand-violet underline decoration-brand-yellow decoration-8 underline-offset-8">
                      {chunks}
                    </span>
                  ),
                })}
              </h2>
            </div>

            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              {t('description')}
            </p>

            <div className="p-8 bg-slate-50 border-l-8 border-brand-violet rounded-r-3xl space-y-4">
              <p className="text-slate-800 font-bold leading-relaxed italic">
                &quot;{t('quote.text')}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-violet/10 text-brand-violet flex items-center justify-center text-[10px] font-black">SL</div>
                <span className="text-xs font-black text-slate-400">{t('quote.author')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
