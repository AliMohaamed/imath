"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Link } from "@/navigation";

type AdminAuthFormProps = {
  locale: string;
};

export function AdminAuthForm({ locale }: AdminAuthFormProps) {
  const t = useTranslations("Admin.login");
  const common = useTranslations("Admin.common");
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (mode === "signUp" && password !== confirmPassword) {
      setErrorMessage(t("errors.passwordMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn("password", {
        email,
        password,
        flow: mode,
      });
      window.location.href = `/${locale}/admin`;
    } catch (error) {
      const message = error instanceof Error ? error.message : t("errors.generic");
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">{t("alreadySignedInTitle")}</h2>
        <p className="text-sm text-slate-600">{t("alreadySignedInDescription")}</p>
        <Link
          href="/admin"
          locale={locale as "ar" | "en"}
          className="inline-flex rounded-full bg-brand-violet px-6 py-3 text-sm font-black text-white"
        >
          {common("goToDashboard")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-3 text-center">
        <div className="inline-flex rounded-full bg-brand-violet/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-violet">
          {t("eyebrow")}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{t("title")}</h1>
        <p className="text-sm leading-relaxed text-slate-600">{t("description")}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm font-bold">
        <button
          type="button"
          onClick={() => setMode("signIn")}
          className={`rounded-full px-4 py-2 transition-colors ${mode === "signIn" ? "bg-white text-brand-violet shadow-sm" : "text-slate-500"}`}
        >
          {t("signIn")}
        </button>
        <button
          type="button"
          onClick={() => setMode("signUp")}
          className={`rounded-full px-4 py-2 transition-colors ${mode === "signUp" ? "bg-white text-brand-violet shadow-sm" : "text-slate-500"}`}
        >
          {t("signUp")}
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Field label={t("emailLabel")}>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/10"
          />
        </Field>

        <Field label={t("passwordLabel")}>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("passwordPlaceholder")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/10"
          />
        </Field>

        {mode === "signUp" ? (
          <Field label={t("confirmPasswordLabel")}>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t("confirmPasswordPlaceholder")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/10"
            />
          </Field>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
          {mode === "signUp" ? t("signUpHint") : t("signInHint")}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full rounded-full bg-brand-orange px-6 py-3 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t("submitting") : mode === "signUp" ? t("createAccount") : t("continue")}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-black text-slate-900">{label}</span>
      {children}
    </label>
  );
}
