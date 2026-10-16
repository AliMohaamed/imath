import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from "next-intl/server";
import { locales, type Locale } from "@/navigation";
import { notFound } from "next/navigation";
import { getSiteCopy, getSiteUrl, SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const copy = getSiteCopy(locale as Locale);

  // Canonical, hreflang and Open Graph URLs are deliberately not set here: each page
  // sets its own via buildPageMetadata() so nothing inherits the homepage canonical.
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: copy.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: copy.description,
    applicationName: SITE_NAME,
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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

  // Lets next-intl resolve the locale without reading request headers, so pages can be static.
  setRequestLocale(locale);

  // Load messages directly for the current locale to ensure reliability
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  // Set the text direction based on the locale
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  // Body text (400) and headings (font-black → 800) are above the fold on every page.
  preload("/font/SomarRounded-Regular.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload("/font/SomarRounded-ExtraBold.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
    <body className="antialiased bg-white text-slate-900 font-sans">
    <div
      className={`font-sans light min-h-screen`}
      style={{ colorScheme: 'light' }}
    >
        <a
          href="#main-content"
          className="sr-only absolute left-4 top-4 z-[200] rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow focus:not-sr-only"
        >
          {messages.Common.skipToContent}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
    </div>
    </body>
    </html>
  );
}
