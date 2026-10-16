/* eslint-disable @next/next/no-img-element -- plain <img> keeps the page capture simple and same-origin */
"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { AssessmentLocale } from "@/lib/assessment/common";
import { PDF_PAGE_PX } from "@/lib/assessment/pdf";
import type { PersonalityReport } from "@/lib/assessment/personality/report";
import type { PersonalityProfile } from "@/lib/assessment/personality/scoring";
import { SITE_EMAIL, SITE_PHONE_NUMBER } from "@/lib/site";
import { cn } from "@/lib/utils";

const PAGE_COUNT = 7;

const PROFILE_ICONS: Record<PersonalityProfile, string> = {
  precision: "/assessment/bullseye.png",
  speed: "/assessment/high-voltage.png",
  visualisation: "/assessment/artist-palette.png",
  logic: "/assessment/magnifying-glass-tilted-left.png",
};

const DIMENSION_COLORS = {
  EI: "#7c3aed",
  SN: "#f97316",
  TF: "#10b981",
  JP: "#0ea5e9",
} as const;

/**
 * The seven A4 pages of the downloadable report, laid out at 794 x 1123 px and captured by the
 * PDF exporter. Everything is sized in pixels on purpose so the capture matches the page exactly.
 */
export function ReportPages({
  report,
  locale,
  qrDataUrl,
  siteUrl,
}: {
  report: PersonalityReport;
  locale: AssessmentLocale;
  qrDataUrl: string;
  siteUrl: string;
}) {
  const t = useTranslations("Assessment.personality");
  const r = (key: string, values?: Record<string, string>) => t(`result.${key}`, values);
  const name = report.name;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={locale} className="text-start font-sans">
      {/* 1 · Cover */}
      <Page>
        <div
          className="relative overflow-hidden"
          style={{ height: 760, background: "linear-gradient(160deg,#ede9fe 0%,#fbcfe8 55%,#fde68a 100%)" }}
        >
          <div className="absolute -top-28 -start-28 h-96 w-96 rounded-full bg-white/40" />
          <div className="absolute top-72 -end-24 h-72 w-72 rounded-full bg-brand-violet/10" />
          <div className="absolute bottom-16 -start-16 h-56 w-56 rounded-full bg-brand-orange/15" />
          <img src="/assessment/glowing-star.png" alt="" className="absolute end-12 top-[330px] h-24 w-24 rotate-12" />
          <img src="/assessment/puzzle-piece.png" alt="" className="absolute start-12 top-64 h-20 w-20 -rotate-12" />

          <div className="absolute inset-x-0 top-16 px-12 text-center">
            <p className="text-[24px] font-black uppercase tracking-[0.25em] text-brand-violet">
              {t("pdf.coverEyebrow", { profile: report.superpower })}
            </p>
            <h1 className="mt-5 text-[66px] font-black uppercase leading-[1.05] text-slate-900">{report.title}</h1>
            <p className="mx-auto mt-6 inline-block rounded-full bg-white/80 px-8 py-2 text-[26px] font-black tracking-[0.3em] text-brand-violet" dir="ltr">
              {report.typeCode}
            </p>
          </div>

          <img
            src={PROFILE_ICONS[report.profile]}
            alt=""
            className="absolute bottom-6 left-1/2 h-[400px] w-[400px] -translate-x-1/2 drop-shadow-2xl"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-6" style={{ height: PDF_PAGE_PX.height - 760 }}>
          <p className="px-12 text-center text-[36px] font-black leading-tight text-slate-900">
            {t("pdf.coverTitle", { name })}
          </p>
          <img src="/logo.png" alt="iMath" className="h-[72px] w-auto" />
          <p className="text-[18px] font-bold tracking-wide text-slate-400">{t("pdf.academy")}</p>
        </div>
      </Page>

      {/* 2 · We think [Name] is… */}
      <Page page={2} name={name}>
        <div className="px-14 pt-14">
          <Tape className="bg-brand-violet">{r("weThink", { name })}…</Tape>

          <div
            className="relative mt-10 rounded-[40px] p-10 shadow-lg"
            style={{ background: "linear-gradient(135deg,#fde047,#fb923c)", transform: "rotate(-1deg)" }}
          >
            <img src="/assessment/glowing-star.png" alt="" className="absolute -top-8 -end-6 h-20 w-20 rotate-12" />
            <p className="text-[46px] font-black leading-[1.25] text-slate-900">{report.tagline}</p>
          </div>

          <p className="mt-10 text-[24px] font-medium leading-[1.75] text-slate-700">{report.overview}</p>

          <h2 className="mt-10 text-[30px] font-black text-slate-900">{r("traitsTitle")}</h2>
          <div className="mt-5 grid grid-cols-3 gap-5">
            {report.traits.map((trait, index) => (
              <div
                key={trait.title}
                className="relative rounded-2xl p-5 shadow-md"
                style={{
                  background: ["#fef9c3", "#ffedd5", "#ede9fe"][index],
                  transform: `rotate(${[-2, 1.5, -1][index]}deg)`,
                  minHeight: 255,
                }}
              >
                <span className="absolute -top-3 start-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-brand-violet shadow" />
                <h3 className="mt-2 text-[23px] font-black leading-snug text-slate-900">{trait.title}</h3>
                <p className="mt-3 text-[18px] font-medium leading-[1.55] text-slate-700">{trait.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Page>

      {/* 3 · How [Name] thinks */}
      <Page page={3} name={name}>
        <div className="px-14 pt-14">
          <Tape className="bg-brand-orange">{r("howThinks", { name })}</Tape>

          <div className="mt-9 grid grid-cols-2 gap-5">
            {report.dimensions.map((dimension) => (
              <div key={dimension.dimension} className="rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 text-[17px] font-black" dir="ltr">
                  <span className={dimension.pole === dimension.firstPole ? "text-slate-900" : "text-slate-400"}>
                    <bdi>{r(`poles.${dimension.firstPole}`)}</bdi> <bdi>{dimension.firstPct}%</bdi>
                  </span>
                  <span className={dimension.pole === dimension.secondPole ? "text-slate-900" : "text-slate-400"}>
                    <bdi>{dimension.secondPct}%</bdi> <bdi>{r(`poles.${dimension.secondPole}`)}</bdi>
                  </span>
                </div>
                <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-slate-200" dir="ltr">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${dimension.firstPct}%`, background: DIMENSION_COLORS[dimension.dimension] }}
                  />
                </div>
                <p className="mt-4 text-[14px] font-black uppercase tracking-wider text-brand-orange">
                  {r(`strength.${dimension.strength}`)} · {r(`poles.${dimension.pole}`)}
                </p>
                <h3 className="mt-1 text-[24px] font-black leading-snug text-slate-900">{dimension.title}</h3>
                <p className="mt-2 text-[17px] font-medium leading-[1.45] text-slate-600">{dimension.text}</p>
                <ul className="mt-3 space-y-1 text-[16px] font-medium leading-snug text-slate-700">
                  {dimension.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-violet" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Page>

      {/* 4 · Superpower and strengths */}
      <Page page={4} name={name}>
        <div className="px-14 pt-14">
          <div className="rounded-[40px] bg-brand-violet p-10 text-white shadow-lg">
            <div className="flex items-center gap-6">
              <img src={PROFILE_ICONS[report.profile]} alt="" className="h-28 w-28 shrink-0" />
              <h2 className="text-[38px] font-black leading-tight">{r("mathPowerTitle", { name })}</h2>
            </div>
            <p className="mt-6 text-[26px] font-bold leading-[1.55] text-white/95">{report.mathPower}</p>
          </div>

          <div className="relative mt-16 rounded-[40px] p-12 shadow-lg" style={{ background: "#bbf7d0" }}>
            <Tape className="absolute -top-8 start-10 bg-emerald-600 text-[30px]">{r("strengths")}</Tape>
            <div className="mt-8 space-y-10">
              {report.strengths.map((item) => (
                <div key={item.title}>
                  <h3 className="text-[32px] font-black text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-[25px] font-medium leading-[1.55] text-slate-800">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Page>

      {/* 5 · Areas to grow */}
      <Page page={5} name={name}>
        <div className="px-14 pt-14">
          <div className="relative rounded-[40px] p-12 shadow-lg" style={{ background: "#fed7aa" }}>
            <Tape className="absolute -top-8 start-10 bg-brand-orange text-[30px]">{r("challenges")}</Tape>
            <div className="mt-8 space-y-9">
              {report.challenges.map((item) => (
                <div key={item.title}>
                  <h3 className="text-[32px] font-black text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-[25px] font-medium leading-[1.55] text-slate-800">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[36px] p-8" style={{ background: "linear-gradient(135deg,#ede9fe,#fce7f3)" }}>
            <h2 className="text-[28px] font-black text-brand-violet">{r("learnAtImath", { name })}</h2>
            <p className="mt-3 text-[22px] font-medium leading-[1.6] text-slate-800">{report.learnAtImath}</p>
          </div>

          <div className="mt-10 flex items-center gap-6 rounded-[36px] bg-violet-100 p-8">
            <img src="/assessment/seedling.png" alt="" className="h-28 w-28 shrink-0" />
            <p className="text-[26px] font-bold leading-[1.5] text-brand-violet">{t("pdf.growthNote")}</p>
          </div>
        </div>
      </Page>

      {/* 6 · Powers to build next + tips */}
      <Page page={6} name={name}>
        <div className="px-14 pt-14">
          <Tape className="bg-brand-violet">{r("buildNext")}</Tape>
          <div className="mt-8 space-y-4">
            {report.buildNext.map((power, index) => (
              <div key={power.power} className="flex items-center gap-5 rounded-3xl bg-slate-50 p-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-[32px] font-black text-white">
                  {index + 1}
                </span>
                <img src={PROFILE_ICONS[power.power]} alt="" className="h-14 w-14 shrink-0" />
                <div>
                  <h3 className="text-[26px] font-black text-slate-900">{power.name}</h3>
                  <p className="text-[19px] font-medium leading-[1.45] text-slate-600">{power.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-14 rounded-[40px] p-9 shadow-lg" style={{ background: "#fef08a" }}>
            <Tape className="absolute -top-8 start-10 bg-slate-900 text-[30px]">{r("parentTips")}</Tape>
            <ul className="mt-6 space-y-5">
              {report.parentTips.map((tip, index) => (
                <li key={tip} className="flex gap-4 text-[22px] font-medium leading-[1.45] text-slate-800">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[18px] font-black text-white">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Page>

      {/* 7 · Next step */}
      <Page page={7} name={name}>
        <div className="px-14 pt-14">
          <p className="rounded-[36px] bg-brand-yellow/40 p-10 text-center text-[34px] font-black leading-[1.45] text-slate-900">
            ✨ {report.closing}
          </p>

          <div className="mt-12 flex items-center gap-8 rounded-[40px] bg-brand-orange p-10 text-white shadow-lg">
            <div className="flex-1">
              <h2 className="text-[34px] font-black leading-tight">{r("bookCta", { name })}</h2>
              <p className="mt-3 text-[20px] font-bold leading-[1.5] text-white/95">{t("pdf.scanHint")}</p>
            </div>
            <div className="shrink-0 rounded-3xl bg-white p-3">
              <img src={qrDataUrl} alt="" className="h-[190px] w-[190px]" />
            </div>
          </div>

          <div className="mt-12 space-y-2 text-center text-[22px] font-bold text-slate-700" dir="ltr">
            <p>WhatsApp: +{SITE_PHONE_NUMBER}</p>
            <p>{SITE_EMAIL}</p>
            <p className="text-brand-violet">{siteUrl}</p>
          </div>

          <p className="mt-10 text-center text-[14px] leading-relaxed text-slate-400">{r("disclaimer")}</p>
        </div>
      </Page>
    </div>
  );
}

function Page({ children, page, name }: { children: ReactNode; page?: number; name?: string }) {
  const style: CSSProperties = { width: PDF_PAGE_PX.width, height: PDF_PAGE_PX.height };

  return (
    <section data-pdf-page className="relative overflow-hidden bg-white" style={style}>
      {children}
      {page ? <Footer page={page} name={name ?? ""} /> : null}
    </section>
  );
}

function Footer({ page, name }: { page: number; name: string }) {
  return (
    <div className="absolute inset-x-14 bottom-9 flex items-center justify-between border-t-2 border-slate-100 pt-5">
      <img src="/logo.png" alt="iMath" className="h-10 w-auto" />
      <span className="text-[16px] font-bold text-slate-400" dir="ltr">
        <bdi>{name}</bdi> · {page} / {PAGE_COUNT}
      </span>
    </div>
  );
}

function Tape({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-2xl px-8 py-3 text-[34px] font-black leading-tight text-white shadow-md",
        className
      )}
      style={{ transform: "rotate(-3deg)" }}
    >
      {children}
    </span>
  );
}
