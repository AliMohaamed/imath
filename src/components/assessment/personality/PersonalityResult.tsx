"use client";

import { useMemo, type Ref } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { RotateCcw, Sparkles } from "lucide-react";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { ReportDownload } from "@/components/assessment/personality/ReportDownload";
import { SpectrumBars } from "@/components/assessment/personality/SpectrumBars";
import type { AssessmentLocale, ChildGender } from "@/lib/assessment/common";
import { buildReport } from "@/lib/assessment/personality/report";
import { isCompleteAnswerSet, scoreAnswers, type PersonalityProfile } from "@/lib/assessment/personality/scoring";
import { trackEvent } from "@/lib/analytics";
import { saveBookingPrefill, savePrefill, type FamilyDetails } from "@/lib/assessment/storage";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";
import { getLocalePath } from "@/lib/site";

const PROFILE_ICONS: Record<PersonalityProfile, string> = {
  precision: "/assessment/bullseye.png",
  speed: "/assessment/high-voltage.png",
  visualisation: "/assessment/artist-palette.png",
  logic: "/assessment/magnifying-glass-tilted-left.png",
};

const TRAIT_COLORS = ["bg-brand-yellow/30", "bg-brand-orange/15", "bg-brand-violet/10"];

export function PersonalityResult({
  name,
  gender,
  answers,
  family,
  onRetake,
  ref,
}: {
  name: string;
  gender: ChildGender;
  answers: number[];
  family: FamilyDetails;
  onRetake: () => void;
  ref?: Ref<HTMLHeadingElement>;
}) {
  const locale = useLocale() as AssessmentLocale;
  const t = useTranslations("Assessment.personality.result");

  const score = useMemo(() => (isCompleteAnswerSet(answers) ? scoreAnswers(answers) : null), [answers]);
  const report = useMemo(
    () => (score ? buildReport({ score, name, gender, locale }) : null),
    [score, name, gender, locale]
  );

  if (!score || !report) {
    return null;
  }

  // This component only renders in the browser (the flow mounts after hydration), so window is safe.
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${t("shareText", { name, profile: report.superpower })} ${window.location.origin}${getLocalePath(locale, "/assessment")}`
  )}`;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-10">
        <Image src={PROFILE_ICONS[report.profile]} alt="" width={112} height={112} className="mx-auto h-28 w-28" priority />
        <h1 ref={ref} tabIndex={-1} className="text-3xl font-black tracking-tight text-slate-900 outline-none md:text-4xl">
          {t("title", { name, profile: report.superpower })}
        </h1>
        <p className="text-lg font-black text-brand-violet">{report.variantTitle}</p>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600">
          <span className="font-black text-slate-900">{t("weThink", { name })}</span> {report.tagline}.
        </p>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-700">{report.overview}</p>
      </div>

      <ReportDownload report={report} />

      <Section title={t("traitsTitle")}>
        <div className="grid gap-3 md:grid-cols-3">
          {report.traits.map((trait, index) => (
            <div key={trait.title} className={cn("rounded-3xl p-5", TRAIT_COLORS[index])}>
              <h3 className="font-black text-slate-900">{trait.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{trait.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("howThinks", { name })}>
        <SpectrumBars score={score} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {report.dimensions.map((dimension) => (
            <div key={dimension.dimension} className="rounded-3xl border border-slate-200 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-brand-orange">
                {t(`strength.${dimension.strength}`)} · {t(`poles.${dimension.pole}`)}
              </p>
              <h3 className="mt-1 font-black text-slate-900">{dimension.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{dimension.text}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {dimension.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-violet" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div className="rounded-[2rem] bg-brand-violet p-6 text-white shadow-sm md:p-8">
        <h2 className="text-xl font-black">{t("mathPowerTitle", { name })}</h2>
        <p className="mt-3 text-base leading-relaxed text-white/90">{report.mathPower}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ListCard title={t("strengths")} items={report.strengths} tone="bg-emerald-50 border-emerald-100" />
        <ListCard title={t("challenges")} items={report.challenges} tone="bg-amber-50 border-amber-100" />
      </div>

      <Section title={t("buildNext")}>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">{t("buildNextHint", { name })}</p>
        <ol className="space-y-3">
          {report.buildNext.map((power, index) => (
            <li key={power.power} className="flex gap-4 rounded-3xl bg-slate-50 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-lg font-black text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="font-black text-slate-900">{power.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{power.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title={t("parentTips")}>
          <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
            {report.parentTips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </Section>
        <Section title={t("learnAtImath", { name })}>
          <p className="text-sm leading-relaxed text-slate-700">{report.learnAtImath}</p>
        </Section>
      </div>

      <p className="rounded-[2rem] bg-brand-yellow/30 p-6 text-center text-base font-bold leading-relaxed text-slate-900 md:p-8">
        ✨ {report.closing}
      </p>

      <div className="space-y-4 rounded-[2rem] border border-brand-orange/30 bg-white p-6 text-center shadow-sm md:p-8">
        <p className="text-sm text-slate-600">{t("bookHint", { name })}</p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BookingCtaButton
            source="assessment_personality_result"
            onClick={() => {
              saveBookingPrefill({ ...family, source: "assessment_personality_result" });
              trackEvent("assessment_cta_booking", { type: "personality", profile: report.profile });
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
      </div>

      <div className="space-y-3 rounded-[2rem] bg-brand-violet/10 p-6 text-center md:p-8">
        <Link
          href="/assessment/level"
          onClick={() => savePrefill(family)}
          className="inline-block rounded-full bg-brand-violet px-8 py-3.5 text-sm font-black text-white shadow-premium transition-all hover:opacity-90"
        >
          {t("levelCta", { name })}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function ListCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: Array<{ title: string; text: string }>;
  tone: string;
}) {
  return (
    <section className={cn("space-y-4 rounded-[2rem] border p-6 md:p-8", tone)}>
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <ul className="space-y-4">
        {items.map((entry) => (
          <li key={entry.title}>
            <h3 className="font-black text-slate-900">{entry.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{entry.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
