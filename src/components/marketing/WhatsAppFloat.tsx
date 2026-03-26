"use client";

import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function WhatsAppFloat() {
  const t = useTranslations('Marketing.whatsApp');
  const whatsappNumber = "+201018860269";
  const defaultMessage = t('defaultMessage');

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    trackEvent("whatsapp_click", { placement: "floating_button" });
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center justify-center gap-2 group"
      aria-label={t('ariaLabel')}
    >
      <span className="hidden md:block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold text-sm px-0 group-hover:px-2">
        {t('label')}
      </span>
      <MessageCircle className="w-6 h-6 fill-white" />
    </button>
  );
}
