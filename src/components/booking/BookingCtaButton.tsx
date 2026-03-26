"use client";

import { ButtonHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { useBookingModal } from "@/components/booking/BookingModalProvider";

type BookingCtaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  source: string;
};

export function BookingCtaButton({
  source,
  className,
  type,
  ...props
}: BookingCtaButtonProps) {
  const t = useTranslations("Common");
  const { openModal } = useBookingModal();

  return (
    <button
      {...props}
      type={type ?? "button"}
      className={className}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          openModal(source);
        }
      }}
    >
      {props.children ?? t("bookFreeTrial")}
    </button>
  );
}
