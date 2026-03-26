import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from "@/navigation";
import { notFound } from "next/navigation";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { DEFAULT_OG_IMAGE, getLocaleAlternates, getSiteCopy, getSiteUrl, SITE_NAME } from "@/lib/site";
import "@/app/globals.css";

const somarRounded = localFont({
  src: [
    {
      path: "../../../public/font/SomarRounded-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../public/font/SomarRounded-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/font/SomarRounded-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/font/SomarRounded-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/font/SomarRounded-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../public/font/SomarRounded-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-somar",
  display: 'swap',
});

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
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
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

  // Get current messages
  const messages = await getMessages();

  // Set the text direction based on the locale
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className="light" style={{ colorScheme: 'light' }}>
      <body className={`${somarRounded.variable} font-sans antialiased bg-white text-slate-900`}>
        <a
          href="#main-content"
          className="sr-only absolute left-4 top-4 z-[200] rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow focus:not-sr-only"
        >
          {locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}
        </a>
        <ConvexClientProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
