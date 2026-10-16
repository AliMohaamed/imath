"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const CARDS = [
  { key: "personality", href: "/assessment/personality", image: "/assessment/brain.png", accent: "bg-brand-violet", tint: "bg-brand-violet/5" },
  { key: "level", href: "/assessment/level", image: "/assessment/rocket.png", accent: "bg-brand-orange", tint: "bg-brand-orange/5" },
] as const;

/** Home-page entry to the two free assessments. */
export default function AssessmentPromo() {
  const t = useTranslations("Marketing.assessmentPromo");

  return (
    <section id="free-assessment" className="scroll-mt-28 bg-white py-12 md:py-24" aria-labelledby="assessment-promo-title">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="text-sm font-black uppercase tracking-[0.18em] text-brand-orange">{t("eyebrow")}</div>
          <h2 id="assessment-promo-title" className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg leading-relaxed text-slate-600">{t("description")}</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
          {CARDS.map((card) => (
            <article key={card.key} className={cn("flex flex-col rounded-[2rem] border border-slate-200 p-6 md:p-8", card.tint)}>
              <Image src={card.image} alt="" width={80} height={80} className="h-20 w-20" />
              <h3 className="mt-4 text-xl font-black text-slate-900 md:text-2xl">{t(`${card.key}.title`)}</h3>
              <p className="mt-2 flex-grow text-sm leading-relaxed text-slate-600">{t(`${card.key}.text`)}</p>
              <Link
                href={card.href}
                onClick={() => trackEvent("assessment_start", { type: card.key, from: "home_promo" })}
                className={cn(
                  "mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-black text-white shadow-premium transition-all hover:opacity-90 active:scale-95",
                  card.accent
                )}
              >
                {t(`${card.key}.cta`)}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
