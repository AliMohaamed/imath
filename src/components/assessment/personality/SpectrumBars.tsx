"use client";

import { useTranslations } from "next-intl";
import { DIMENSION_POLES, DIMENSIONS } from "@/lib/assessment/personality/questions";
import type { PersonalityScore } from "@/lib/assessment/personality/scoring";
import { cn } from "@/lib/utils";

const COLORS = {
  EI: "bg-brand-violet",
  SN: "bg-brand-orange",
  TF: "bg-emerald-500",
  JP: "bg-sky-500",
} as const;

/** One bar per trait pair showing how the child's answers split between the two sides. */
export function SpectrumBars({ score }: { score: PersonalityScore }) {
  const t = useTranslations("Assessment.personality.result");

  return (
    <ul className="space-y-5">
      {DIMENSIONS.map((dimension) => {
        const [first, second] = DIMENSION_POLES[dimension];
        const result = score.dimensions[dimension];

        return (
          <li key={dimension} className="space-y-2">
            {/* Label row and bar both lay out left to right so the first pole sits on the left in either language. */}
            <div className="flex items-center justify-between gap-3 text-sm font-black" dir="ltr">
              <span className={result.pole === first ? "text-slate-900" : "text-slate-400"}>
                <bdi>{t(`poles.${first}`)}</bdi> <bdi>{result.firstPct}%</bdi>
              </span>
              <span className={result.pole === second ? "text-slate-900" : "text-slate-400"}>
                <bdi>{result.secondPct}%</bdi> <bdi>{t(`poles.${second}`)}</bdi>
              </span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-slate-200" dir="ltr">
              <div
                className={cn("h-full transition-all duration-700", COLORS[dimension])}
                style={{ width: `${result.firstPct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
