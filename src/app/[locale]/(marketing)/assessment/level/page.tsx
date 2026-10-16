import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LevelAssessment } from "@/components/assessment/level/LevelAssessment";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Assessment.level.intro", locale });

  return buildPageMetadata({
    locale,
    path: "/assessment/level",
    title: t("title"),
    description: t("description"),
  });
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
