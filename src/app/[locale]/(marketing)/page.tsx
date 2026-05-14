import { getTranslations } from "next-intl/server";
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
import FinalCtaSection from "@/components/marketing/FinalCtaSection";
import { getSiteUrl, getWhatsAppUrl, SITE_NAME, SITE_PHONE_NUMBER, SITE_EMAIL } from "@/lib/site";
import { Locale } from "@/navigation";
import { setRequestLocale } from "next-intl/server";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
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
        ? "أكاديمية iMath تقدم جلسات حساب ذهني فردية 1:1 أونلاين للأطفال من عمر 4 إلى 18 سنة عبر منهج UCMath المعتمد."
        : "iMath provides bilingual 1:1 Mental Math sessions for children ages 4-18 through the certified UCMath methodology.",
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
      <Benefits locale={locale} />
      <TrustSection locale={locale} />
      <MentalMathSection />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <BookingStepperSection />
      <FAQ />
      <FinalCtaSection locale={locale} whatsAppUrl={whatsAppUrl} />
    </div>
  );
}
