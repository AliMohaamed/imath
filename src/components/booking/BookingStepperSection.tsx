"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AGE_OPTIONS,
  bookingFormSchema,
  buildPreferredSlotValue,
  EXPERIENCE_OPTIONS,
  formatPhoneNumber,
  formatPreferredSlotValue,
  getAvailableTimeSlotsForDate,
  getBookableDateOptions,
  PHONE_COUNTRY_OPTIONS,
  type BookingFormValues,
} from "@/lib/booking";
import { useGeoPricing } from "@/components/pricing/GeoPricingProvider";
import { Button } from "@/components/ui/button";
import { DateSelector } from "@/components/booking/DateSelector";
import { TimeSelector } from "@/components/booking/TimeSelector";
import { BOOKING_STEPPER_ID, useBookingFlow } from "@/components/booking/BookingFlowProvider";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

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

const STEP_COUNT = 4;

export function BookingStepperSection() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("BookingModal");
  const common = useTranslations("Common");
  const pricingT = useTranslations("Marketing.pricing");
  const { currency, selectedCountry } = useGeoPricing();
  const { lastSource } = useBookingFlow();
  const [activeStep, setActiveStep] = useState(0);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: "idle" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectionNow, setSelectionNow] = useState(() => new Date());
  const [selectedDateDraft, setSelectedDateDraft] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

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
    watch,
    trigger,
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

  const values = watch();
  const selectedPreferredSlot = values.preferredSlots[0];
  const parsedPreferredSlot = selectedPreferredSlot ? splitPreferredSlot(selectedPreferredSlot) : null;
  const selectedDate = parsedPreferredSlot?.dateKey ?? selectedDateDraft;
  const selectedTime = parsedPreferredSlot?.timeValue ?? null;
  const dateOptions = useMemo(() => getBookableDateOptions(locale, selectionNow), [locale, selectionNow]);
  const timeOptions = useMemo(
    () => (selectedDate ? getAvailableTimeSlotsForDate(selectedDate, locale, selectionNow) : []),
    [locale, selectedDate, selectionNow]
  );

  useEffect(() => {
    setValue("countryCode", selectedCountry);
  }, [selectedCountry, setValue]);

  useEffect(() => {
    setValue("timezone", defaultTimezone);
    setValue("locale", locale);
  }, [defaultTimezone, locale, setValue]);

  useEffect(() => {
    if (selectedPreferredSlot && parsedPreferredSlot?.dateKey) {
      setSelectedDateDraft(parsedPreferredSlot.dateKey);
    }
  }, [parsedPreferredSlot?.dateKey, selectedPreferredSlot]);

  const canGoNext = useMemo(() => {
    if (activeStep === 0) {
      return isParentStepValid(values.parentName, values.phoneCountryCode, values.phoneNumber);
    }

    if (activeStep === 1) {
      return isStudentStepValid(values.studentName, values.studentAge, values.previousExperience);
    }

    if (activeStep === 2) {
      return values.preferredSlots.length > 0;
    }

    return true;
  }, [
    activeStep,
    values.parentName,
    values.phoneCountryCode,
    values.phoneNumber,
    values.studentName,
    values.studentAge,
    values.previousExperience,
    values.preferredSlots,
  ]);

  const nextStep = async () => {
    const fields =
      activeStep === 0
        ? (["parentName", "phoneCountryCode", "phoneNumber"] as const)
        : activeStep === 1
          ? (["studentName", "studentAge", "previousExperience"] as const)
          : (["preferredSlots"] as const);

    const isValid = await trigger(fields);
    if (!isValid) {
      trackEvent("booking_validation_failure", { source: lastSource, locale, step: activeStep + 1 });
      return;
    }

    const next = Math.min(activeStep + 1, STEP_COUNT - 1);
    setActiveStep(next);
    trackEvent("booking_step_change", { source: lastSource, locale, step: next + 1 });
  };

  const previousStep = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const onSubmit = handleSubmit(async (submittedValues) => {
    setSubmitError(null);
    setSubmissionState({ status: "submitting" });

    const parsed = bookingFormSchema.safeParse(submittedValues);
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      Object.entries(flattened).forEach(([field, messages]) => {
        if (messages?.[0]) {
          setError(field as keyof BookingFormValues, { message: messages[0] });
        }
      });
      setSubmissionState({ status: "idle" });
      trackEvent("booking_validation_failure", {
        source: lastSource,
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

      setSubmitError("message" in result ? result.message : t("errors.generic"));
      setSubmissionState({ status: "idle" });
      trackEvent("booking_validation_failure", {
        source: lastSource,
        locale,
        status: response.status,
      });
      return;
    }

    setSubmissionState({ status: "success", leadId: result.leadId });
    setActiveStep(STEP_COUNT - 1);
    trackEvent("booking_submission_success", {
      source: lastSource,
      locale,
      leadId: result.leadId,
    });
  });

  return (
    <section
      id={BOOKING_STEPPER_ID}
      ref={sectionRef}
      className="scroll-mt-28 bg-white py-24"
      aria-labelledby="booking-stepper-title"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="space-y-3">
              <div className="inline-flex rounded-full bg-brand-violet/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-violet">
                {t("eyebrow")}
              </div>
              <h2 id="booking-stepper-title" className="text-3xl font-black tracking-tight text-slate-900">
                {t("stepper.title")}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {t("stepper.description")}
              </p>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {t("stepper.progress", { current: Math.min(activeStep + 1, STEP_COUNT), total: STEP_COUNT })}
              </p>
            </div>

            <ol className="mt-6 space-y-3">
              {[0, 1, 2, 3].map((stepIndex) => {
                const isActive = stepIndex === activeStep;
                const isComplete = stepIndex < activeStep || submissionState.status === "success";
                return (
                  <li
                    key={stepIndex}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm",
                      isActive
                        ? "border-brand-violet bg-white text-slate-900 shadow-sm"
                        : "border-transparent text-slate-500"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-black",
                        isComplete
                          ? "bg-brand-violet text-white"
                          : isActive
                            ? "bg-brand-violet/10 text-brand-violet"
                            : "bg-white text-slate-400"
                      )}
                    >
                      {isComplete ? <CheckCircle2 className="h-4 w-4" /> : stepIndex + 1}
                    </span>
                    <span>{t(`stepper.steps.${getStepKey(stepIndex)}`)}</span>
                  </li>
                );
              })}
            </ol>
          </aside>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {submissionState.status === "success" ? (
              <SuccessState leadId={submissionState.leadId} />
            ) : (
              <form className="space-y-8" onSubmit={onSubmit}>
                {activeStep === 0 ? (
                  <div className="space-y-6">
                    <StepHeader title={t("stepper.steps.parent")} description={t("stepper.parentDescription")} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <Label>{t("fields.parentName.label")}</Label>
                        <input
                          className={inputClassName}
                          placeholder={t("fields.parentName.placeholder")}
                          {...register("parentName")}
                          aria-invalid={Boolean(errors.parentName)}
                        />
                        <FieldError message={errors.parentName?.message && t("errors.parentName")} />
                      </Field>
                      <Field>
                        <Label>{t("fields.phone.label")}</Label>
                        <div className="grid grid-cols-[120px_1fr] gap-3">
                          <select className={inputClassName} {...register("phoneCountryCode")}>
                            {PHONE_COUNTRY_OPTIONS.map((option) => (
                              <option key={`${option.country}-${option.value}`} value={option.value}>
                                {option.country} {option.value}
                              </option>
                            ))}
                          </select>
                          <input
                            className={inputClassName}
                            placeholder={t("fields.phone.placeholder")}
                            {...register("phoneNumber")}
                            aria-invalid={Boolean(errors.phoneNumber)}
                          />
                        </div>
                        <FieldError message={(errors.phoneCountryCode?.message || errors.phoneNumber?.message) && t("errors.phoneNumber")} />
                      </Field>
                    </div>
                  </div>
                ) : null}

                {activeStep === 1 ? (
                  <div className="space-y-6">
                    <StepHeader title={t("stepper.steps.student")} description={t("stepper.studentDescription")} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <Label>{t("fields.studentName.label")}</Label>
                        <input
                          className={inputClassName}
                          placeholder={t("fields.studentName.placeholder")}
                          {...register("studentName")}
                          aria-invalid={Boolean(errors.studentName)}
                        />
                        <FieldError message={errors.studentName?.message && t("errors.studentName")} />
                      </Field>
                      <Field>
                        <Label>{t("fields.studentAge.label")}</Label>
                        <select className={inputClassName} {...register("studentAge", { valueAsNumber: true })}>
                          {AGE_OPTIONS.map((age) => (
                            <option key={age} value={age}>
                              {t("ageOption", { age })}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field>
                      <Label>{t("fields.previousExperience.label")}</Label>
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
                  </div>
                ) : null}

                {activeStep === 2 ? (
                  <div className="space-y-6">
                    <StepHeader title={t("stepper.steps.schedule")} description={t("scheduler.description")} />
                    <div className="space-y-3">
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{t("scheduler.stepDate")}</div>
                      <DateSelector
                        options={dateOptions}
                        selectedDate={selectedDate}
                        onSelect={(dateValue) => {
                          setSelectionNow(new Date());
                          setSelectedDateDraft(dateValue);
                          setValue("preferredSlots", [], { shouldDirty: true, shouldValidate: true });
                        }}
                        todayLabel={t("scheduler.today")}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{t("scheduler.stepTime")}</div>
                      <TimeSelector
                        options={timeOptions}
                        selectedTime={selectedTime}
                        isDisabled={!selectedDate}
                        disabledLabel={t("scheduler.selectDateFirst")}
                        emptyLabel={t("scheduler.noTimesAvailable")}
                        onSelect={(timeValue) => {
                          if (!selectedDate) {
                            return;
                          }

                          setValue("preferredSlots", [buildPreferredSlotValue(selectedDate, timeValue)], {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                    </div>
                    {selectedPreferredSlot ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <span className="font-black text-slate-900">{t("scheduler.selectedLabel")} </span>
                        {formatPreferredSlotValue(selectedPreferredSlot, locale)}
                      </div>
                    ) : null}
                    <FieldError message={errors.preferredSlots?.message && t("errors.preferredSlots")} />
                  </div>
                ) : null}

                {activeStep === 3 ? (
                  <div className="space-y-6">
                    <StepHeader title={t("stepper.steps.review")} description={t("stepper.reviewDescription")} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <SummaryItem label={t("fields.parentName.label")} value={values.parentName} />
                      <SummaryItem label={t("fields.phone.label")} value={formatPhoneNumber(values.phoneCountryCode, values.phoneNumber)} />
                      <SummaryItem label={t("fields.studentName.label")} value={values.studentName} />
                      <SummaryItem label={t("fields.studentAge.label")} value={t("ageOption", { age: values.studentAge })} />
                      <SummaryItem label={t("fields.previousExperience.label")} value={t(`experience.${values.previousExperience}`)} />
                      <SummaryItem label={t("fields.preferredSlots.label")} value={selectedPreferredSlot ? formatPreferredSlotValue(selectedPreferredSlot, locale) : "-"} />
                      <SummaryItem label={t("timezone.label")} value={values.timezone} />
                      <SummaryItem label={t("pricingContext.label")} value={`${pricingT(`countries.${selectedCountry}`)} - ${currency}`} />
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">{t("privacyNote")}</p>
                  </div>
                ) : null}

                <input type="hidden" value={locale} {...register("locale")} />
                <input type="hidden" value={defaultTimezone} {...register("timezone")} />
                <input type="hidden" value={selectedCountry} {...register("countryCode")} />
                <input type="hidden" value="" {...register("email")} />

                {submitError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {submitError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" className="justify-center sm:justify-start" onClick={previousStep} disabled={activeStep === 0 || isSubmitting}>
                    <ChevronLeft className="h-4 w-4" />
                    {t("stepper.back")}
                  </Button>

                  {activeStep < STEP_COUNT - 1 ? (
                    <Button
                      className="bg-brand-orange text-white hover:bg-brand-orange/90"
                      onClick={nextStep}
                      disabled={!canGoNext}
                    >
                      {t("stepper.next")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" className="bg-brand-orange text-white hover:bg-brand-orange/90" disabled={isSubmitting || submissionState.status === "submitting"}>
                      {submissionState.status === "submitting" ? t("submitting") : common("bookFreeTrial")}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function getStepKey(stepIndex: number) {
  return ["parent", "student", "schedule", "review"][stepIndex] ?? "parent";
}

function splitPreferredSlot(value: string) {
  const [dateKey, timeValue] = value.split("T");
  return dateKey && timeValue ? { dateKey, timeValue } : null;
}

function isParentStepValid(parentName: string, phoneCountryCode: string, phoneNumber: string) {
  return parentName.trim().length >= 2 &&
    /^\+\d{1,4}$/.test(phoneCountryCode) &&
    /^[0-9()\-\s]+$/.test(phoneNumber.trim()) &&
    phoneNumber.trim().length >= 6;
}

function isStudentStepValid(studentName: string, studentAge: number, previousExperience: string) {
  return studentName.trim().length >= 2 && studentAge >= 5 && studentAge <= 18 && Boolean(previousExperience);
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-2xl font-black tracking-tight text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-black text-slate-900">{children}</label>;
}

function FieldError({ message }: { message?: string | false }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-medium text-red-600">{message}</p>;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function SuccessState({ leadId }: { leadId: string }) {
  const t = useTranslations("BookingModal");
  const common = useTranslations("Common");

  return (
    <div className="space-y-6 py-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-violet/10 text-brand-violet">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <div className="space-y-3">
        <h3 className="text-3xl font-black tracking-tight text-slate-900">{t("success.title")}</h3>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600">{t("success.description")}</p>
        <p className="text-sm font-bold text-brand-orange">{t("success.nextStep")}</p>
      </div>
      <div className="mx-auto max-w-md rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
        {t("success.reference", { leadId })}
      </div>
      <Button className="bg-brand-orange text-white hover:bg-brand-orange/90" onClick={() => {
        if (typeof window !== "undefined") {
          window.open("https://wa.me/201018860269", "_blank", "noopener,noreferrer");
        }
      }}>
        {common("contactUs")}
      </Button>
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/10";
