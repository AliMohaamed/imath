"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/assessment/ui";
import { PhoneField } from "@/components/assessment/PhoneField";
import { personalityInfoSchema } from "@/lib/assessment/common";
import { cn } from "@/lib/utils";

export type InfoDraft = {
  parentName: string;
  parentEmail: string;
  phoneCountryCode: string;
  phoneNumber: string;
  studentName: string;
  studentDob: string;
  gender: "" | "boy" | "girl";
};

export const EMPTY_INFO: InfoDraft = {
  parentName: "",
  parentEmail: "",
  phoneCountryCode: "+20",
  phoneNumber: "",
  studentName: "",
  studentDob: "",
  gender: "",
};

export function hasAnyInfo(info: InfoDraft) {
  return Boolean(
    info.parentName || info.parentEmail || info.phoneNumber || info.studentName || info.studentDob || info.gender
  );
}

function toDateInputValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

type FieldKey = keyof InfoDraft;

export function InfoStep({
  info,
  submitting,
  error,
  onChange,
  onSubmit,
}: {
  info: InfoDraft;
  submitting: boolean;
  error: string | null;
  onChange: (info: InfoDraft) => void;
  onSubmit: () => void;
}) {
  const t = useTranslations("Assessment.personality.info");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const today = new Date();
  const oldest = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const update = <K extends FieldKey>(key: K, value: InfoDraft[K]) => {
    onChange({ ...info, [key]: value });
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const parsed = personalityInfoSchema.safeParse(info);
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
  const describedBy = (key: FieldKey) => (invalid(key) ? `${key}-error` : undefined);

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("parentName")} htmlFor="parentName" error={errors.parentName}>
          <input
            id="parentName"
            className={inputClassName}
            autoComplete="name"
            value={info.parentName}
            aria-invalid={invalid("parentName")}
            aria-describedby={describedBy("parentName")}
            onChange={(event) => update("parentName", event.target.value)}
          />
        </Field>
        <Field label={t("parentEmail")} htmlFor="parentEmail" error={errors.parentEmail}>
          <input
            id="parentEmail"
            type="email"
            dir="ltr"
            className={inputClassName}
            autoComplete="email"
            inputMode="email"
            value={info.parentEmail}
            aria-invalid={invalid("parentEmail")}
            aria-describedby={describedBy("parentEmail")}
            onChange={(event) => update("parentEmail", event.target.value)}
          />
        </Field>
      </div>

      <Field label={t("parentPhone")} htmlFor="phoneNumber" error={errors.phoneNumber}>
        <PhoneField
          id="phoneNumber"
          code={info.phoneCountryCode}
          number={info.phoneNumber}
          placeholder={t("phonePlaceholder")}
          invalid={invalid("phoneNumber")}
          onCodeChange={(value) => update("phoneCountryCode", value)}
          onNumberChange={(value) => update("phoneNumber", value)}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("studentName")} htmlFor="studentName" error={errors.studentName}>
          <input
            id="studentName"
            className={inputClassName}
            value={info.studentName}
            aria-invalid={invalid("studentName")}
            aria-describedby={describedBy("studentName")}
            onChange={(event) => update("studentName", event.target.value)}
          />
        </Field>
        <Field label={t("studentDob")} htmlFor="studentDob" error={errors.studentDob}>
          <input
            id="studentDob"
            type="date"
            dir="ltr"
            className={inputClassName}
            min={toDateInputValue(oldest)}
            max={toDateInputValue(today)}
            value={info.studentDob}
            aria-invalid={invalid("studentDob")}
            aria-describedby={describedBy("studentDob")}
            onChange={(event) => update("studentDob", event.target.value)}
          />
        </Field>
      </div>

      <Field label={t("gender")} htmlFor="gender-boy" error={errors.gender}>
        <div role="radiogroup" aria-label={t("gender")} className="grid grid-cols-2 gap-3">
          {(["boy", "girl"] as const).map((value) => (
            <label
              key={value}
              className={cn(
                "flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-sm font-black transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-violet/40",
                info.gender === value
                  ? "border-brand-violet bg-brand-violet text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-violet/40"
              )}
            >
              <input
                id={`gender-${value}`}
                type="radio"
                name="gender"
                value={value}
                checked={info.gender === value}
                onChange={() => update("gender", value)}
                className="sr-only"
              />
              {t(value)}
            </label>
          ))}
        </div>
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
