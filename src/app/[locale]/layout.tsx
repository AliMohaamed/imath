import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from "@/navigation";
import { notFound } from "next/navigation";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "@/app/globals.css";

const somarRounded = localFont({
  src: "../../../public/fonts/SomarRounded.ttf", // Adjust path based on placement
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
  params: { locale: string };
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
