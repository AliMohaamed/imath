import { getTranslations } from "next-intl/server";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import { Locale } from "@/navigation";

interface FinalCtaSectionProps {
  locale: Locale;
  whatsAppUrl: string;
}

export default async function FinalCtaSection({ locale, whatsAppUrl }: FinalCtaSectionProps) {
  const t = await getTranslations({ namespace: "Marketing.finalCta", locale });
  const common = await getTranslations({ namespace: "Common", locale });

  return (
    <section className="py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-brand-violet rounded-[3rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-10" />

          <div className="space-y-8 relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-6xl font-black tracking-tight leading-tight">
              {t.rich("title", {
                highlight: (chunks) => <span className="text-brand-yellow">{chunks}</span>,
              })}
            </h2>
            <p className="text-lg md:text-2xl text-white/80 font-medium leading-relaxed">
              {t("description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-2 md:pt-6">
              <BookingCtaButton 
                source="final_cta_primary" 
                className="px-12 py-5 bg-brand-orange text-white rounded-full font-black text-lg md:text-xl hover:bg-white hover:text-brand-orange transition-all shadow-premium hover:scale-105 active:scale-95"
              >
                {common("bookFreeTrial")}
              </BookingCtaButton>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="px-12 py-5 border-2 border-white/20 text-white rounded-full font-black text-lg md:text-xl hover:bg-white/10 transition-all active:scale-95"
              >
                {common("contactViaWhatsApp")}
              </a>
            </div>
            <div className="pt-6 md:pt-8 text-sm font-black uppercase tracking-widest text-white/40">
              {t("badge")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
