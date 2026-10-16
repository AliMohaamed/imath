import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TermsContent } from "@/components/legal/TermsContent";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Terms", locale });

  return buildPageMetadata({
    locale,
    path: "/terms",
    title: t("title"),
    description: t("description"),
  });
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TermsContent />;
}
