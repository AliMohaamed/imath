"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link, usePathname } from "@/navigation";

type AdminShellClientProps = {
  children: ReactNode;
  locale: string;
};

export function AdminShellClient({ children, locale }: AdminShellClientProps) {
  const t = useTranslations("Admin.common");
  const pathname = usePathname();
  const { signOut } = useAuthActions();

  const navItems = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/login", label: t("login") },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-8 px-4 py-8 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:block">
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-brand-violet">{t("eyebrow")}</div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">{t("shellTitle")}</h1>
            <p className="text-sm leading-relaxed text-slate-600">{t("shellDescription")}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname === `/${locale}${item.href}`;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  locale={locale as "ar" | "en"}
                  className={`block rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${isActive ? "bg-brand-violet text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 space-y-6">
          <header className="rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">{t("headerTitle")}</h2>
                <p className="text-sm text-slate-600">{t("headerDescription")}</p>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex rounded-full border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-700 transition-colors hover:bg-slate-100"
              >
                {t("signOut")}
              </button>
            </div>
          </header>

          <main className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
