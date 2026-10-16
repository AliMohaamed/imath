import { getTranslations } from "next-intl/server";
import type { Locale } from "@/navigation";
import { breadcrumbSchema, graph, serializeJsonLd, webPageSchema } from "@/lib/structured-data";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

type PageJsonLdProps = {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  /** Breadcrumb trail below Home, ending with this page. */
  trail: Array<{ path: string; name: string }>;
};

/** WebPage + BreadcrumbList for an inner page, linked to the site-wide Organization/WebSite by @id. */
export async function PageJsonLd({ locale, path, name, description, trail }: PageJsonLdProps) {
  const t = await getTranslations({ namespace: "Seo", locale });

  return (
    <JsonLd
      data={graph(
        webPageSchema({ locale, path, name, description, breadcrumb: true }),
        breadcrumbSchema(locale, path, t("breadcrumbHome"), trail)
      )}
    />
  );
}
