"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, Clock, FileDown, Gauge, History, Sparkles, Star, Users, Zap } from "lucide-react";
import { Link } from "@/navigation";
import { trackEvent } from "@/lib/analytics";
import { pick, type AssessmentLocale } from "@/lib/assessment/common";
import { LEVELS, MAX_LEVEL } from "@/lib/assessment/level/levels";
import { PROFILES } from "@/lib/assessment/personality/profiles";
import { DIMENSION_POLES, DIMENSIONS, QUESTION_COUNT } from "@/lib/assessment/personality/questions";
import type { PersonalityProfile } from "@/lib/assessment/personality/scoring";
import type { AssessmentKind } from "@/lib/assessment/storage";
import { useAssessmentStatus } from "@/lib/assessment/useAssessmentStatus";
import { cn } from "@/lib/utils";

const PROFILE_ICONS: Record<PersonalityProfile, string> = {
  precision: "/assessment/bullseye.png",
  speed: "/assessment/high-voltage.png",
  visualisation: "/assessment/artist-palette.png",
  logic: "/assessment/magnifying-glass-tilted-left.png",
};

/** Illustrative split for the sample report preview; mirrors the real result's spectrum bars. */
const SAMPLE_SPLIT: Record<(typeof DIMENSIONS)[number], number> = { EI: 35, SN: 70, TF: 55, JP: 25 };
const SPECTRUM_COLORS = {
  EI: "bg-brand-violet",
  SN: "bg-brand-orange",
  TF: "bg-emerald-500",
  JP: "bg-sky-500",
} as const;

const LADDER = Array.from({ length: MAX_LEVEL }, (_, index) => index + 1);

function StatusBadge({ status }: { status: ReturnType<typeof useAssessmentStatus> }) {
  const t = useTranslations("Assessment.hub");
  if (status === "none") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black",
        status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
      )}
    >
      {status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
      {status === "completed" ? t("completed") : t("inProgress")}
    </span>
  );
}

function PreviewHeading({ children, tone }: { children: React.ReactNode; tone: "violet" | "orange" }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-sm font-black",
        tone === "violet" ? "text-brand-violet" : "text-brand-orange"
      )}
    >
      <Sparkles className="h-4 w-4" />
      {children}
    </p>
  );
}

export function AssessmentHub() {
  const t = useTranslations("Assessment.hub");
  const poles = useTranslations("Assessment.personality.result.poles");
  const locale = useLocale() as AssessmentLocale;
  const statuses: Record<AssessmentKind, ReturnType<typeof useAssessmentStatus>> = {
    personality: useAssessmentStatus("personality"),
    level: useAssessmentStatus("level"),
  };

  useEffect(() => {
    trackEvent("assessment_view", { page: "hub" });
  }, []);

  const hasUnfinished = Object.values(statuses).includes("in_progress");

  const cta = (kind: AssessmentKind, href: string, className: string) => (
    <Link
      href={href}
      className={cn(
        "group/cta inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-black text-white shadow-premium sm:px-8 transition-all hover:scale-[1.02] hover:opacity-95 focus-visible:outline-none focus-visible:ring-4 active:scale-95 sm:w-auto",
        className
      )}
      onClick={() => trackEvent("assessment_start", { type: kind, from: "hub", status: statuses[kind] })}
    >
      {statuses[kind] === "completed" ? t("viewResult") : t(`${kind}.cta`)}
      <ArrowRight className="h-5 w-5 transition-transform group-hover/cta:translate-x-1 rtl:rotate-180 rtl:group-hover/cta:-translate-x-1" />
    </Link>
  );

  return (
    <section className="relative overflow-hidden bg-white pb-16 pt-10 md:pb-28 md:pt-20" aria-labelledby="assessment-title">
      <div className="pointer-events-none absolute -end-24 -top-24 h-96 w-96 rounded-full bg-brand-violet/5 blur-3xl" />
      <div className="pointer-events-none absolute -start-24 top-1/2 h-96 w-96 rounded-full bg-brand-orange/5 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl px-4">
        {/* Hero */}
        <div className="relative mx-auto max-w-3xl text-center">
          <Image
            src="/assessment/light-bulb.png"
            alt=""
            width={72}
            height={72}
            className="absolute -start-6 top-2 hidden h-16 w-16 -rotate-12 lg:-start-24 lg:block"
          />
          <Image
            src="/assessment/puzzle-piece.png"
            alt=""
            width={72}
            height={72}
            className="absolute -end-6 top-24 hidden h-14 w-14 rotate-12 lg:-end-24 lg:block"
          />

          <h1
            id="assessment-title"
            className="text-balance text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl"
          >
            {t.rich("heading", {
              highlight: (chunks) => <span className="text-brand-violet">{chunks}</span>,
            })}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-slate-600 md:text-xl">
            {t("subtitle")}
          </p>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 sm:gap-3">
            <li className="rounded-full bg-brand-yellow/30 px-4 py-2 text-slate-900">{t("free")}</li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2">
              <Clock className="h-3.5 w-3.5" />
              {t("minutes")}
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2">
              <History className="h-3.5 w-3.5" />
              {t("saveAnytime")}
            </li>
          </ul>
        </div>

        {hasUnfinished ? (
          <p
            role="status"
            className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 rounded-2xl bg-brand-violet/10 px-4 py-3 text-center text-sm font-bold text-brand-violet"
          >
            <History className="h-4 w-4 shrink-0" />
            {t("continueHint")}
          </p>
        ) : null}

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-0">
          {/* Personality — for the parent */}
          <article className="flex flex-col overflow-hidden rounded-[2.5rem] lg:row-span-2 lg:grid lg:grid-rows-subgrid border border-brand-violet/15 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-violet/10">
            <div className="flex flex-col p-6 sm:p-8 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <Image src="/assessment/brain.png" alt="" width={112} height={112} className="h-20 w-20 sm:h-24 sm:w-24" priority />
                <StatusBadge status={statuses.personality} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-black">
                <span className="rounded-full bg-brand-violet/10 px-3 py-1 text-brand-violet">{t("personality.label")}</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  {t("personality.forWho")}
                </span>
                <span className="text-slate-500">{t("questions", { count: QUESTION_COUNT })}</span>
              </div>

              <h2 className="mt-4 text-balance text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">
                {t("personality.question")}
              </h2>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-slate-600">{t("personality.description")}</p>
              <div className="mt-7">{cta("personality", "/assessment/personality", "bg-brand-violet focus-visible:ring-brand-violet/30")}</div>
            </div>

            {/* Result preview */}
            <div className="mt-auto space-y-6 border-t lg:mt-0 border-brand-violet/10 bg-brand-violet/[0.04] p-6 sm:p-8 md:px-10">
              <div className="flex items-center justify-between gap-3">
                <PreviewHeading tone="violet">{t("yourResult")}</PreviewHeading>
                <span className="rounded-full border border-brand-violet/20 px-2.5 py-0.5 text-[11px] font-black text-brand-violet/80">
                  {t("sample")}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700">{t("personality.profiles")}</p>
                <ul className="mt-3 grid grid-cols-2 gap-2">
                  {(Object.keys(PROFILES) as PersonalityProfile[]).map((profile) => (
                    <li key={profile} className="flex flex-col items-start gap-1.5 rounded-2xl bg-white px-3 py-2.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-2 shadow-sm ring-1 ring-brand-violet/10">
                      <Image src={PROFILE_ICONS[profile]} alt="" width={32} height={32} className="h-7 w-7 shrink-0" />
                      <span className="min-w-0 break-words text-sm font-black text-slate-900">{pick(PROFILES[profile].superpower, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700">{t("personality.traits")}</p>
                <ul className="mt-3 space-y-2.5" aria-hidden="true">
                  {DIMENSIONS.map((dimension) => {
                    const [first, second] = DIMENSION_POLES[dimension];
                    const split = SAMPLE_SPLIT[dimension];
                    return (
                      <li key={dimension} className="grid grid-cols-[5.5rem_1fr_5.5rem] items-center gap-3 text-xs font-black text-slate-500" dir="ltr">
                        <bdi className={cn("truncate", split >= 50 && "text-slate-900")}>{poles(first)}</bdi>
                        <span className="flex h-2 overflow-hidden rounded-full bg-slate-200">
                          <span
                            className={cn("hub-bar h-full rounded-full", SPECTRUM_COLORS[dimension])}
                            style={{ width: `${split}%` }}
                          />
                        </span>
                        <bdi className={cn("truncate text-end", split < 50 && "text-slate-900")}>{poles(second)}</bdi>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <FileDown className="h-4 w-4 text-brand-violet" />
                {t("personality.pdf")}
              </p>
            </div>
          </article>

          {/* Level — for the child */}
          <article className="flex flex-col overflow-hidden rounded-[2.5rem] lg:row-span-2 lg:grid lg:grid-rows-subgrid border border-brand-orange/20 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-orange/10">
            <div className="flex flex-col p-6 sm:p-8 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <Image src="/assessment/rocket.png" alt="" width={112} height={112} className="h-20 w-20 sm:h-24 sm:w-24" priority />
                <StatusBadge status={statuses.level} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-black">
                <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-orange-700">{t("level.label")}</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  {t("level.forWho")}
                </span>
                <span className="text-slate-500">{t("level.adaptive")}</span>
              </div>

              <h2 className="mt-4 text-balance text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">
                {t("level.question")}
              </h2>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-slate-600">{t("level.description")}</p>
              <div className="mt-7">{cta("level", "/assessment/level", "bg-brand-orange focus-visible:ring-brand-orange/30")}</div>
            </div>

            {/* Result preview */}
            <div className="mt-auto space-y-6 border-t lg:mt-0 border-brand-orange/15 bg-brand-orange/[0.05] p-6 sm:p-8 md:px-10">
              <PreviewHeading tone="orange">{t("yourResult")}</PreviewHeading>

              <div>
                <p className="text-sm font-bold text-slate-700">
                  {t("level.ladder", { first: pick(LEVELS[1].name, locale), last: pick(LEVELS[MAX_LEVEL].name, locale) })}
                </p>
                <ol className="mt-14 flex h-36 items-end gap-2 sm:gap-3" aria-hidden="true">
                  {LADDER.map((level) => {
                    const top = level === MAX_LEVEL;
                    return (
                      <li key={level} className="relative flex flex-1 flex-col items-center justify-end" style={{ height: `${30 + level * 11.6}%` }}>
                        {top ? (
                          <Image src="/assessment/trophy.png" alt="" width={40} height={40} className="absolute -top-11 h-9 w-9" />
                        ) : null}
                        <span
                          className={cn(
                            "hub-step flex h-full w-full items-start justify-center rounded-t-2xl pt-2 text-sm font-black tabular-nums",
                            top ? "bg-brand-orange text-white" : "bg-brand-orange/15 text-orange-700"
                          )}
                          style={{ animationDelay: `${level * 70}ms` }}
                        >
                          {level}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <ul className="grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 shrink-0 text-brand-orange" />
                  {t("level.flash")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex shrink-0" aria-hidden="true">
                    {[0, 1, 2].map((star) => (
                      <Star key={star} className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                    ))}
                  </span>
                  {t("level.speed")}
                </li>
              </ul>
            </div>
          </article>
        </div>

        {/* How it works */}
        <div className="mx-auto mt-16 max-w-4xl md:mt-20">
          <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{t("steps.title")}</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {([
              { key: "info", icon: Users },
              { key: "answer", icon: Gauge },
              { key: "result", icon: Sparkles },
            ] as const).map(({ key, icon: Icon }, index) => (
              <li key={key} className="flex items-center gap-4 sm:flex-col sm:text-center">
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-brand-violet/20 bg-white text-brand-violet">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -end-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-violet text-[11px] font-black text-white tabular-nums">
                    {index + 1}
                  </span>
                </span>
                <span className="text-base font-black leading-snug text-slate-900">{t(`steps.${key}`)}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mx-auto mt-14 max-w-xl text-center text-xs leading-relaxed text-slate-500">{t("note")}</p>
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .hub-step { transform-origin: bottom; animation: hub-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
          .hub-bar { animation: hub-fill 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; transform-origin: left; }
        }
        @keyframes hub-rise { from { transform: scaleY(0.35); opacity: 0.4; } to { transform: scaleY(1); opacity: 1; } }
        @keyframes hub-fill { from { transform: scaleX(0.2); } to { transform: scaleX(1); } }
      `}</style>
    </section>
  );
}
