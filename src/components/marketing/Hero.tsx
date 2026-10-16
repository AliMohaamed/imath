import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, MessageCircle, Star, Zap } from "lucide-react";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsAppUrl } from "@/lib/site";

export default function Hero() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("Marketing.hero");
  const common = useTranslations("Common");
  const whatsAppUrl = getWhatsAppUrl(locale);

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-12 md:pt-24 md:pb-32">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-brand-violet/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-96 w-96 rounded-full bg-brand-orange/5 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* No entrance animation here: this image is the LCP element and must paint immediately. */}
          <div className="relative lg:order-last">
            <div className="relative z-10 mx-auto max-w-[320px] sm:max-w-[400px] lg:max-w-[600px]">
              <Image
                src="/images/imath-student-mental-math.webp"
                alt="iMath Student"
                width={1200}
                height={1200}
                className="w-full h-auto"
                preload
                fetchPriority="high"
                sizes="(max-width: 640px) 320px, (max-width: 1024px) 400px, 600px"
              />
            </div>
          </div>

          <div className="max-w-2xl space-y-6 text-center animate-in slide-in-from-bottom duration-1000 lg:text-left rtl:lg:text-right lg:order-first">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-violet/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-violet">
              <Star className="h-3.5 w-3.5 fill-current" />
              {t("badge")}
            </div>

            <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-6xl">
              {t.rich("title", {
                highlight: (chunks) => <span className="text-brand-violet">{chunks}</span>,
              })}
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg md:mx-0 md:text-xl">
              {t("description")}
            </p>

            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row lg:justify-start">
              <BookingCtaButton source="hero_primary" className="flex items-center justify-center gap-2 rounded-full bg-brand-orange px-10 py-4 text-lg font-black text-white shadow-premium transition-all hover:scale-105 hover:opacity-90">
                {common("bookFreeTrial")}
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </BookingCtaButton>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border-2 border-[#25D366] px-10 py-4 text-lg font-black text-[#25D366] transition-all hover:bg-[#25D366]/5 sm:w-auto"
              >
                <WhatsAppIcon />
                {common("contactViaWhatsApp")}
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 lg:justify-start lg:gap-4">
              <div className="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600">
                {t("trustBadges.certifiedTutors")}
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600">
                {t("trustBadges.bilingualSupport")}
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600">
                {t("trustBadges.oneToOneSessions")}
              </div>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold uppercase tracking-widest text-brand-orange underline-offset-4 hover:underline"
              >
                {common("contactUs")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
