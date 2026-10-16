"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/assessment/ui";
import { PhoneField } from "@/components/assessment/PhoneField";
import { levelInfoSchema } from "@/lib/assessment/common";
import { AGE_OPTIONS } from "@/lib/booking";

export type LevelInfoDraft = {
  studentName: string;
  /** Empty until the child picks an age. */
  studentAge: number | "";
  phoneCountryCode: string;
  phoneNumber: string;
};

export const EMPTY_LEVEL_INFO: LevelInfoDraft = {
  studentName: "",
  studentAge: "",
  phoneCountryCode: "+20",
  phoneNumber: "",
};

export function hasAnyLevelInfo(info: LevelInfoDraft) {
  return Boolean(info.studentName || info.studentAge || info.phoneNumber);
}

type FieldKey = keyof LevelInfoDraft;

export function LevelInfoStep({
  info,
  submitting,
  error,
  onChange,
  onSubmit,
}: {
  info: LevelInfoDraft;
  submitting: boolean;
  error: string | null;
  onChange: (info: LevelInfoDraft) => void;
  onSubmit: () => void;
}) {
  const t = useTranslations("Assessment.level.info");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const update = <K extends FieldKey>(key: K, value: LevelInfoDraft[K]) => {
    onChange({ ...info, [key]: value });
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const parsed = levelInfoSchema.safeParse(info);
    if (!parsed.success) {
      const next: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey;
        next[key] ??= t(`errors.${key}`);
      }
      setErrors(next);
      return;
    }

    onSubmit();
  };

  const invalid = (key: FieldKey) => Boolean(errors[key]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <Field label={t("studentName")} htmlFor="studentName" error={errors.studentName}>
        <input
          id="studentName"
          className={`${inputClassName} h-14 text-lg`}
          autoComplete="given-name"
          value={info.studentName}
          aria-invalid={invalid("studentName")}
          aria-describedby={invalid("studentName") ? "studentName-error" : undefined}
          onChange={(event) => update("studentName", event.target.value)}
        />
      </Field>

      <Field label={t("studentAge")} htmlFor="studentAge" error={errors.studentAge}>
        <select
          id="studentAge"
          className={`${inputClassName} h-14 text-lg`}
          value={info.studentAge}
          aria-invalid={invalid("studentAge")}
          aria-describedby={invalid("studentAge") ? "studentAge-error" : undefined}
          onChange={(event) => update("studentAge", event.target.value === "" ? "" : Number(event.target.value))}
        >
          <option value="" />
          {AGE_OPTIONS.map((age) => (
            <option key={age} value={age}>
              {t(age <= 10 ? "ageOptionFew" : "ageOptionMany", { age: String(age) })}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("phone")} htmlFor="phoneNumber" error={errors.phoneNumber}>
        <PhoneField
          id="phoneNumber"
          code={info.phoneCountryCode}
          number={info.phoneNumber}
          placeholder={t("phonePlaceholder")}
          invalid={invalid("phoneNumber")}
          onCodeChange={(value) => update("phoneCountryCode", value)}
          onNumberChange={(value) => update("phoneNumber", value)}
        />
        <p className="text-sm text-slate-500">{t("phoneHint")}</p>
      </Field>

      <p className="text-xs leading-relaxed text-slate-500">{t("privacyNote")}</p>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end border-t border-slate-100 pt-6">
        <Button type="submit" size="lg" className="bg-brand-orange text-white hover:bg-brand-orange/90" disabled={submitting}>
          {submitting ? t("saving") : t("next")}
          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
        </Button>
      </div>
    </form>
  );
}
