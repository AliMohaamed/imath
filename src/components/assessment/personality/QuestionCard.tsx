"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { AssessmentLocale } from "@/lib/assessment/common";
import type { PersonalityQuestion } from "@/lib/assessment/personality/questions";
import { cn } from "@/lib/utils";

type Side = "a" | "b";
type Strength = "strong" | "slight";

/** Statement A scores negative and B positive; a strong fit counts double. */
const toValue = (side: Side, strength: Strength) => (side === "a" ? -1 : 1) * (strength === "strong" ? 2 : 1);

/**
 * One question in two small steps, because a single "always / usually" scale under each statement
 * read like a frequency question and confused parents: first pick the statement that sounds more like
 * the child, then say how well it fits. Only the second step records the answer.
 */
export function QuestionCard({
  question,
  locale,
  name,
  value,
  onAnswer,
}: {
  question: PersonalityQuestion;
  locale: AssessmentLocale;
  name: string;
  /** -2, -1, 1, 2, or 0 while unanswered. */
  value: number;
  onAnswer: (value: number) => void;
}) {
  const t = useTranslations("Assessment.personality.questions");
  const [side, setSide] = useState<Side | null>(value < 0 ? "a" : value > 0 ? "b" : null);
  const groupName = `question-${question.id}`;

  const chooseSide = (next: Side) => {
    setSide(next);
    // Switching statements clears the old answer so it can't be submitted by mistake.
    if (value !== 0 && (value < 0 ? "a" : "b") !== next) {
      onAnswer(0);
    }
  };

  const renderStatement = (statement: Side) => {
    const selected = side === statement;

    return (
      <div
        className={cn(
          "rounded-3xl border-2 transition-colors",
          selected ? "border-brand-violet bg-brand-violet/5" : "border-slate-200 bg-white hover:border-brand-violet/40"
        )}
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-3xl p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-violet/40 md:p-5">
          <input
            type="radio"
            name={`${groupName}-side`}
            value={statement}
            checked={selected}
            onChange={() => chooseSide(statement)}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
              selected ? "border-brand-violet bg-brand-violet text-white" : "border-slate-300"
            )}
          >
            {selected ? <Check className="h-4 w-4" /> : null}
          </span>
          <span className="text-base font-bold leading-relaxed text-slate-900 md:text-lg">
            {question[statement].text[locale]}
          </span>
        </label>

        {selected ? (
          <fieldset className="space-y-3 border-t border-brand-violet/15 px-4 pb-4 pt-3 md:px-5 md:pb-5">
            <legend className="sr-only">{t("strength.question", { name })}</legend>
            <p aria-hidden="true" className="text-sm font-bold text-slate-600">
              {t("strength.question", { name })}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["strong", "slight"] as const).map((strength) => {
                const optionValue = toValue(statement, strength);
                const checked = value === optionValue;

                return (
                  <label
                    key={strength}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border px-3 py-2 text-center text-sm font-black transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-violet/40",
                      checked
                        ? "border-brand-violet bg-brand-violet text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand-violet/40"
                    )}
                  >
                    <input
                      type="radio"
                      name={`${groupName}-strength`}
                      value={optionValue}
                      checked={checked}
                      onChange={() => onAnswer(optionValue)}
                      className="sr-only"
                    />
                    {t(`strength.${strength}`)}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}
      </div>
    );
  };

  return (
    <fieldset className="space-y-4">
      <legend className="mb-1 text-xl font-black leading-snug text-slate-900 md:text-2xl">{question.stem[locale]}</legend>
      <p className="text-sm text-slate-500">{t("hint", { name })}</p>
      {renderStatement("a")}
      {renderStatement("b")}
    </fieldset>
  );
}
