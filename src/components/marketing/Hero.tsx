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
                className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 px-10 py-4 text-lg font-black text-slate-900 transition-all hover:bg-slate-50"
              >
                <MessageCircle className="h-5 w-5" />
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
