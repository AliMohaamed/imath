import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import WhatsAppFloat from "@/components/marketing/WhatsAppFloat";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
