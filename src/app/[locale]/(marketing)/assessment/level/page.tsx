import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LevelAssessment } from "@/components/assessment/level/LevelAssessment";
import { PageJsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/navigation";

async function getPageCopy(locale: Locale) {
  const t = await getTranslations({ namespace: "Seo", locale });
  const d = await getTranslations({ namespace: "Seo", locale });
  return { title: t("level.title"), description: d("level.description") };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { title, description } = await getPageCopy(locale);

  return buildPageMetadata({ locale, path: "/assessment/level", title, description });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { title, description } = await getPageCopy(locale);
  const seo = await getTranslations({ namespace: "Seo", locale });

  return (
    <>
      <PageJsonLd
        locale={locale}
        path="/assessment/level"
        name={title}
        description={description}
        trail={[
          { path: "/assessment", name: seo("assessment.title") },
          { path: "/assessment/level", name: title },
        ]}
      />
      <LevelAssessment />
    </>
  );
}
