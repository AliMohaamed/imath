import { getTranslations } from "next-intl/server";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import Hero from "@/components/marketing/Hero";
import Benefits from "@/components/marketing/Benefits";
import HowItWorks from "@/components/marketing/HowItWorks";
import Pricing from "@/components/marketing/Pricing";
import FAQ from "@/components/marketing/FAQ";
import Testimonials from "@/components/marketing/Testimonials";
import TrustSection from "@/components/marketing/TrustSection";
import MentalMathSection from "@/components/marketing/MentalMathSection";
import SocialProofBar from "@/components/marketing/SocialProofBar";
import { BookingStepperSection } from "@/components/booking/BookingStepperSection";
import { getSiteUrl, getWhatsAppUrl, SITE_NAME, SITE_PHONE_NUMBER, SITE_EMAIL } from "@/lib/site";
import { Locale } from "@/navigation";

export default async function LandingPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const t = await getTranslations({ namespace: "Marketing.finalCta", locale });
  const common = await getTranslations({ namespace: "Common", locale });
  const faqT = await getTranslations({ namespace: "Marketing.faq", locale });
  const siteUrl = getSiteUrl();
  const whatsAppUrl = getWhatsAppUrl(locale);

  const faqItems = [
    "ages",
    "format",
    "mentalMath",
    "ucmath",
    "progress",
    "schedule",
    "languages",
  ] as const;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: siteUrl.toString(),
    email: SITE_EMAIL,
    telephone: SITE_PHONE_NUMBER,
    availableLanguage: ["ar", "en"],
    areaServed: ["EG", "SA", "KW", "AE", "QA"],
    description:
      locale === "ar"
        ? "أكاديمية iMath تقدم جلسات حساب ذهني فردية 1:1 أونلاين للأطفال من عمر 5 إلى 14 سنة عبر منهج UCMath المعتمد."
        : "iMath provides bilingual 1:1 Mental Math sessions for children ages 5-14 through the certified UCMath methodology.",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faqItems.map((key) => ({
      "@type": "Question",
      name: faqT(`items.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: faqT(`items.${key}.answer`),
      },
    })),
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <SocialProofBar />
      <Benefits />
      <TrustSection locale={locale} />
      <MentalMathSection />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <BookingStepperSection />
      <FAQ />

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
                <BookingCtaButton source="final_cta_primary" className="px-12 py-5 bg-brand-orange text-white rounded-full font-black text-lg md:text-xl hover:bg-white hover:text-brand-orange transition-all shadow-premium hover:scale-105 active:scale-95">
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
    </div>
  );
}
