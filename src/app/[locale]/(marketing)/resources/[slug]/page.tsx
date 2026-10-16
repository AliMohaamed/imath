import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleLayout } from "@/components/content/ArticleLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { getResource, RESOURCES, stripLinks } from "@/content/resources";
import { buildPageMetadata, OG_IMAGES } from "@/lib/seo";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  graph,
  webPageSchema,
} from "@/lib/structured-data";
import type { Locale } from "@/navigation";

type Params = Promise<{ locale: Locale; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return RESOURCES.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const resource = getResource(slug);
  if (!resource) return {};
  const copy = resource.copy[locale];
  return buildPageMetadata({ locale, path: `/resources/${slug}`, title: copy.title, description: copy.description });
}

export default async function ResourcePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const resource = getResource(slug);
  if (!resource) notFound();

  const path = `/resources/${slug}`;
  const copy = resource.copy[locale];
  const t = await getTranslations({ namespace: "Resources", locale });
  const seo = await getTranslations({ namespace: "Seo", locale });
  const trail = [
    { path: "/resources", name: t("breadcrumb") },
    { path, name: copy.title },
  ];

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ locale, path, name: copy.title, description: copy.description, breadcrumb: true }),
          articleSchema({
            locale,
            path,
            headline: copy.h1,
            description: copy.description,
            image: OG_IMAGES[locale].url,
            datePublished: resource.publishedAt,
            dateModified: resource.updatedAt,
          }),
          breadcrumbSchema(locale, path, seo("breadcrumbHome"), trail),
          faqSchema(locale, copy.faq.map((item) => ({ question: item.question, answer: stripLinks(item.answer) })))
        )}
      />
      <ArticleLayout
        locale={locale}
        copy={copy}
        updatedAt={resource.updatedAt}
        sources={resource.sources}
        breadcrumbs={[{ path: "/", name: seo("breadcrumbHome") }, ...trail]}
        related={resource.related.flatMap((relatedSlug) => {
          const related = getResource(relatedSlug);
          return related
            ? [{ path: `/resources/${relatedSlug}`, title: related.copy[locale].title, description: related.copy[locale].description }]
            : [];
        })}
      />
    </>
  );
}
