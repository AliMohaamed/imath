import type { Locale } from "@/navigation";
import {
  getAbsoluteUrl,
  getLocalePath,
  SITE_EMAIL,
  SITE_FACEBOOK_URL,
  SITE_INSTAGRAM_URL,
  SITE_NAME,
  SITE_PHONE_NUMBER,
  SITE_URL,
} from "@/lib/site";

// schema.org JSON-LD for the site. Entities reference each other by @id so search engines
// and AI systems see one consistent iMath organization across every page.

type JsonLd = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PROGRAM_ID = `${SITE_URL}/#ucmath-program`;

const AREA_SERVED = [
  { "@type": "Country", name: "Egypt" },
  { "@type": "Country", name: "Saudi Arabia" },
  { "@type": "Country", name: "Kuwait" },
  { "@type": "Country", name: "United Arab Emirates" },
  { "@type": "Country", name: "Qatar" },
];

const TELEPHONE = `+${SITE_PHONE_NUMBER}`;

export function organizationSchema(locale: Locale): JsonLd {
  return {
    "@type": "EducationalOrganization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: ["iMath Academy", "أكاديمية iMath", "آي ماث"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: getAbsoluteUrl("/logo.png"),
      width: 512,
      height: 512,
    },
    description:
      locale === "ar"
        ? "أكاديمية iMath تقدم دروس حساب ذهني فردية 1:1 أونلاين للأطفال من 4 إلى 18 سنة بمنهج UCMath، بالعربية والإنجليزية."
        : "iMath is an online academy offering 1:1 mental math classes for children aged 4–18 using the UCMath methodology, in Arabic and English.",
    email: SITE_EMAIL,
    telephone: TELEPHONE,
    sameAs: [SITE_INSTAGRAM_URL, SITE_FACEBOOK_URL],
    areaServed: AREA_SERVED,
    knowsAbout: ["Mental math", "Mental arithmetic", "UCMath", "الحساب الذهني"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: TELEPHONE,
      email: SITE_EMAIL,
      availableLanguage: ["Arabic", "English"],
      areaServed: AREA_SERVED,
    },
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: ["ar", "en"],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * The UCMath program as a Course. Google stopped showing Course info rich results in 2025, so this
 * is for entity understanding (what iMath teaches, to whom, how), not for a SERP feature.
 */
export function programSchema(locale: Locale): JsonLd {
  return {
    "@type": "Course",
    "@id": PROGRAM_ID,
    name: locale === "ar" ? "برنامج UCMath للحساب الذهني" : "UCMath Mental Math Program",
    description:
      locale === "ar"
        ? "برنامج UCMath لتعليم الحساب الذهني للأطفال من 4 إلى 18 سنة في حصص فردية 1:1 أونلاين، لتطوير السرعة والدقة والتركيز."
        : "The UCMath mental math program for children aged 4–18, taught in 1:1 online sessions to build calculation speed, accuracy and focus.",
    provider: { "@id": ORGANIZATION_ID },
    inLanguage: ["ar", "en"],
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Children aged 4–18" },
    teaches: locale === "ar" ? "الحساب الذهني" : "Mental math",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      inLanguage: ["ar", "en"],
    },
  };
}

type WebPageInput = {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  breadcrumb?: boolean;
};

export function webPageSchema({ locale, path, name, description, breadcrumb }: WebPageInput): JsonLd {
  const url = getAbsoluteUrl(getLocalePath(locale, path));
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    ...(breadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
  };
}

/** Breadcrumb trail for a page; `trail` excludes Home, which is added first. */
export function breadcrumbSchema(
  locale: Locale,
  path: string,
  homeLabel: string,
  trail: Array<{ path: string; name: string }>
): JsonLd {
  const url = getAbsoluteUrl(getLocalePath(locale, path));
  const items = [{ path: "/", name: homeLabel }, ...trail];
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(getLocalePath(locale, item.path)),
    })),
  };
}

type ArticleInput = {
  locale: Locale;
  path: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
};

/** A guide. Authored by the organization: the owner chose not to credit named authors. */
export function articleSchema({ locale, path, headline, description, image, datePublished, dateModified }: ArticleInput): JsonLd {
  const url = getAbsoluteUrl(getLocalePath(locale, path));
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline,
    description,
    inLanguage: locale,
    image: getAbsoluteUrl(image),
    datePublished,
    dateModified,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    about: { "@id": PROGRAM_ID },
  };
}

export function faqSchema(locale: Locale, items: Array<{ question: string; answer: string }>): JsonLd {
  return {
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function graph(...nodes: JsonLd[]): JsonLd {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Serialises JSON-LD for a <script> tag; escaping "<" keeps "</script>" in content from closing it. */
export function serializeJsonLd(data: JsonLd) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
