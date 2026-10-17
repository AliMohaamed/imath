"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
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
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { DateSelector } from "@/components/booking/DateSelector";
import { TimeSelector } from "@/components/booking/TimeSelector";
import { trackEvent } from "@/lib/analytics";
import { consumeBookingPrefill } from "@/lib/assessment/storage";
import { getWhatsAppUrl } from "@/lib/site";
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

type FieldName = keyof BookingFormValues;

const STEP_KEYS = ["student", "schedule", "parent", "review"] as const;
const LAST_STEP = STEP_KEYS.length - 1;

/** The fields each step owns; Next only moves on once these pass the same schema the API uses. */
const STEP_FIELDS: FieldName[][] = [
  ["studentName", "studentAge", "previousExperience"],
  ["preferredSlots"],
  ["parentName", "phoneCountryCode", "phoneNumber", "interestedPackage"],
];

const ERROR_KEYS: Partial<Record<FieldName, string>> = {
  studentName: "errors.studentName",
  previousExperience: "errors.previousExperience",
  preferredSlots: "errors.preferredSlots",
  parentName: "errors.parentName",
  phoneCountryCode: "errors.phoneNumber",
  phoneNumber: "errors.phoneNumber",
  interestedPackage: "errors.interestedPackage",
};

type BookingDialogProps = {
  isOpen: boolean;
  source: string;
  openId: number;
  onClose: () => void;
};

/**
 * Booking flow shown as a modal over whatever page the visitor is on. Closing it keeps what the
 * family typed, so an accidental tap outside costs nothing; the form only resets after a
 * successful request.
 */
export function BookingDialog({ isOpen, source, openId, onClose }: BookingDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pressStartedOnBackdrop = useRef(false);
  const stepRef = useRef(0);
  const completedRef = useRef(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (!isOpen) {
      if (dialog.open) {
        dialog.close();
      }
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [isOpen, openId]);

  const requestClose = (reason: string) => {
    trackEvent("booking_dialog_close", {
      source,
      reason,
      step: stepRef.current + 1,
      completed: completedRef.current,
    });

    if (completedRef.current) {
      completedRef.current = false;
      setFormKey((key) => key + 1);
    }
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="booking-dialog-title"
      className="booking-dialog m-0 mt-auto max-h-none w-full max-w-none bg-transparent p-0 text-start backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-2xl"
      onCancel={(event) => {
        event.preventDefault();
        requestClose("escape");
      }}
      onClose={onClose}
      onPointerDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && pressStartedOnBackdrop.current) {
          requestClose("backdrop");
        }
      }}
    >
      <div className="booking-panel flex h-[92dvh] flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:h-[min(88dvh,760px)] sm:rounded-[2rem]">
        {openId > 0 ? (
          <BookingForm
            key={formKey}
            source={source}
            openId={openId}
            onStepChange={(step) => {
              stepRef.current = step;
            }}
            onComplete={() => {
              completedRef.current = true;
            }}
            onRequestClose={requestClose}
          />
        ) : null}
      </div>
    </dialog>
  );
}

type BookingFormProps = {
  source: string;
  openId: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onRequestClose: (reason: string) => void;
};

function BookingForm({ source, openId, onStepChange, onComplete, onRequestClose }: BookingFormProps) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("BookingModal");
  const common = useTranslations("Common");
  const { selectedCountry } = useGeoPricing();
  const idPrefix = useId();
  const [activeStep, setActiveStep] = useState(0);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: "idle" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectionNow, setSelectionNow] = useState(() => new Date());
  const [selectedDateDraft, setSelectedDateDraft] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const stepChangedAt = useRef(0);

  const defaultTimezone = useMemo(() => {
    if (typeof Intl === "undefined") {
      return "UTC";
    }

    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }, []);

  const {
    register,
    setError,
    clearErrors,
    setFocus,
    setValue,
    getValues,
    watch,
    formState: { errors },
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
      interestedPackage: "not_sure",
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
  const isSubmitting = submissionState.status === "submitting";

  // Fixing a field clears its error straight away instead of waiting for the next click.
  const field = (name: FieldName, options?: { valueAsNumber?: true }) =>
    register(name, { ...options, onChange: () => clearErrors(name) });
  const fieldId = (name: string) => `${idPrefix}-${name}`;

  useEffect(() => {
    setValue("countryCode", selectedCountry);
  }, [selectedCountry, setValue]);

  useEffect(() => {
    setValue("timezone", defaultTimezone);
    setValue("locale", locale);
  }, [defaultTimezone, locale, setValue]);

  // Runs on every open: a family arriving from an assessment result shouldn't retype what they
  // already told us, and a pricing card's button preselects its package.
  useEffect(() => {
    const options = { shouldDirty: true } as const;
    const prefill = consumeBookingPrefill();

    if (prefill) {
      if (prefill.studentName) setValue("studentName", prefill.studentName, options);
      if (prefill.studentAge && AGE_OPTIONS.includes(prefill.studentAge)) setValue("studentAge", prefill.studentAge, options);
      if (prefill.parentName) setValue("parentName", prefill.parentName, options);
      if (prefill.phoneCountryCode) setValue("phoneCountryCode", prefill.phoneCountryCode, options);
      if (prefill.phoneNumber) setValue("phoneNumber", prefill.phoneNumber, options);
      if (prefill.previousExperience) setValue("previousExperience", prefill.previousExperience, options);
      trackEvent("booking_prefilled", { source: prefill.source, locale });
    }

    const packageMatch = source.match(/^pricing_[A-Z]{2}_(\d+)_months$/);
    if (packageMatch?.[1]) {
      setValue("interestedPackage", packageMatch[1], options);
    }
  }, [openId, source, setValue, locale]);

  useEffect(() => {
    onStepChange(activeStep);
    stepChangedAt.current = Date.now();
    bodyRef.current?.scrollTo({ top: 0 });
    bodyRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
  }, [activeStep, onStepChange]);

  const goToStep = (step: number) => {
    setSubmitError(null);
    setActiveStep(step);
    trackEvent("booking_step_change", { source, locale, step: step + 1 });
  };

  const validateStep = (step: number) => {
    const fields = STEP_FIELDS[step] ?? [];
    const mask = Object.fromEntries(fields.map((name) => [name, true])) as Partial<Record<FieldName, true>>;
    const parsed = bookingFormSchema.pick(mask).safeParse(getValues());

    clearErrors(fields);
    if (parsed.success) {
      return true;
    }

    const fieldErrors = parsed.error.flatten().fieldErrors as Partial<Record<FieldName, string[]>>;
    const invalidFields = fields.filter((name) => fieldErrors[name]?.length);
    invalidFields.forEach((name) => setError(name, { message: fieldErrors[name]?.[0] }));
    if (invalidFields[0] && invalidFields[0] !== "preferredSlots") {
      setFocus(invalidFields[0]);
    }
    trackEvent("booking_validation_failure", { source, locale, step: step + 1, fields: invalidFields });
    return false;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      goToStep(Math.min(activeStep + 1, LAST_STEP));
    }
  };

  const submit = async () => {
    setSubmitError(null);

    const parsed = bookingFormSchema.safeParse(getValues());
    if (!parsed.success) {
      // Earlier steps validated already, so this only trips on stale data; send them back to it.
      const fieldErrors = parsed.error.flatten().fieldErrors as Partial<Record<FieldName, string[]>>;
      const firstBadStep = STEP_FIELDS.findIndex((fields) => fields.some((name) => fieldErrors[name]?.length));
      trackEvent("booking_validation_failure", { source, locale, fields: Object.keys(fieldErrors) });
      if (firstBadStep >= 0) {
        goToStep(firstBadStep);
        window.setTimeout(() => validateStep(firstBadStep), 0);
      } else {
        setSubmitError(t("errors.generic"));
      }
      return;
    }

    setSubmissionState({ status: "submitting" });

    let response: Response;
    let result: LeadApiSuccess | LeadApiFailure;

    try {
      response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });
      result = (await response.json()) as LeadApiSuccess | LeadApiFailure;
    } catch {
      setSubmitError(t("errors.generic"));
      setSubmissionState({ status: "idle" });
      return;
    }

    if (!response.ok || !result.ok) {
      if ("fieldErrors" in result && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([name, messages]) => {
          if (messages?.[0]) {
            setError(name as FieldName, { message: messages[0] });
          }
        });
      }

      setSubmitError("message" in result ? result.message : t("errors.generic"));
      setSubmissionState({ status: "idle" });
      trackEvent("booking_validation_failure", {
        source,
        locale,
        status: response.status,
      });
      return;
    }

    setSubmissionState({ status: "success", leadId: result.leadId });
    onComplete();
    trackEvent("booking_submission_success", {
      source,
      locale,
      leadId: result.leadId,
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Enter in a text field means "continue", not "send the request" from step one.
    if (activeStep < LAST_STEP) {
      nextStep();
      return;
    }

    // Swallows the second half of a double-click on Next that lands on the Send button.
    if (isSubmitting || Date.now() - stepChangedAt.current < 400) {
      return;
    }

    void submit();
  };

  const errorText = (name: FieldName) => {
    const key = ERROR_KEYS[name];
    return errors[name] && key ? t(key) : undefined;
  };

  const inputClassName = (name?: FieldName) =>
    cn(
      "w-full rounded-2xl border bg-white px-4 py-3 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/15 sm:text-sm",
      name && errors[name] ? "border-red-300" : "border-slate-200"
    );

  if (submissionState.status === "success") {
    return (
      <>
        <DialogHeader onClose={() => onRequestClose("close_button")} />
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4 sm:px-8">
          <SuccessState
            leadId={submissionState.leadId}
            slotLabel={selectedPreferredSlot ? formatPreferredSlotValue(selectedPreferredSlot, locale) : null}
            onDone={() => onRequestClose("success_done")}
          />
        </div>
      </>
    );
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit} noValidate>
      <DialogHeader onClose={() => onRequestClose("close_button")} />
      <StepProgress activeStep={activeStep} onStepClick={goToStep} />

      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        {activeStep === 0 ? (
          <div className="space-y-6">
            <StepHeader title={t("stepper.steps.student")} description={t("stepper.studentDescription")} />
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
              <Field>
                <Label htmlFor={fieldId("studentName")}>{t("fields.studentName.label")}</Label>
                <input
                  id={fieldId("studentName")}
                  className={inputClassName("studentName")}
                  placeholder={t("fields.studentName.placeholder")}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.studentName)}
                  aria-describedby={errors.studentName ? fieldId("studentName-error") : undefined}
                  {...field("studentName")}
                />
                <FieldError id={fieldId("studentName-error")} message={errorText("studentName")} />
              </Field>
              <Field>
                <Label htmlFor={fieldId("studentAge")}>{t("fields.studentAge.label")}</Label>
                <select id={fieldId("studentAge")} className={inputClassName()} {...field("studentAge", { valueAsNumber: true })}>
                  {AGE_OPTIONS.map((age) => (
                    <option key={age} value={age}>
                      {t("ageOption", { age })}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <fieldset className="space-y-2">
              <legend className="mb-2 block text-sm font-black text-slate-900">{t("fields.previousExperience.label")}</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {EXPERIENCE_OPTIONS.map((value) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 transition-colors hover:border-brand-violet/40 has-[:checked]:border-brand-violet has-[:checked]:bg-brand-violet/5 has-[:checked]:text-slate-900 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-violet/30"
                  >
                    <input type="radio" value={value} className="mt-0.5 accent-brand-violet" {...field("previousExperience")} />
                    <span className="font-bold">{t(`experience.${value}`)}</span>
                  </label>
                ))}
              </div>
              <FieldError message={errorText("previousExperience")} />
            </fieldset>
          </div>
        ) : null}

        {activeStep === 1 ? (
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
                  setValue("preferredSlots", [], { shouldDirty: true });
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

                  clearErrors("preferredSlots");
                  setValue("preferredSlots", [buildPreferredSlotValue(selectedDate, timeValue)], { shouldDirty: true });
                }}
              />
            </div>
            {selectedPreferredSlot ? (
              <div className="rounded-2xl border border-brand-violet/20 bg-brand-violet/5 px-4 py-3 text-sm text-slate-700" aria-live="polite">
                <span className="font-black text-slate-900">{t("scheduler.selectedLabel")} </span>
                {formatPreferredSlotValue(selectedPreferredSlot, locale)}
              </div>
            ) : null}
            <FieldError message={errorText("preferredSlots")} />
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="space-y-6">
            <StepHeader title={t("stepper.steps.parent")} description={t("stepper.parentDescription")} />
            <Field>
              <Label htmlFor={fieldId("parentName")}>{t("fields.parentName.label")}</Label>
              <input
                id={fieldId("parentName")}
                className={inputClassName("parentName")}
                placeholder={t("fields.parentName.placeholder")}
                autoComplete="name"
                aria-invalid={Boolean(errors.parentName)}
                aria-describedby={errors.parentName ? fieldId("parentName-error") : undefined}
                {...field("parentName")}
              />
              <FieldError id={fieldId("parentName-error")} message={errorText("parentName")} />
            </Field>
            <Field>
              <Label htmlFor={fieldId("phoneNumber")}>{t("fields.phone.label")}</Label>
              <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3" dir="ltr">
                <select
                  aria-label={t("fields.phone.label")}
                  className={inputClassName("phoneCountryCode")}
                  {...field("phoneCountryCode")}
                >
                  {PHONE_COUNTRY_OPTIONS.map((option) => (
                    <option key={`${option.country}-${option.value}`} value={option.value}>
                      {option.country} {option.value}
                    </option>
                  ))}
                </select>
                <input
                  id={fieldId("phoneNumber")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  className={inputClassName("phoneNumber")}
                  placeholder={t("fields.phone.placeholder")}
                  aria-invalid={Boolean(errors.phoneNumber)}
                  aria-describedby={errors.phoneNumber || errors.phoneCountryCode ? fieldId("phone-error") : undefined}
                  {...field("phoneNumber")}
                />
              </div>
              <FieldError id={fieldId("phone-error")} message={errorText("phoneNumber") ?? errorText("phoneCountryCode")} />
            </Field>
            <Field>
              <Label htmlFor={fieldId("interestedPackage")}>{t("fields.interestedPackage.label")}</Label>
              <select id={fieldId("interestedPackage")} className={inputClassName("interestedPackage")} {...field("interestedPackage")}>
                <option value="not_sure">{t("packageOptions.not_sure")}</option>
                <option value="1">{t("packageOptions.1")}</option>
                <option value="3">{t("packageOptions.3")}</option>
                <option value="6">{t("packageOptions.6")}</option>
                <option value="12">{t("packageOptions.12")}</option>
              </select>
              <FieldError message={errorText("interestedPackage")} />
            </Field>
          </div>
        ) : null}

        {activeStep === 3 ? (
          <div className="space-y-5">
            <StepHeader title={t("stepper.steps.review")} description={t("stepper.reviewDescription")} />
            <SummaryGroup title={t("stepper.steps.student")} onEdit={() => goToStep(0)}>
              <SummaryItem label={t("fields.studentName.label")} value={values.studentName} />
              <SummaryItem label={t("fields.studentAge.label")} value={t("ageOption", { age: values.studentAge })} />
              <SummaryItem label={t("fields.previousExperience.label")} value={t(`experience.${values.previousExperience}`)} />
            </SummaryGroup>
            <SummaryGroup title={t("stepper.steps.schedule")} onEdit={() => goToStep(1)}>
              <SummaryItem
                label={t("fields.preferredSlots.label")}
                value={selectedPreferredSlot ? formatPreferredSlotValue(selectedPreferredSlot, locale) : "-"}
              />
              <SummaryItem label={t("timezone.label")} value={values.timezone} />
            </SummaryGroup>
            <SummaryGroup title={t("stepper.steps.parent")} onEdit={() => goToStep(2)}>
              <SummaryItem label={t("fields.parentName.label")} value={values.parentName} />
              <SummaryItem label={t("fields.phone.label")} value={formatPhoneNumber(values.phoneCountryCode, values.phoneNumber)} dir="ltr" />
              <SummaryItem
                label={t("fields.interestedPackage.label")}
                value={values.interestedPackage ? t(`packageOptions.${values.interestedPackage as "1" | "3" | "6" | "12" | "not_sure"}`) : "-"}
              />
            </SummaryGroup>
            <p className="text-xs leading-relaxed text-slate-500">{t("privacyNote")}</p>
          </div>
        ) : null}

        <input type="hidden" {...register("locale")} />
        <input type="hidden" {...register("timezone")} />
        <input type="hidden" {...register("countryCode")} />
        <input type="hidden" {...register("email")} />

        {submitError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            {submitError}
          </div>
        ) : null}
      </div>

      <footer className="flex items-center gap-3 border-t border-slate-100 bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
        {activeStep > 0 ? (
          <Button variant="ghost" size="lg" className="rounded-full px-4" onClick={() => goToStep(activeStep - 1)} disabled={isSubmitting}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {t("stepper.back")}
          </Button>
        ) : null}

        {activeStep < LAST_STEP ? (
          <Button key="next" type="submit" size="lg" className="ms-auto min-w-36 flex-1 gap-1 rounded-full bg-brand-orange font-black text-white hover:bg-brand-orange/90 sm:flex-none">
            {t("stepper.next")}
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        ) : (
          <Button
            key="submit"
            type="submit"
            size="lg"
            className="ms-auto min-w-44 flex-1 rounded-full bg-brand-orange font-black text-white hover:bg-brand-orange/90 sm:flex-none"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? t("submitting") : common("bookFreeTrial")}
          </Button>
        )}
      </footer>
    </form>
  );
}

function DialogHeader({ onClose }: { onClose: () => void }) {
  const t = useTranslations("BookingModal");

  return (
    <header className="shrink-0 px-5 pt-3 sm:px-8 sm:pt-7">
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h2 id="booking-dialog-title" className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            {t("stepper.title")}
          </h2>
          <p className="text-sm font-bold text-brand-violet">{t("stepper.reassurance")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-violet"
          aria-label={t("close")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

function StepProgress({ activeStep, onStepClick }: { activeStep: number; onStepClick: (step: number) => void }) {
  const t = useTranslations("BookingModal");
  const progressLabel = t("stepper.progress", { current: activeStep + 1, total: STEP_KEYS.length });

  return (
    <nav className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-4 sm:px-8" aria-label={progressLabel}>
      <ol className="grid grid-cols-4 gap-2">
        {STEP_KEYS.map((key, index) => {
          const isDone = index < activeStep;
          const isActive = index === activeStep;
          const label = t(`stepper.steps.${key}`);
          const content = (
            <>
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-colors duration-300",
                  isDone || isActive ? "bg-brand-violet" : "bg-slate-200"
                )}
              />
              <span
                className={cn(
                  "mt-2 hidden truncate text-xs font-black sm:block",
                  isActive ? "text-slate-900" : isDone ? "text-brand-violet" : "text-slate-400"
                )}
              >
                {label}
              </span>
            </>
          );

          return (
            <li key={key} aria-current={isActive ? "step" : undefined}>
              {isDone ? (
                <button type="button" className="block w-full text-start" onClick={() => onStepClick(index)} aria-label={label}>
                  {content}
                </button>
              ) : (
                <div aria-label={isActive ? label : undefined}>{content}</div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs font-bold text-slate-500 sm:hidden" aria-hidden="true">
        {progressLabel} · <span className="text-slate-900">{t(`stepper.steps.${STEP_KEYS[activeStep]}`)}</span>
      </p>
    </nav>
  );
}

function splitPreferredSlot(value: string) {
  const [dateKey, timeValue] = value.split("T");
  return dateKey && timeValue ? { dateKey, timeValue } : null;
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1.5">
      <h3 tabIndex={-1} data-autofocus className="text-lg font-black tracking-tight text-slate-900 outline-none sm:text-xl">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-black text-slate-900">
      {children}
    </label>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-sm font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

function SummaryGroup({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  const t = useTranslations("BookingModal");

  return (
    <section className="rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h4 className="text-sm font-black text-slate-900">{title}</h4>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-brand-violet transition-colors hover:bg-brand-violet/10"
        >
          <Pencil className="h-3.5 w-3.5" />
          {t("stepper.edit")}
        </button>
      </div>
      <dl className="divide-y divide-slate-100">{children}</dl>
    </section>
  );
}

function SummaryItem({ label, value, dir }: { label: string; value: string; dir?: "ltr" }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-xs font-bold text-slate-500">{label}</dt>
      <dd className="text-sm font-bold text-slate-900 sm:text-end" dir={dir}>
        {value}
      </dd>
    </div>
  );
}

function SuccessState({ leadId, slotLabel, onDone }: { leadId: string; slotLabel: string | null; onDone: () => void }) {
  const t = useTranslations("BookingModal");
  const common = useTranslations("Common");
  const locale = useLocale() as "ar" | "en";

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center" aria-live="polite">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-violet/10 text-brand-violet">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <div className="space-y-3">
        <h3 tabIndex={-1} data-autofocus className="text-2xl font-black tracking-tight text-slate-900 outline-none sm:text-3xl">
          {t("success.title")}
        </h3>
        <p className="mx-auto max-w-md text-base leading-relaxed text-slate-600">{t("success.description")}</p>
        <p className="text-sm font-bold text-brand-orange">{t("success.nextStep")}</p>
      </div>
      {slotLabel ? (
        <div className="rounded-2xl border border-brand-violet/20 bg-brand-violet/5 px-4 py-3 text-sm text-slate-700">
          <span className="font-black text-slate-900">{t("scheduler.selectedLabel")} </span>
          {slotLabel}
        </div>
      ) : null}
      <p className="text-xs text-slate-400">{t("success.reference", { leadId })}</p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button size="lg" className="rounded-full bg-brand-orange px-8 font-black text-white hover:bg-brand-orange/90" onClick={onDone}>
          {t("success.done")}
        </Button>
        <a
          href={getWhatsAppUrl(locale)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#25D366] px-6 text-sm font-black text-[#128C7E] transition-colors hover:bg-[#25D366]/5"
        >
          <WhatsAppIcon size={18} />
          {common("contactViaWhatsApp")}
        </a>
      </div>
    </div>
  );
}
