"use client";

import { useTranslations } from 'next-intl';
import { ArrowRight, Star } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('Marketing.hero');
  const common = useTranslations('Common');

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
              <button className="px-10 py-4 bg-brand-orange text-white rounded-full font-black text-lg hover:opacity-90 transition-all shadow-premium hover:scale-105 flex items-center justify-center gap-2">
                {common('bookFreeTrial')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </button>
              <button className="px-10 py-4 border-2 border-slate-200 text-slate-900 rounded-full font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
                {common('learnMore')}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('trustBadges.certifiedTutors')}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('trustBadges.bilingualSupport')}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('trustBadges.oneToOneSessions')}</div>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative group animate-in fade-in zoom-in duration-1000 delay-200">
             <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white group-hover:scale-[1.02] transition-transform duration-500">
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-violet/15 via-white to-brand-orange/15 flex items-center justify-center p-8">
                  <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-xl backdrop-blur">
                    <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-violet text-2xl font-black text-white">
                        iM
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-24 rounded-full bg-brand-yellow/70" />
                        <div className="h-3 w-40 rounded-full bg-slate-200" />
                      </div>
                    </div>
                    <div className="mt-8 space-y-4">
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <div className="text-sm font-black text-slate-900">{t('placeholder.cardTitle')}</div>
                        <div className="mt-2 text-sm text-slate-500">{t('placeholder.cardDescription')}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 rounded-2xl bg-brand-orange/15" />
                        <div className="h-20 rounded-2xl bg-brand-violet/15" />
                        <div className="h-20 rounded-2xl bg-brand-yellow/30" />
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
