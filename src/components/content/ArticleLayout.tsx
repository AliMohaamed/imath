import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import type { ArticleCopy, ContentBlock } from "@/content/types";
import { Link, type Locale } from "@/navigation";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import { Breadcrumbs, type Crumb } from "@/components/content/Breadcrumbs";
import { RichText } from "@/components/content/RichText";

type ArticleLayoutProps = {
  locale: Locale;
  copy: ArticleCopy;
  breadcrumbs: Crumb[];
  updatedAt: string;
  sources?: Array<{ label: string; url: string }>;
  related?: Array<{ path: string; title: string; description: string }>;
};

function Block({ block }: { block: ContentBlock }) {
  if (block.type === "p") {
    return (
      <p className="text-lg leading-relaxed text-slate-700">
        <RichText text={block.text} />
      </p>
    );
  }
  const List = block.type === "ol" ? "ol" : "ul";
  return (
    <List className={`space-y-3 ps-6 text-lg leading-relaxed text-slate-700 ${block.type === "ol" ? "list-decimal" : "list-disc"} marker:text-brand-violet`}>
      {block.items.map((item) => (
        <li key={item}>
          <RichText text={item} />
        </li>
      ))}
    </List>
  );
}

/** Shared layout for guides and the program page: answer first, then sections, FAQ, sources and next steps. */
export async function ArticleLayout({ locale, copy, breadcrumbs, updatedAt, sources = [], related = [] }: ArticleLayoutProps) {
  const t = await getTranslations({ namespace: "Resources", locale });
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "long" }).format(new Date(updatedAt));
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <article className="bg-white py-12 md:py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <Breadcrumbs locale={locale} items={breadcrumbs} />

        <header className="mb-10 space-y-4">
          <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">{copy.h1}</h1>
          <p className="text-sm text-slate-500">
            {t("author")} · <time dateTime={updatedAt}>{t("updated", { date })}</time>
          </p>
        </header>

        <p className="mb-12 rounded-3xl border border-brand-violet/15 bg-brand-violet/[0.04] p-6 text-lg font-medium leading-relaxed text-slate-800 md:p-8 md:text-xl">
          {copy.summary}
        </p>

        <div className="space-y-12">
          {copy.sections.map((section) => (
            <section key={section.heading} className="space-y-5">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{section.heading}</h2>
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </section>
          ))}
        </div>

        {copy.faq.length > 0 && (
          <section className="mt-14 space-y-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{t("faqTitle")}</h2>
            {copy.faq.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-slate-100 bg-white open:border-brand-violet/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-black text-slate-900 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base md:text-lg">{item.question}</h3>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="border-t px-5 pb-5 pt-4 leading-relaxed text-slate-600">
                  <RichText text={item.answer} />
                </p>
              </details>
            ))}
          </section>
        )}

        <aside className="mt-14 space-y-5 rounded-3xl bg-slate-900 p-8 text-center text-white md:p-10">
          <h2 className="text-2xl font-black md:text-3xl">{t("ctaTitle")}</h2>
          <p className="text-slate-300">{t("ctaText")}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/assessment/level" className="rounded-full bg-white px-8 py-3 text-sm font-black text-slate-900 hover:opacity-90">
              {t("ctaTest")}
            </Link>
            <BookingCtaButton source="article_cta" className="rounded-full bg-brand-orange px-8 py-3 text-sm font-black text-white hover:opacity-90">
              {t("ctaTrial")}
            </BookingCtaButton>
          </div>
        </aside>

        {related.length > 0 && (
          <section className="mt-14 space-y-4">
            <h2 className="text-xl font-black text-slate-900">{t("relatedTitle")}</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className="group flex h-full flex-col gap-2 rounded-2xl border border-slate-100 p-5 hover:border-brand-violet/40">
                    <span className="font-black text-slate-900 group-hover:text-brand-violet">{item.title}</span>
                    <span className="text-sm leading-relaxed text-slate-600">{item.description}</span>
                    <Arrow className="mt-auto h-4 w-4 text-brand-violet" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sources.length > 0 && (
          <section className="mt-14 border-t pt-8">
            <h2 className="mb-4 text-lg font-black text-slate-900">{t("sourcesTitle")}</h2>
            <ol className="list-decimal space-y-2 ps-6 text-sm leading-relaxed text-slate-600" dir="ltr">
              {sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener" className="hover:text-brand-violet hover:underline">
                    {source.label}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </article>
  );
}
