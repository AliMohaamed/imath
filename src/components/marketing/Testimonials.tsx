"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Review = {
  name: string;
  role: string;
  content: string;
  rating: number;
};

export default function Testimonials() {
  const t = useTranslations("Marketing.testimonials");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [currentIndex, setCurrentIndex] = useState(0);

  const reviews = useMemo<Review[]>(
    () => [
      {
        name: t("items.amira.name"),
        role: t("items.amira.role"),
        content: t("items.amira.content"),
        rating: 5,
      },
      {
        name: t("items.omar.name"),
        role: t("items.omar.role"),
        content: t("items.omar.content"),
        rating: 5,
      },
      {
        name: t("items.sarah.name"),
        role: t("items.sarah.role"),
        content: t("items.sarah.content"),
        rating: 5,
      },
    ],
    [t]
  );

  const goTo = (index: number) => {
    const normalizedIndex = (index + reviews.length) % reviews.length;
    setCurrentIndex(normalizedIndex);
  };

  const previous = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  return (
    <section className="relative overflow-hidden bg-brand-violet/5 py-24" dir={isRtl ? "rtl" : "ltr"}>
      <div className="absolute left-0 top-0 -z-10 h-32 w-32 rounded-full bg-brand-orange/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 -z-10 h-64 w-64 rounded-full bg-brand-violet/10 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-4xl font-black tracking-tight text-slate-900">{t("title")}</h2>
            <p className="text-lg text-slate-600">{t("description")}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-12 w-12 rounded-2xl p-0 text-brand-violet"
              onClick={previous}
              aria-label={isRtl ? "التالي" : "Previous testimonial"}
            >
              <ChevronLeft className={cn("h-5 w-5", isRtl && "rotate-180")} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-12 w-12 rounded-2xl p-0 text-brand-violet"
              onClick={next}
              aria-label={isRtl ? "السابق" : "Next testimonial"}
            >
              <ChevronRight className={cn("h-5 w-5", isRtl && "rotate-180")} />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(${isRtl ? currentIndex * 100 : currentIndex * -100}%)`,
            }}
          >
            {reviews.map((review, index) => (
              <article
                key={`${review.name}-${index}`}
                className="w-full shrink-0"
                aria-hidden={currentIndex !== index}
              >
                <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-white bg-white p-8 shadow-sm md:p-10">
                  <Quote className="mb-6 h-14 w-14 text-brand-violet/10" />

                  <div className="mb-6 flex gap-1">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-5 w-5 fill-brand-yellow text-brand-yellow" />
                    ))}
                  </div>

                  <p className="min-h-28 text-lg font-medium leading-relaxed text-slate-600">
                    &quot;{review.content}&quot;
                  </p>

                  <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-violet/10 text-xl font-black text-brand-violet">
                      {review.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900">{review.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{review.role}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {reviews.map((review, index) => (
            <button
              key={`indicator-${review.name}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                "h-3 rounded-full transition-all",
                currentIndex === index ? "w-8 bg-brand-violet" : "w-3 bg-brand-violet/25"
              )}
              aria-label={`${isRtl ? "عرض" : "Show"} ${review.name}`}
              aria-pressed={currentIndex === index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
