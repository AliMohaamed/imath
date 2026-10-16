"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Link, usePathname } from "@/navigation";

type AdminShellClientProps = {
  children: ReactNode;
  locale: string;
};

export function AdminShellClient({ children, locale }: AdminShellClientProps) {
  const t = useTranslations("Admin.common");
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  const navItems = [
    { href: "/admin", label: t("dashboard") },
    ...(isAuthenticated ? [] : [{ href: "/admin/login", label: t("login") }]),
  ];

  const signOutButton = isAuthenticated ? (
    <button
      type="button"
      onClick={() => void signOut()}
      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
    >
      {t("signOut")}
    </button>
  ) : null;

  return (
    <div className="admin-root min-h-screen bg-slate-100/70">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-violet text-sm font-black text-white" aria-hidden>
            iM
          </span>
          <span className="text-base font-black text-slate-900">{t("shellTitle")}</span>
        </div>
        {signOutButton}
      </header>

      <div className="mx-auto flex max-w-[96rem] lg:gap-6 lg:px-6 lg:py-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 lg:flex">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-violet text-sm font-black text-white" aria-hidden>
              iM
            </span>
            <div>
              <h1 className="text-lg font-black leading-tight text-slate-900">{t("shellTitle")}</h1>
              <p className="text-xs font-medium text-slate-500">{t("eyebrow")}</p>
            </div>
          </div>

          <nav aria-label={t("menu")} className="mt-8 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname === `/${locale}${item.href}`;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  locale={locale as "ar" | "en"}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                    isActive ? "bg-brand-violet/10 text-brand-violet" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <p className="text-xs leading-relaxed text-slate-500">{t("shellDescription")}</p>
            {signOutButton}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 lg:px-0 lg:py-0">
          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{t("headerTitle")}</h2>
            <p className="text-sm text-slate-600">{t("headerDescription")}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
