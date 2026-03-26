"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, MessageCircle, Star, Zap } from "lucide-react";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import { getWhatsAppUrl } from "@/lib/site";

export default function Hero() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("Marketing.hero");
  const common = useTranslations("Common");
  const whatsAppUrl = getWhatsAppUrl(locale);
  const WaIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.49" />
  </svg>
);

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-12 md:pt-24 md:pb-32">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-brand-violet/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-96 w-96 rounded-full bg-brand-orange/5 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-2xl space-y-6 text-center animate-in fade-in slide-in-from-bottom duration-1000 lg:text-left rtl:lg:text-right">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-violet/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-violet">
              <Star className="h-3.5 w-3.5 fill-current" />
              {t("badge")}
            </div>

            <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-6xl">
              {t.rich("title", {
                highlight: (chunks) => <span className="text-brand-violet">{chunks}</span>,
              })}
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg md:mx-0 md:text-xl">
              {t("description")}
            </p>

            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row lg:justify-start">
              <BookingCtaButton source="hero_primary" className="flex items-center justify-center gap-2 rounded-full bg-brand-orange px-10 py-4 text-lg font-black text-white shadow-premium transition-all hover:scale-105 hover:opacity-90">
                {common("bookFreeTrial")}
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </BookingCtaButton>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border-2 border-[#25D366] px-10 py-4 text-lg font-black text-[#25D366] transition-all hover:bg-[#25D366]/5 sm:w-auto"
              >
                <WaIcon />
                {common("contactViaWhatsApp")}
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 lg:justify-start lg:gap-4">
              <div className="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600">
                {t("trustBadges.certifiedTutors")}
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600">
                {t("trustBadges.bilingualSupport")}
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600">
                {t("trustBadges.oneToOneSessions")}
              </div>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold uppercase tracking-widest text-brand-orange underline-offset-4 hover:underline"
              >
                {common("contactUs")}
              </a>
            </div>
          </div>

          <div className="relative group animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative z-10 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-brand-violet to-brand-orange p-6 text-white shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
              <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                    <Zap className="h-4 w-4" />
                    {t("visual.eyebrow")}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black leading-tight sm:text-3xl">{t("visual.title")}</h3>
                    <p className="text-sm leading-relaxed text-white/80 sm:text-base">{t("visual.description")}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["speed", "accuracy", "focus"] as const).map((item) => (
                      <div key={item} className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur-sm">
                        <div className="text-lg font-black text-brand-yellow">{t(`visual.metrics.${item}.value`)}</div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                          {t(`visual.metrics.${item}.label`)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] bg-white/10 p-4 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                      <Image src="/logo.png" alt="iMath" fill sizes="56px" className="object-contain p-2" priority />
                    </div>
                    <div>
                      <div className="text-sm font-black">{t("floatingBadge.count")}</div>
                      <div className="text-xs text-white/75">{t("floatingBadge.text")}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["8", "15", "24", "42", "56", "63", "71", "88"].map((value) => (
                      <div key={value} className="rounded-xl bg-white py-3 text-center text-sm font-black text-slate-900 shadow-sm">
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 -z-10 h-1/2 w-1/2 rounded-3xl bg-brand-yellow/20" />
            <div className="absolute -bottom-6 -left-6 -z-10 h-1/3 w-1/3 rounded-full bg-brand-orange/20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
