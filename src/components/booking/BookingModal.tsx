"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import {
  AGE_OPTIONS,
  bookingFormSchema,
  EXPERIENCE_OPTIONS,
  PHONE_COUNTRY_OPTIONS,
  PREFERRED_SLOT_OPTIONS,
  type BookingFormValues,
} from "@/lib/booking";
import { useGeoPricing } from "@/components/pricing/GeoPricingProvider";
import { trackEvent } from "@/lib/analytics";

type BookingModalProps = {
  isOpen: boolean;
  source: string;
  onClose: (reason?: string) => void;
};

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; leadId: string };

type LeadApiSuccess = {
  ok: true;
  leadId: string;
};

type LeadApiFailure = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function BookingModal({ isOpen, source, onClose }: BookingModalProps) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("BookingModal");
  const common = useTranslations("Common");
  const pricingT = useTranslations("Marketing.pricing");
  const { currency, selectedCountry } = useGeoPricing();
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: "idle" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);

  const defaultTimezone = useMemo(() => {
    if (typeof Intl === "undefined") {
      return "UTC";
    }

    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    defaultValues: {
      parentName: "",
      studentName: "",
      studentAge: 8,
      phoneCountryCode: "+20",
      phoneNumber: "",
      email: "",
      previousExperience: "none",
      timezone: defaultTimezone,
      preferredSlots: [],
      countryCode: selectedCountry,
      locale,
    },
  });

  const selectedTimezone = watch("timezone");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      parentName: "",
      studentName: "",
      studentAge: 8,
      phoneCountryCode: "+20",
      phoneNumber: "",
      email: "",
      previousExperience: "none",
      timezone: defaultTimezone,
      preferredSlots: [],
      countryCode: selectedCountry,
      locale,
    });
    setSubmissionState({ status: "idle" });
    setSubmitError(null);
    setHasTrackedStart(false);
  }, [defaultTimezone, isOpen, locale, reset]);

  useEffect(() => {
    setValue("countryCode", selectedCountry);
  }, [selectedCountry, setValue]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose("escape");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const inputClassName = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/10";
  const labelClassName = "block text-sm font-black text-slate-900";

  const onFormStart = () => {
    if (hasTrackedStart) {
      return;
    }

    setHasTrackedStart(true);
    trackEvent("booking_form_start", { source, locale });
  };

  const onSubmit = handleSubmit(async (values) => {
    onFormStart();
    setSubmitError(null);
    setSubmissionState({ status: "submitting" });

    const parsed = bookingFormSchema.safeParse(values);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      Object.entries(flattened).forEach(([field, messages]) => {
        if (messages?.[0]) {
          setError(field as keyof BookingFormValues, { message: messages[0] });
        }
      });
      setSubmissionState({ status: "idle" });
      trackEvent("booking_validation_failure", {
        source,
        locale,
        fields: Object.keys(flattened),
      });
      return;
    }

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const result = (await response.json()) as LeadApiSuccess | LeadApiFailure;

    if (!response.ok || !result.ok) {
      if ("fieldErrors" in result && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            setError(field as keyof BookingFormValues, { message: messages[0] });
          }
        });
      }

      const message = "message" in result ? result.message : t("errors.generic");
      setSubmitError(message);
      setSubmissionState({ status: "idle" });
      trackEvent("booking_validation_failure", {
        source,
        locale,
        status: response.status,
      });
      return;
    }

    setSubmissionState({ status: "success", leadId: result.leadId });
    trackEvent("booking_submission_success", {
      source,
      locale,
      leadId: result.leadId,
    });
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      onClick={() => onClose("backdrop")}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onClose("close_button")}
          className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
          aria-label={t("close")}
        >
          <X className="h-5 w-5" />
        </button>

        {submissionState.status === "success" ? (
          <div className="space-y-6 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-violet/10 text-2xl font-black text-brand-violet">
              iM
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">{t("success.title")}</h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600">{t("success.description")}</p>
              <p className="text-sm font-bold text-brand-orange">{t("success.nextStep")}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
              {t("success.reference", { leadId: submissionState.leadId })}
            </div>
            <button
              type="button"
              onClick={() => onClose("success_done")}
              className="rounded-full bg-brand-orange px-8 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
            >
              {common("contactUs")}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3 pe-10">
              <div className="inline-flex rounded-full bg-brand-violet/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-violet">
                {t("eyebrow")}
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{t("title")}</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">{t("description")}</p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit} onFocusCapture={onFormStart}>
              <input type="hidden" value={locale} {...register("locale")} />
              <input type="hidden" value={selectedTimezone || defaultTimezone} {...register("timezone")} />
              <input type="hidden" value={selectedCountry} {...register("countryCode")} />

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <label className={labelClassName} htmlFor="parentName">{t("fields.parentName.label")}</label>
                  <input id="parentName" className={inputClassName} {...register("parentName")} placeholder={t("fields.parentName.placeholder")} />
                  <FieldError message={errors.parentName?.message && t("errors.parentName")} />
                </Field>

                <Field>
                  <label className={labelClassName} htmlFor="studentName">{t("fields.studentName.label")}</label>
                  <input id="studentName" className={inputClassName} {...register("studentName")} placeholder={t("fields.studentName.placeholder")} />
                  <FieldError message={errors.studentName?.message && t("errors.studentName")} />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <Field>
                  <label className={labelClassName} htmlFor="studentAge">{t("fields.studentAge.label")}</label>
                  <select id="studentAge" className={inputClassName} {...register("studentAge", { valueAsNumber: true })}>
                    {AGE_OPTIONS.map((age) => (
                      <option key={age} value={age}>
                        {t("ageOption", { age })}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <label className={labelClassName} htmlFor="phoneNumber">{t("fields.phone.label")}</label>
                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <select className={inputClassName} {...register("phoneCountryCode")}>
                      {PHONE_COUNTRY_OPTIONS.map((option) => (
                        <option key={`${option.country}-${option.value}`} value={option.value}>
                          {option.country} {option.value}
                        </option>
                      ))}
                    </select>
                    <input id="phoneNumber" className={inputClassName} {...register("phoneNumber")} placeholder={t("fields.phone.placeholder")} />
                  </div>
                  <FieldError message={(errors.phoneCountryCode?.message || errors.phoneNumber?.message) && t("errors.phoneNumber")} />
                </Field>
              </div>

              <Field>
                <label className={labelClassName} htmlFor="email">{t("fields.email.label")}</label>
                <input id="email" className={inputClassName} {...register("email")} placeholder={t("fields.email.placeholder")} />
                <FieldHint>{t("fields.email.hint")}</FieldHint>
                <FieldError message={errors.email?.message && t("errors.email")} />
              </Field>

              <Field>
                <span className={labelClassName}>{t("fields.previousExperience.label")}</span>
                <div className="grid gap-3 md:grid-cols-3">
                  {EXPERIENCE_OPTIONS.map((value) => (
                    <label key={value} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 transition-colors hover:border-brand-violet/40">
                      <input type="radio" value={value} className="mt-1" {...register("previousExperience")} />
                      <span className="font-medium">{t(`experience.${value}`)}</span>
                    </label>
                  ))}
                </div>
                <FieldError message={errors.previousExperience?.message && t("errors.previousExperience")} />
              </Field>

              <Field>
                <span className={labelClassName}>{t("fields.preferredSlots.label")}</span>
                <div className="grid gap-3 md:grid-cols-2">
                  {PREFERRED_SLOT_OPTIONS.map((slot) => (
                    <label key={slot} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 transition-colors hover:border-brand-violet/40">
                      <input type="checkbox" value={slot} className="mt-1" {...register("preferredSlots")} />
                      <span className="font-medium">{t(`timeSlots.${slot}`)}</span>
                    </label>
                  ))}
                </div>
                <FieldError message={errors.preferredSlots?.message && t("errors.preferredSlots")} />
              </Field>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-black text-slate-900">{t("timezone.label")}</div>
                <div className="mt-1">{selectedTimezone || defaultTimezone}</div>
                <div className="mt-2 text-xs text-slate-500">{t("timezone.hint")}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-black text-slate-900">{t("pricingContext.label")}</div>
                <div className="mt-1">{pricingT(`countries.${selectedCountry}`)} · {currency}</div>
                <div className="mt-2 text-xs text-slate-500">{t("pricingContext.hint")}</div>
              </div>

              {submitError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {submitError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-relaxed text-slate-500">{t("privacyNote")}</p>
                <button
                  type="submit"
                  disabled={isSubmitting || submissionState.status === "submitting"}
                  className="rounded-full bg-brand-orange px-8 py-3 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submissionState.status === "submitting" ? t("submitting") : common("bookFreeTrial")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function FieldError({ message }: { message?: string | false }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-medium text-red-600">{message}</p>;
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-slate-500">{children}</p>;
}
