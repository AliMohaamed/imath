"use client";

import { ButtonHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { useBookingFlow } from "@/components/booking/BookingFlowProvider";
import { cn } from "@/lib/utils";

const variantClassName = {
  primary: "bg-brand-orange text-white shadow-premium hover:opacity-90",
  violet: "bg-brand-violet text-white shadow-md shadow-brand-violet/25 hover:opacity-90",
  muted: "bg-slate-100 text-slate-900 hover:bg-slate-200",
} as const;

const sizeClassName = {
  sm: "px-6 py-2.5 text-sm",
  md: "px-8 py-4 text-sm",
  lg: "px-10 py-4 text-lg",
} as const;

type BookingCtaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Analytics label for where the visitor clicked; `pricing_<CC>_<n>_months` also preselects that package. */
  source: string;
  variant?: keyof typeof variantClassName;
  size?: keyof typeof sizeClassName;
};

/**
 * The one "Book a free trial" button. Every booking CTA on the site uses it so they all open
 * the same booking dialog and look the same; pass `className` only for layout tweaks.
 */
export function BookingCtaButton({
  source,
  variant = "primary",
  size = "md",
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
      aria-haspopup="dialog"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-black transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange",
        variantClassName[variant],
        sizeClassName[size],
        className
      )}
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
