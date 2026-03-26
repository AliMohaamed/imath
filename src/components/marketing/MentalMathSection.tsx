"use client";

import { useTranslations } from "next-intl";
import { Brain, Gauge, Sparkles } from "lucide-react";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";

export default function MentalMathSection() {
  const t = useTranslations("Marketing.mentalMathSection");
  const items = [
    { key: "speed", icon: Gauge },
    { key: "focus", icon: Brain },
    { key: "method", icon: Sparkles },
  ] as const;

  return (
    <section className="bg-white py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="text-sm font-black uppercase tracking-[0.18em] text-brand-orange">
            {t("eyebrow")}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {t.rich("title", {
              highlight: (chunks) => <span className="text-brand-violet">{chunks}</span>,
            })}
          </h2>
          <p className="text-lg leading-relaxed text-slate-600">{t("description")}</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.key} className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-violet/10 text-brand-violet">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">{t(`points.${item.key}.title`)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{t(`points.${item.key}.description`)}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <BookingCtaButton source="mental_math_section_cta" className="rounded-full bg-brand-orange px-8 py-4 text-sm font-black text-white shadow-premium transition-all hover:opacity-90">
            {t("cta")}
          </BookingCtaButton>
        </div>
      </div>
    </section>
  );
}
