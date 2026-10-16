"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NextIntlClientProvider, useLocale, useTranslations, type AbstractIntlMessages } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import { ReportPages } from "@/components/assessment/personality/report/ReportPages";
import { trackEvent } from "@/lib/analytics";
import type { AssessmentLocale, ChildGender } from "@/lib/assessment/common";
import { renderPagesToPdf, toSafeFileName } from "@/lib/assessment/pdf";
import { buildReport, type PersonalityReport } from "@/lib/assessment/personality/report";
import type { PersonalityScore } from "@/lib/assessment/personality/scoring";
import { getWhatsAppUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Status = "idle" | "preparing" | "error";

/** Each option is written in its own language, so a parent can always find theirs. */
const REPORT_LANGUAGES: Array<{ locale: AssessmentLocale; label: string }> = [
  { locale: "ar", label: "العربية" },
  { locale: "en", label: "English" },
];

/** The other language's UI strings, only fetched when a parent asks for a report in it. */
function loadMessages(locale: AssessmentLocale): Promise<AbstractIntlMessages> {
  return locale === "ar"
    ? import("../../../../messages/ar.json").then((module) => module.default)
    : import("../../../../messages/en.json").then((module) => module.default);
}

type Export = { report: PersonalityReport; locale: AssessmentLocale; qrDataUrl: string; messages: AbstractIntlMessages | null };

export function ReportDownload({
  score,
  name,
  gender,
  className,
}: {
  score: PersonalityScore;
  name: string;
  gender: ChildGender;
  className?: string;
}) {
  const pageLocale = useLocale() as AssessmentLocale;
  const t = useTranslations("Assessment.personality.pdf");
  const [status, setStatus] = useState<Status>("idle");
  // The report defaults to the page's language; parents can pick the other one before downloading.
  const [reportLocale, setReportLocale] = useState<AssessmentLocale>(pageLocale);
  const [pending, setPending] = useState<Export | null>(null);

  const report = useMemo(
    () => buildReport({ score, name, gender, locale: reportLocale }),
    [score, name, gender, reportLocale]
  );

  const start = async () => {
    if (status === "preparing") {
      return;
    }

    setStatus("preparing");
    trackEvent("assessment_pdf_requested", { profile: report.profile, language: reportLocale });

    try {
      // The QR code sends parents straight to a WhatsApp chat with iMath, in the report's language.
      const [{ toDataURL }, messages] = await Promise.all([
        import("qrcode"),
        reportLocale === pageLocale ? null : loadMessages(reportLocale),
      ]);
      const qrDataUrl = await toDataURL(getWhatsAppUrl(reportLocale), {
        margin: 1,
        width: 340,
        color: { dark: "#4c1d95", light: "#ffffff" },
      });
      setPending({ report, locale: reportLocale, qrDataUrl, messages });
    } catch {
      setStatus("error");
    }
  };

  const finish = (ok: boolean) => {
    const done = pending;
    setPending(null);
    setStatus(ok ? "idle" : "error");

    if (ok && done) {
      trackEvent("assessment_pdf_downloaded", { profile: done.report.profile, language: done.locale });
    }
  };

  return (
    <div className={cn("space-y-3 text-center", className)}>
      <button
        type="button"
        onClick={start}
        disabled={status === "preparing"}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-violet px-8 py-4 text-base font-black text-white shadow-premium transition-all hover:opacity-90 active:scale-95 disabled:opacity-70"
      >
        {status === "preparing" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
        {status === "preparing" ? t("preparing") : t("download", { name })}
      </button>

      <fieldset className="flex flex-wrap items-center justify-center gap-2 text-sm" disabled={status === "preparing"}>
        <legend className="sr-only">{t("language")}</legend>
        <span aria-hidden="true" className="font-bold text-slate-500">
          {t("language")}
        </span>
        <div className="inline-flex rounded-full bg-slate-100 p-1">
          {REPORT_LANGUAGES.map(({ locale, label }) => (
            <label
              key={locale}
              lang={locale}
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 font-black transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-violet",
                reportLocale === locale ? "bg-white text-brand-violet shadow-sm" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <input
                type="radio"
                name="report-language"
                value={locale}
                checked={reportLocale === locale}
                onChange={() => setReportLocale(locale)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {status === "error" ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {t("error")}
        </p>
      ) : null}

      {pending ? <PdfExporter {...pending} onDone={finish} /> : null}
    </div>
  );
}

/** Mounts the report pages off-screen, captures them into a PDF, saves it, then goes away. */
function PdfExporter({ report, locale, qrDataUrl, messages, onDone }: Export & { onDone: (ok: boolean) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !rootRef.current) {
      return;
    }
    started.current = true;

    (async () => {
      try {
        const pdf = await renderPagesToPdf(rootRef.current as HTMLElement);
        pdf.save(`iMath-Personality-${toSafeFileName(report.name)}.pdf`);
        onDone(true);
      } catch (error) {
        console.error("[assessment] PDF export failed:", error);
        onDone(false);
      }
    })();
  }, [report.name, onDone]);

  const pages = <ReportPages report={report} locale={locale} qrDataUrl={qrDataUrl} siteUrl={window.location.origin} />;

  return (
    <div
      ref={rootRef}
      data-pdf-root
      aria-hidden="true"
      style={{ position: "fixed", top: 0, left: -10000, width: 794, pointerEvents: "none", textAlign: "start" }}
    >
      {/* A report in the other language needs that language's strings, not the page's. */}
      {messages ? (
        <NextIntlClientProvider locale={locale} messages={messages}>
          {pages}
        </NextIntlClientProvider>
      ) : (
        pages
      )}
    </div>
  );
}
