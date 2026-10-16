import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { PageJsonLd } from "@/components/seo/JsonLd";
import { RESOURCES } from "@/content/resources";
import { buildPageMetadata } from "@/lib/seo";
import { Link, type Locale } from "@/navigation";

const PATH = "/resources";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Resources.hub", locale });
  return buildPageMetadata({ locale, path: PATH, title: t("title"), description: t("description") });
}

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ namespace: "Resources", locale });
  const seo = await getTranslations({ namespace: "Seo", locale });
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const cards = [
    { path: "/program", title: t("hub.programTitle"), description: t("hub.programText") },
    ...RESOURCES.map((resource) => ({
      path: `/resources/${resource.slug}`,
      title: resource.copy[locale].title,
      description: resource.copy[locale].description,
    })),
  ];

  return (
    <>
      <PageJsonLd
        locale={locale}
        path={PATH}
        name={t("hub.title")}
        description={t("hub.description")}
        trail={[{ path: PATH, name: t("breadcrumb") }]}
      />
      <div className="bg-slate-50/50 py-12 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <Breadcrumbs
            locale={locale}
            items={[
              { path: "/", name: seo("breadcrumbHome") },
              { path: PATH, name: t("breadcrumb") },
            ]}
          />
          <header className="mb-12 max-w-3xl space-y-4">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">{t("hub.h1")}</h1>
            <p className="text-lg leading-relaxed text-slate-600">{t("hub.intro")}</p>
          </header>
          <ul className="grid gap-6 md:grid-cols-2">
            {cards.map((card) => (
              <li key={card.path}>
                <Link
                  href={card.path}
                  className="group flex h-full flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-colors hover:border-brand-violet/40"
                >
                  <h2 className="text-xl font-black text-slate-900 group-hover:text-brand-violet">{card.title}</h2>
                  <p className="leading-relaxed text-slate-600">{card.description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-black text-brand-violet">
                    {t("hub.readMore")} <Arrow className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
