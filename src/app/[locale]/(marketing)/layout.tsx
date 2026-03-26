import { cookies } from "next/headers";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import WhatsAppFloat from "@/components/marketing/WhatsAppFloat";
import { GeoPricingProvider } from "@/components/pricing/GeoPricingProvider";
import {
  DETECTED_COUNTRY_COOKIE,
  getInitialCountrySelection,
  OVERRIDE_COUNTRY_COOKIE,
} from "@/lib/pricing";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const geoState = getInitialCountrySelection({
    detectedCountry: cookieStore.get(DETECTED_COUNTRY_COOKIE)?.value,
    overrideCountry: cookieStore.get(OVERRIDE_COUNTRY_COOKIE)?.value,
  });

  return (
    <GeoPricingProvider
      initialDetectedCountry={geoState.detectedCountry}
      initialSelectedCountry={geoState.selectedCountry}
      initialSelectionMode={geoState.selectionMode}
    >
      <BookingModalProvider>
        <div className="min-h-screen flex flex-col relative">
          <Header />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
        </div>
      </BookingModalProvider>
    </GeoPricingProvider>
  );
}
