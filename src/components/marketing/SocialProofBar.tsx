"use client";

import { useTranslations } from "next-intl";
import { Users, Award, ShieldCheck, Globe } from "lucide-react";

export default function SocialProofBar() {
  const t = useTranslations("Marketing.socialProofBar");

  const stats = [
    {
      icon: Users,
      label: t("students.label"),
      sublabel: t("students.sublabel"),
      color: "text-brand-violet",
    },
    {
      icon: Award,
      label: t("certified.label"),
      sublabel: t("certified.sublabel"),
      color: "text-brand-orange",
    },
    {
      icon: ShieldCheck,
      label: t("satisfaction.label"),
      sublabel: t("satisfaction.sublabel"),
      color: "text-brand-yellow",
    },
    {
      icon: Globe,
      label: t("bilingual.label"),
      sublabel: t("bilingual.sublabel"),
      color: "text-slate-600",
    },
  ];

  return (
    <div className="bg-white border-y border-slate-100 py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="space-y-1">
                <div className={`text-2xl md:text-3xl font-black ${stat.color} tracking-tight`}>
                  {stat.label}
                </div>
                <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.18em] text-slate-400 max-w-[120px]">
                  {stat.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
