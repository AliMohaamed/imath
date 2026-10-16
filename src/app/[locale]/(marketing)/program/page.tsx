import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleLayout } from "@/components/content/ArticleLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { PROGRAM_COPY, PROGRAM_UPDATED_AT } from "@/content/program";
import { stripLinks } from "@/content/resources";
import { buildPageMetadata } from "@/lib/seo";
import {
  breadcrumbSchema,
  faqSchema,
  graph,
  programSchema,
  webPageSchema,
} from "@/lib/structured-data";
import type { Locale } from "@/navigation";

const PATH = "/program";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = PROGRAM_COPY[locale];
  return buildPageMetadata({ locale, path: PATH, title: copy.title, description: copy.description });
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = PROGRAM_COPY[locale];
  const seo = await getTranslations({ namespace: "Seo", locale });
  const trail = [{ path: PATH, name: copy.title }];

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ locale, path: PATH, name: copy.title, description: copy.description, breadcrumb: true }),
          breadcrumbSchema(locale, PATH, seo("breadcrumbHome"), trail),
          programSchema(locale),
          faqSchema(locale, copy.faq.map((item) => ({ question: item.question, answer: stripLinks(item.answer) })))
        )}
      />
      <ArticleLayout
        locale={locale}
        copy={copy}
        updatedAt={PROGRAM_UPDATED_AT}
        breadcrumbs={[{ path: "/", name: seo("breadcrumbHome") }, ...trail]}
      />
    </>
  );
}
