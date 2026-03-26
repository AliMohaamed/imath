import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from "@/navigation";
import { notFound } from "next/navigation";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
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

export const metadata: Metadata = {
  title: "iMath",
  description: "iMath Academy for Mathematics",
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
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Get current messages
  const messages = await getMessages();

  // Set the text direction based on the locale
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className="light" style={{ colorScheme: 'light' }}>
      <body className={`${somarRounded.variable} font-sans antialiased bg-white text-slate-900`}>
        <ConvexClientProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
