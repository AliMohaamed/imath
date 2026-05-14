import type { Metadata, Viewport } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { NextIntlClientProvider } from 'next-intl';
import { defaultLocale, locales, type Locale } from "@/navigation";
import { notFound } from "next/navigation";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { DEFAULT_OG_IMAGE, getLocaleAlternates, getSiteCopy, getSiteUrl, SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;
  const copy = getSiteCopy(currentLocale);
  const path = currentLocale === defaultLocale ? "/" : `/${currentLocale}`;

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: copy.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: copy.description,
    keywords: copy.keywords,
    applicationName: SITE_NAME,
    alternates: {
      canonical: path,
      languages: getLocaleAlternates("/"),
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: currentLocale === "ar" ? "ar_EG" : "en_US",
      title: copy.title,
      description: copy.description,
      url: path,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 512,
          height: 512,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [DEFAULT_OG_IMAGE],
    },
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Load messages directly for the current locale to ensure reliability
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  // Set the text direction based on the locale
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      lang={locale}
      dir={direction}
      className={`font-sans light min-h-screen`}
      style={{ colorScheme: 'light' }}
    >
        <a
          href="#main-content"
          className="sr-only absolute left-4 top-4 z-[200] rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow focus:not-sr-only"
        >
          {messages.Common.skipToContent}
        </a>
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
    </div>
  );
}
