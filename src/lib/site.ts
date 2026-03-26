import { defaultLocale, locales, type Locale } from "@/navigation";

type SiteCopy = {
  title: string;
  description: string;
  keywords: string[];
};

const SITE_COPY: Record<Locale, SiteCopy> = {
  ar: {
    title: "iMath | أكاديمية حساب ذهني 1:1 أونلاين للأطفال",
    description:
      "iMath تقدم جلسات حساب ذهني فردية 1:1 للأطفال من عمر 5 إلى 14 سنة بمنهج UCMath المعتمد وباللغتين العربية والإنجليزية.",
    keywords: [
      "iMath",
      "الحساب الذهني",
      "يو سي ماث",
      "UCMath",
      "حساب ذهني للأطفال",
      "أونلاين 1:1",
      "تعليم الحساب الذهني",
      "دروس بالعربية والإنجليزية",
    ],
  },
  en: {
    title: "iMath | 1:1 Mental Math and UCMath for Ages 5-14",
    description:
      "iMath delivers bilingual 1:1 Mental Math sessions for ages 5-14 using certified UCMath methodology, clear parent communication, and flexible online scheduling.",
    keywords: [
      "iMath",
      "mental math",
      "UCMath",
      "online mental math classes",
      "1:1 mental math tutoring",
      "certified UCMath tutors",
      "bilingual tutoring",
      "mental math for kids",
    ],
  },
};

export const SITE_NAME = "iMath";
export const SITE_PHONE_NUMBER = "+201018860269";
export const SITE_EMAIL = "hello@imath.com";
export const DEFAULT_OG_IMAGE = "/logo.png";

function normalizeBaseUrl(value?: string | null) {
  if (!value) {
    return "http://localhost:3000";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export const SITE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL
);

export function getSiteUrl() {
  return new URL(SITE_URL);
}

export function getLocalePath(locale: Locale, pathname = "/") {
  const normalizedPath = pathname === "/" ? "" : pathname;
  return locale === defaultLocale ? normalizedPath || "/" : `/${locale}${normalizedPath}`;
}

export function getLocaleAlternates(pathname = "/") {
  return Object.fromEntries(
    locales.map((locale) => [locale, getLocalePath(locale, pathname)])
  ) as Record<Locale, string>;
}

export function getSiteCopy(locale: Locale) {
  return SITE_COPY[locale];
}

export function getWhatsAppMessage(locale: Locale) {
  return locale === "ar"
    ? "مرحبًا iMath، أرغب في معرفة المزيد عن الحصة التجريبية وبرنامج الحساب الذهني المناسب لطفلي."
    : "Hello iMath, I would like to learn more about the free trial and the right mental math program for my child.";
}

export function getWhatsAppUrl(locale: Locale) {
  const message = encodeURIComponent(getWhatsAppMessage(locale));
  const phone = SITE_PHONE_NUMBER.replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${message}`;
}
