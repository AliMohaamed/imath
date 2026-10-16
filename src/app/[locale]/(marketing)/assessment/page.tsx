import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AssessmentHub } from "@/components/assessment/AssessmentHub";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Assessment.hub", locale });

  return buildPageMetadata({
    locale,
    path: "/assessment",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AssessmentHub />;
}
