import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PersonalityAssessment } from "@/components/assessment/personality/PersonalityAssessment";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Assessment.personality.intro", locale });

  return buildPageMetadata({
    locale,
    path: "/assessment/personality",
    title: t("title"),
    description: t("description"),
  });
}

export default async function PersonalityAssessmentPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PersonalityAssessment />;
}
