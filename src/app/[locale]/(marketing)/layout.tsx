import { BookingFlowProvider } from "@/components/booking/BookingFlowProvider";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import WhatsAppFloat from "@/components/marketing/WhatsAppFloat";
import MobileStickyCTA from "@/components/marketing/MobileStickyCTA";
import { HideOnLevelTest } from "@/components/marketing/HideOnLevelTest";
import { GeoPricingProvider } from "@/components/pricing/GeoPricingProvider";
import type { Locale } from "@/navigation";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <GeoPricingProvider>
      <BookingFlowProvider>
        <div className="min-h-screen flex flex-col relative">
          <Header />
          <main className="flex-grow pt-20 animate-fade-in">
            {children}
          </main>
          <Footer locale={locale as Locale} />
          <HideOnLevelTest>
            <WhatsAppFloat />
            <MobileStickyCTA />
          </HideOnLevelTest>
        </div>
      </BookingFlowProvider>
    </GeoPricingProvider>
  );
}
