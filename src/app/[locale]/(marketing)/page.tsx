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
import AssessmentPromo from "@/components/marketing/AssessmentPromo";
import { BookingStepperSection } from "@/components/booking/BookingStepperSection";
import FinalCtaSection from "@/components/marketing/FinalCtaSection";
import type { Metadata } from "next";
import { getWhatsAppUrl } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import { FAQ_ITEM_KEYS } from "@/lib/faq";
import {
  faqSchema,
  graph,
  organizationSchema,
  programSchema,
  websiteSchema,
  webPageSchema,
} from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Locale } from "@/navigation";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Seo.home", locale });

  return buildPageMetadata({
    locale,
    path: "/",
    title: t("title"),
    description: t("description"),
    absoluteTitle: true,
  });
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const faqT = await getTranslations({ namespace: "Marketing.faq", locale });
  const seoT = await getTranslations({ namespace: "Seo.home", locale });
  const whatsAppUrl = getWhatsAppUrl(locale);

  const pageJsonLd = graph(
    organizationSchema(locale),
    websiteSchema(),
    webPageSchema({ locale, path: "/", name: seoT("title"), description: seoT("description") }),
    programSchema(locale)
  );
  const faqJsonLd = {
    "@context": "https://schema.org",
    ...faqSchema(
      locale,
      FAQ_ITEM_KEYS.map((key) => ({
        question: faqT(`items.${key}.question`),
        answer: faqT(`items.${key}.answer`),
      }))
    ),
  };

  return (
    <div className="flex flex-col">
      <JsonLd data={pageJsonLd} />
      <JsonLd data={faqJsonLd} />
      <Hero />
      <SocialProofBar />
      <Benefits locale={locale} />
      <TrustSection locale={locale} />
      <MentalMathSection />
      <HowItWorks />
      <AssessmentPromo />
      <Testimonials />
      <Pricing />
      <BookingStepperSection />
      <FAQ />
      <FinalCtaSection locale={locale} whatsAppUrl={whatsAppUrl} />
    </div>
  );
}
