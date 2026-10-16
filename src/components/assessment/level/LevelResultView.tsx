"use client";

import type { Ref } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { RotateCcw, Star } from "lucide-react";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Link } from "@/navigation";
import type { AssessmentLocale } from "@/lib/assessment/common";
import type { LevelResult } from "@/lib/assessment/level/engine";
import { LEVELS, MAX_LEVEL } from "@/lib/assessment/level/levels";
import { trackEvent } from "@/lib/analytics";
import { experienceForLevel, saveBookingPrefill, type FamilyDetails } from "@/lib/assessment/storage";
import { cn } from "@/lib/utils";
import { getLocalePath } from "@/lib/site";

export function LevelResultView({
  name,
  result,
  family,
  onRetake,
  ref,
}: {
  name: string;
  result: LevelResult;
  family: FamilyDetails;
  onRetake: () => void;
  ref?: Ref<HTMLHeadingElement>;
}) {
  const locale = useLocale() as AssessmentLocale;
  const t = useTranslations("Assessment.level.result");
  const level = result.placementLevel;
  const content = LEVELS[level];

  // This view only renders in the browser (the flow mounts after hydration), so window is safe.
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${t("shareText", { name, level })} ${window.location.origin}${getLocalePath(locale, "/assessment")}`
  )}`;

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-10">
        <Image src={level >= 5 ? "/assessment/trophy.png" : "/assessment/rocket.png"} alt="" width={112} height={112} className="mx-auto h-28 w-28" priority />
        <h1 ref={ref} tabIndex={-1} className="text-3xl font-black tracking-tight text-slate-900 outline-none md:text-4xl">
          {level === 0 ? t("titleZero", { name }) : t("title", { name, level })}
        </h1>
        <p className="text-xl font-black text-brand-violet">{content.name[locale]}</p>

        <div className="mx-auto grid max-w-sm grid-cols-2 gap-4">
          <div className="rounded-3xl bg-brand-yellow/30 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">{t("speed")}</p>
            <div className="mt-2 flex justify-center gap-1" role="img" aria-label={`${result.speedStars} / 3`}>
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={cn("h-7 w-7", star <= result.speedStars ? "fill-brand-orange text-brand-orange" : "text-slate-300")}
                />
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-brand-violet/10 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">{t("accuracy")}</p>
            <p className="mt-1 text-3xl font-black text-brand-violet" dir="ltr">
              {result.accuracy}%
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-black text-slate-900">{t("ladder")}</h2>
        <ol className="grid grid-cols-6 gap-2" dir="ltr">
          {Array.from({ length: MAX_LEVEL }, (_, index) => index + 1).map((step) => (
            <li
              key={step}
              aria-current={step === level ? "step" : undefined}
              className={cn(
                "flex flex-col items-center justify-end rounded-2xl px-1 py-3 text-center text-sm font-black",
                step <= level ? "bg-brand-violet text-white" : "bg-slate-100 text-slate-400",
                step === level && "ring-4 ring-brand-orange/40"
              )}
              style={{ minHeight: 56 + step * 12 }}
            >
              {step}
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <ListCard title={t("canDo", { name })} items={content.canDo.map((item) => item[locale])} tone="bg-emerald-50 border-emerald-100" />
        <ListCard title={t("next")} items={content.next.map((item) => item[locale])} tone="bg-amber-50 border-amber-100" />
      </div>

      <div className="space-y-4 rounded-[2rem] border border-brand-orange/30 bg-white p-6 text-center shadow-sm md:p-8">
        <p className="text-base font-bold text-slate-900">{t("recommend", { name, topic: content.next[0][locale] })}</p>
        <p className="text-sm text-slate-600">{t("bookHint", { name })}</p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BookingCtaButton
            source="assessment_level_result"
            onClick={() => {
              saveBookingPrefill({
                ...family,
                previousExperience: experienceForLevel(level),
                source: "assessment_level_result",
              });
              trackEvent("assessment_cta_booking", { type: "level", level });
            }}
            className="rounded-full bg-brand-orange px-8 py-3.5 text-sm font-black text-white shadow-premium transition-all hover:opacity-90"
          >
            {t("bookCta", { name })}
          </BookingCtaButton>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3.5 text-sm font-black text-slate-900 transition-colors hover:bg-slate-50"
          >
            <WhatsAppIcon size={18} />
            {t("share")}
          </a>
        </div>
        <Link
          href="/assessment/personality"
          className="inline-block text-sm font-black text-brand-violet underline-offset-4 hover:underline"
        >
          {t("personalityCta", { name })}
        </Link>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="max-w-xl text-xs leading-relaxed text-slate-400">{t("disclaimer")}</p>
        <Button variant="ghost" onClick={onRetake}>
          <RotateCcw className="me-2 h-4 w-4" />
          {t("retake")}
        </Button>
      </div>
    </div>
  );
}

function ListCard({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <section className={cn("space-y-4 rounded-[2rem] border p-6 md:p-8", tone)}>
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-violet" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
