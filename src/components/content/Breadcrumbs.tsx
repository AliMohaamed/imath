import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, type Locale } from "@/navigation";

export type Crumb = { path: string; name: string };

/** Visible breadcrumb trail; the last item is the current page. Mirrors the BreadcrumbList JSON-LD. */
export function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  const Separator = locale === "ar" ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"} className="mb-8 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="font-bold text-slate-700">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="hover:text-brand-violet">
                    {item.name}
                  </Link>
                  <Separator className="h-3.5 w-3.5" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
