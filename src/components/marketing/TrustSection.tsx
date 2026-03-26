import { getTranslations } from "next-intl/server";
import { ShieldCheck, Users, Target } from "lucide-react";
import { Locale } from "@/navigation";

export default async function TrustSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ namespace: "Marketing.trustSection", locale });

  return (
    <section id="why-imath" className="py-12 md:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative order-last group rounded-[4rem] bg-brand-violet/5 p-4 animate-in fade-in zoom-in duration-700 lg:order-first">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/30 rounded-full blur-3xl -z-10" />
            <div className="relative z-10 aspect-square rounded-[3.5rem] bg-slate-900 flex items-center justify-center p-8 overflow-hidden shadow-2xl border-4 border-white transition-transform group-hover:scale-[1.01]">
              {/* CSS Abacus Visual */}
              <div className="w-full flex flex-col gap-6 md:gap-8 max-w-xs relative z-10">
                {[
                  { beads: [2, 1, 4], color: "bg-brand-violet" },
                  { beads: [4, 0, 3], color: "bg-brand-orange" },
                  { beads: [1, 2, 4], color: "bg-brand-yellow" },
                  { beads: [3, 1, 2], color: "bg-white" }
                ].map((row, rIdx) => (
                  <div key={rIdx} className="relative h-6 flex items-center">
                    <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full" />
                    <div className="relative w-full flex justify-between">
                      {row.beads.map((beadsCount, gIdx) => (
                        <div key={gIdx} className="flex gap-1.5">
                          {Array.from({ length: beadsCount }).map((_, bIdx) => (
                            <div 
                              key={bIdx} 
                              className={`h-6 w-6 rounded-full ${row.color} shadow-lg ring-2 ring-black/10 transition-transform duration-500 hover:scale-125 hover:rotate-12`}
                              style={{ 
                                transitionDelay: `${(rIdx * 100) + (bIdx * 50)}ms`,
                                transform: `translateX(${rIdx % 2 === 0 ? '10px' : '-10px'})`
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-8 grid grid-cols-2 gap-8 border-t border-white/10 mt-4">
                  <div className="text-center group-hover:scale-110 transition-transform duration-500">
                    <div className="text-3xl md:text-5xl font-black text-white">500+</div>
                    <div className="text-[9px] font-black uppercase text-white/40 tracking-widest">{t('stats.totalStudents')}</div>
                  </div>
                  <div className="text-center group-hover:scale-110 transition-transform duration-500 delay-75">
                    <div className="text-3xl md:text-5xl font-black text-brand-orange">98%</div>
                    <div className="text-[9px] font-black uppercase text-white/40 tracking-widest">{t('stats.parentSatisfaction')}</div>
                  </div>
                </div>
              </div>

              <ShieldCheck className="w-48 h-48 text-brand-violet opacity-5 absolute rotate-12 -bottom-12 -right-12 z-0" />
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
