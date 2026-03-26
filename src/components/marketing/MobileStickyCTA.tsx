"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import { getWhatsAppUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { BOOKING_STEPPER_ID } from "@/components/booking/BookingFlowProvider";

export default function MobileStickyCTA() {
  const t = useTranslations("Common");
  const locale = useLocale() as "ar" | "en";
  const whatsAppUrl = getWhatsAppUrl(locale);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [isBookingSectionVisible, setIsBookingSectionVisible] = useState(false);

  // Track scroll position to show after 400px
  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track when BookingStepperSection is in viewport
  useEffect(() => {
    const bookingSection = document.getElementById(BOOKING_STEPPER_ID);
    if (!bookingSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBookingSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(bookingSection);
    return () => observer.disconnect();
  }, []);

  const isVisible = scrolledPastHero && !isBookingSectionVisible;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[60] p-4 transition-transform duration-500 md:hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-3 rounded-[2rem] border border-white/20 bg-white/95 p-2 shadow-2xl backdrop-blur-xl">
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg active:scale-95 transition-transform"
          aria-label={t("contactViaWhatsApp")}
        >
          <WhatsAppIcon size={24} className="fill-white" />
        </a>
        
        <BookingCtaButton
          source="mobile_sticky_cta"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-orange px-4 text-sm font-black text-white shadow-lg active:scale-95 transition-all"
        >
          <Calendar className="h-4 w-4" />
          {t("bookFreeTrial")}
        </BookingCtaButton>
      </div>
    </div>
  );
}
