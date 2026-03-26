import { defaultLocale, locales, type Locale } from "@/navigation";

type SiteCopy = {
  title: string;
  description: string;
  keywords: string[];
};

const SITE_COPY: Record<Locale, SiteCopy> = {
  ar: {
    title: "iMath | دروس رياضيات فردية باللغتين العربية والإنجليزية",
    description:
      "iMath تقدم دروس رياضيات فردية 1:1 للأطفال واليافعين من عمر 5 إلى 18 سنة مع مدرسين معتمدين وخطة تعلم واضحة ومرنة.",
    keywords: [
      "iMath",
      "دروس رياضيات",
      "رياضيات أونلاين",
      "حصص فردية",
      "مدرس رياضيات",
      "تعليم الرياضيات للأطفال",
      "دروس بالعربية والإنجليزية",
    ],
  },
  en: {
    title: "iMath | Personalized 1:1 Math Tutoring for Ages 5-18",
    description:
      "iMath delivers personalized bilingual math tutoring with certified tutors, clear parent communication, and flexible 1:1 sessions for ages 5-18.",
    keywords: [
      "iMath",
      "math tutoring",
      "online math classes",
      "1:1 tutoring",
      "certified math tutors",
      "bilingual tutoring",
      "math support for kids",
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
    ? "مرحبًا iMath، أرغب في معرفة المزيد عن الحصة التجريبية وخطة التعلم المناسبة لطفلي."
    : "Hello iMath, I would like to learn more about the free trial and the right study plan for my child.";
}

export function getWhatsAppUrl(locale: Locale) {
  const message = encodeURIComponent(getWhatsAppMessage(locale));
  const phone = SITE_PHONE_NUMBER.replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${message}`;
}
