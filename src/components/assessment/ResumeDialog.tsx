"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ResumeDialog({ onContinue, onRestart }: { onContinue: () => void; onRestart: () => void }) {
  const t = useTranslations("Assessment.resume");
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
        className="w-full max-w-md space-y-6 rounded-[2rem] bg-white p-6 text-center shadow-xl md:p-8"
      >
        <h2 id="resume-title" className="text-xl font-black leading-snug text-slate-900 md:text-2xl">
          {t("title")}
        </h2>
        <div className="flex flex-col gap-3">
          <Button ref={continueRef} size="lg" className="bg-brand-orange text-white hover:bg-brand-orange/90" onClick={onContinue}>
            {t("continue")}
          </Button>
          <Button size="lg" variant="outline" onClick={onRestart}>
            {t("restart")}
          </Button>
        </div>
      </div>
    </div>
  );
}
