"use client";

import { useTranslations } from "next-intl";
import { BookingCtaButton } from "@/components/booking/BookingCtaButton";
import { Link, usePathname, useRouter } from "@/navigation";
import { Globe, Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { getWhatsAppUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export default function Header() {
  const t = useTranslations('Common');
  const params = useParams();
  const locale = params.locale as string;
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const whatsAppUrl = getWhatsAppUrl(locale as "ar" | "en");

  const toggleLocale = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    router.replace(pathname, { locale: nextLocale });
  };
  const menuAriaLabel = isMenuOpen
    ? t("navigationMenu.close")
    : t("navigationMenu.open");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 shadow-md backdrop-blur-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="iMath Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
            style={{ width: "auto" }}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-bold text-sm">
          <Link href="#why-imath" className="text-muted-foreground hover:text-brand-violet transition-colors">{t("sections.whyImath")}</Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-brand-violet transition-colors">{t("sections.howItWorks")}</Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-brand-violet transition-colors">{t("sections.pricing")}</Link>
          <Link href="#faq" className="text-muted-foreground hover:text-brand-violet transition-colors">{t("sections.faq")}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-muted active:scale-95 sm:px-3 sm:py-2"
            title={locale === "ar" ? t("switchToEnglish") : t("switchToArabic")}
            aria-label={locale === "ar" ? t("switchToEnglish") : t("switchToArabic")}
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{locale === "ar" ? "EN" : "AR"}</span>
          </button>

          <BookingCtaButton source="header_desktop" className="hidden sm:block px-6 py-2.5 bg-brand-orange text-white rounded-full font-black text-sm hover:opacity-90 transition-all shadow-premium hover:scale-105">
            {t("bookFreeTrial")}
          </BookingCtaButton>

          <button
            className="md:hidden p-2 rounded-full hover:bg-muted"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={menuAriaLabel}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <button
            className="fixed inset-0 top-20 z-40 bg-slate-900/30 md:hidden"
            aria-label={menuAriaLabel}
            onClick={() => setIsMenuOpen(false)}
          />
          <div id="mobile-nav" className="relative z-50 border-b border-slate-200 bg-white p-4 font-bold animate-in slide-in-from-top-3 duration-200 md:hidden">
            <div className="flex flex-col items-stretch gap-3 text-center">
              <Link href="#why-imath" onClick={() => setIsMenuOpen(false)} className="rounded-2xl px-4 py-3 hover:bg-slate-50">{t("sections.whyImath")}</Link>
              <Link href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="rounded-2xl px-4 py-3 hover:bg-slate-50">{t("sections.howItWorks")}</Link>
              <Link href="#pricing" onClick={() => setIsMenuOpen(false)} className="rounded-2xl px-4 py-3 hover:bg-slate-50">{t("sections.pricing")}</Link>
              <Link href="#faq" onClick={() => setIsMenuOpen(false)} className="rounded-2xl px-4 py-3 hover:bg-slate-50">{t("sections.faq")}</Link>
              <a href={whatsAppUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-black text-slate-900 active:scale-95 transition-transform">
                <WhatsAppIcon size={18} />
                {t("contactViaWhatsApp")}
              </a>
              <BookingCtaButton source="header_mobile" className="w-full py-3 bg-brand-orange text-white rounded-full font-black">
                {t("bookFreeTrial")}
              </BookingCtaButton>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
