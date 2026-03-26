"use client";

import { ButtonHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { useBookingFlow } from "@/components/booking/BookingFlowProvider";

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
  const { startBooking } = useBookingFlow();

  return (
    <button
      {...props}
      type={type ?? "button"}
      className={className}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          startBooking(source);
        }
      }}
    >
      {props.children ?? t("bookFreeTrial")}
    </button>
  );
}
