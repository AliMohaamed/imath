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
      "iMath تقدم جلسات حساب ذهني فردية 1:1 للأطفال من عمر 4 إلى 18 سنة بمنهج UCMath المعتمد وباللغتين العربية والإنجليزية.",
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
    title: "iMath | 1:1 Mental Math and UCMath for Ages 4-18",
    description:
      "iMath delivers bilingual 1:1 Mental Math sessions for ages 4-18 using certified UCMath methodology, clear parent communication, and flexible online scheduling.",
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
export const SITE_PHONE_NUMBER = "201144146194";
export const SITE_EMAIL = "imath.edu.eg@gmail.com";
export const SITE_INSTAGRAM_URL = "https://instagram.com/iMathMental";
export const SITE_FACEBOOK_URL = "https://www.facebook.com/iMathMental";
export const DEFAULT_OG_IMAGE = "/logo.png";

export function normalizeBaseUrl(value?: string | null) {
  if (!value) {
    return "http://localhost:3000";
  }

  const url = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
  return url.replace(/\/+$/, "");
}

// Canonicals, hreflang and the sitemap are built from this, so a production build
// must never fall back to a preview hostname. VERCEL_ENV is server-only, so this
// check never fires in the client bundle.
if (process.env.VERCEL_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be set for production builds (e.g. https://www.imathmental.com).");
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

/** hreflang set for a path: every locale plus x-default (the unprefixed default-locale URL). */
export function getLocaleAlternates(pathname = "/") {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, getLocalePath(locale, pathname)])),
    "x-default": getLocalePath(defaultLocale, pathname),
  } as Record<Locale | "x-default", string>;
}

export function getAbsoluteUrl(pathname: string) {
  return pathname === "/" ? SITE_URL : `${SITE_URL}${pathname}`;
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

