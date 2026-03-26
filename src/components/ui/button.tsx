"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
};

const variantClassName: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-brand-violet text-white hover:bg-brand-violet/90",
  outline: "border border-slate-200 bg-white text-slate-700 hover:border-brand-violet/30 hover:bg-brand-violet/5",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
};

const sizeClassName: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-11 px-4 py-2 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/20 disabled:pointer-events-none disabled:opacity-50",
          variantClassName[variant],
          sizeClassName[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
