import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LevelAssessment } from "@/components/assessment/level/LevelAssessment";
import { getLocaleAlternates, getLocalePath } from "@/lib/site";
import type { Locale } from "@/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Assessment.level.intro", locale });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: getLocalePath(locale, "/assessment/level"),
      languages: getLocaleAlternates("/assessment/level"),
    },
  };
}

export default async function LevelAssessmentPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LevelAssessment />;
}
