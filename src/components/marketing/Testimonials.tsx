"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, Quote } from "lucide-react";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import { cn } from "@/lib/utils";

const SUPPORTING_STORIES = ["amira", "sarah", "khalid", "omar"] as const;

const AVATAR_TONES = [
  "bg-violet-100 text-violet-800",
  "bg-orange-100 text-orange-800",
  "bg-amber-100 text-amber-900",
];

function Avatar({ name, className }: { name: string; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold",
        className
      )}
    >
      {name.charAt(0)}
    </span>
  );
}

export default function Testimonials() {
  const t = useTranslations("Marketing.testimonials");
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="scroll-mt-28 bg-brand-violet/5 py-12 md:py-24"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <h2
            id="testimonials-title"
            className="mb-4 text-balance text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
          >
            {t("title")}
          </h2>
          <p className="text-balance text-lg text-slate-600">{t("description")}</p>
        </div>

        <figure
          aria-label={t("featuredLabel")}
          className="grid gap-8 rounded-[2rem] bg-brand-violet p-7 text-white shadow-[0_24px_48px_-24px_rgb(76_29_149/0.55)] md:p-12 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-12"
        >
          <div>
            <Quote aria-hidden="true" className="mb-5 h-10 w-10 fill-brand-yellow text-brand-yellow rtl:-scale-x-100" />
            <blockquote className="max-w-[58ch] text-pretty text-xl font-medium leading-relaxed md:text-2xl md:leading-relaxed">
              <p>{t("items.nour.content")}</p>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <Avatar name={t("items.nour.name")} className="bg-brand-yellow text-slate-900" />
              <div>
                <p className="font-bold">{t("items.nour.name")}</p>
                <p className="text-sm text-violet-100">
                  {t("items.nour.role")} · {t("items.nour.location")}
                </p>
              </div>
            </figcaption>
          </div>

          <dl className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 md:p-7">
            <div>
              <dt className="text-sm font-semibold text-violet-100">{t("before")}</dt>
              <dd className="mt-1 text-pretty text-base leading-relaxed text-white/90">{t("items.nour.before")}</dd>
            </div>
            <ArrowDown aria-hidden="true" className="my-4 h-5 w-5 text-brand-yellow" />
            <div>
              <dt className="flex items-center gap-2 text-sm font-semibold text-violet-100">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-yellow" />
                {t("after")}
              </dt>
              <dd className="mt-1 text-pretty text-lg font-bold leading-snug">{t("items.nour.after")}</dd>
            </div>
          </dl>
        </figure>

        <ul
          aria-label={t("listLabel")}
          className="scrollbar-hide -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-violet sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 md:mt-8 md:gap-6 xl:grid-cols-4"
        >
          {SUPPORTING_STORIES.map((key, index) => (
            <li key={key} className="flex w-[84%] shrink-0 snap-start sm:w-auto">
              <figure className="flex w-full flex-col">
                <blockquote className="relative flex-1 rounded-3xl rounded-es-md border border-violet-100 bg-white p-6 text-pretty text-base leading-relaxed text-slate-700 shadow-[0_10px_28px_-16px_rgb(76_29_149/0.25)]">
                  <p>{t(`items.${key}.content`)}</p>
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 px-1">
                  <Avatar name={t(`items.${key}.name`)} className={AVATAR_TONES[index % AVATAR_TONES.length]} />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{t(`items.${key}.name`)}</p>
                    <p className="text-sm text-slate-600">{t(`items.${key}.role`)}</p>
                    <p className="text-sm text-slate-500">{t(`items.${key}.location`)}</p>
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-6">
          <p className="text-pretty text-base font-medium text-slate-700">{t("ctaText")}</p>
          <BookingCtaButton
            source="testimonials_cta"
            className="rounded-full bg-brand-orange px-8 py-4 text-sm font-extrabold text-white shadow-premium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
          >
            {t("cta")}
          </BookingCtaButton>
        </div>
      </div>
    </section>
  );
}
