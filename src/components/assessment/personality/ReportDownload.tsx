"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import { ReportPages } from "@/components/assessment/personality/report/ReportPages";
import { trackEvent } from "@/lib/analytics";
import type { AssessmentLocale } from "@/lib/assessment/common";
import { renderPagesToPdf, toSafeFileName } from "@/lib/assessment/pdf";
import type { PersonalityReport } from "@/lib/assessment/personality/report";
import { getWhatsAppUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Status = "idle" | "preparing" | "error";

export function ReportDownload({ report, className }: { report: PersonalityReport; className?: string }) {
  const locale = useLocale() as AssessmentLocale;
  const t = useTranslations("Assessment.personality.pdf");
  const [status, setStatus] = useState<Status>("idle");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const start = async () => {
    if (status === "preparing") {
      return;
    }

    setStatus("preparing");
    trackEvent("assessment_pdf_requested", { profile: report.profile });

    try {
      // The QR code sends parents straight to a WhatsApp chat with iMath.
      const { toDataURL } = await import("qrcode");
      setQrDataUrl(await toDataURL(getWhatsAppUrl(locale), { margin: 1, width: 340, color: { dark: "#4c1d95", light: "#ffffff" } }));
    } catch {
      setStatus("error");
    }
  };

  const finish = (ok: boolean) => {
    setQrDataUrl(null);
    setStatus(ok ? "idle" : "error");

    if (ok) {
      trackEvent("assessment_pdf_downloaded", { profile: report.profile });
    }
  };

  return (
    <div className={cn("space-y-2 text-center", className)}>
      <button
        type="button"
        onClick={start}
        disabled={status === "preparing"}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-violet px-8 py-4 text-base font-black text-white shadow-premium transition-all hover:opacity-90 active:scale-95 disabled:opacity-70"
      >
        {status === "preparing" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
        {status === "preparing" ? t("preparing") : t("download", { name: report.name })}
      </button>
      {status === "error" ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {t("error")}
        </p>
      ) : null}

      {qrDataUrl ? <PdfExporter report={report} locale={locale} qrDataUrl={qrDataUrl} onDone={finish} /> : null}
    </div>
  );
}

/** Mounts the report pages off-screen, captures them into a PDF, saves it, then goes away. */
function PdfExporter({
  report,
  locale,
  qrDataUrl,
  onDone,
}: {
  report: PersonalityReport;
  locale: AssessmentLocale;
  qrDataUrl: string;
  onDone: (ok: boolean) => void;
}) {
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

  return (
    <div
      ref={rootRef}
      data-pdf-root
      aria-hidden="true"
      style={{ position: "fixed", top: 0, left: -10000, width: 794, pointerEvents: "none", textAlign: "start" }}
    >
      <ReportPages report={report} locale={locale} qrDataUrl={qrDataUrl} siteUrl={window.location.origin} />
    </div>
  );
}
