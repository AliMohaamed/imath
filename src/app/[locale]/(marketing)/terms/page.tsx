"use client";

import { useTranslations } from "next-intl";
import { FileText, Calendar, CreditCard, Clock } from "lucide-react";

export default function TermsPage() {
  const t = useTranslations("Terms");

  const sections = [
    { key: "sessions", icon: Clock, color: "bg-brand-violet/10 text-brand-violet" },
    { key: "cancellation", icon: Calendar, color: "bg-brand-orange/10 text-brand-orange" },
    { key: "payments", icon: CreditCard, color: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="py-20 bg-slate-50/50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-4 mb-16 text-center">
          <div className="inline-flex rounded-full bg-brand-violet/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-violet">
             {t("lastUpdated")}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="space-y-8">
          {sections.map(({ key, icon: Icon, color }) => (
            <div key={key} className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">
                  {t(`sections.${key}.title`)}
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                {t(`sections.${key}.content`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-slate-900 text-white text-center space-y-4">
          <FileText className="w-12 h-12 mx-auto opacity-50" />
          <p className="text-sm font-medium opacity-80">
            {t("title")} - iMath Academy © 2024
          </p>
        </div>
      </div>
    </div>
  );
}
