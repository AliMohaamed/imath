"use client";

import { Check, Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

/**
 * A big on-screen number pad. It always lays out left to right (like a phone), in either
 * language, and every key is at least 56px tall so small fingers can hit it.
 */
export function NumberPad({
  onDigit,
  onDelete,
  onSubmit,
  canSubmit,
  deleteLabel,
  submitLabel,
}: {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  deleteLabel: string;
  submitLabel: string;
}) {
  const keyClass =
    "flex h-16 items-center justify-center rounded-2xl text-2xl font-black transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-violet/30";

  return (
    <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-3" dir="ltr">
      {DIGITS.map((digit) => (
        <button
          key={digit}
          type="button"
          className={cn(keyClass, "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-brand-violet/5")}
          onClick={() => onDigit(digit)}
        >
          {digit}
        </button>
      ))}
      <button
        type="button"
        aria-label={deleteLabel}
        className={cn(keyClass, "bg-slate-100 text-slate-600 hover:bg-slate-200")}
        onClick={onDelete}
      >
        <Delete className="h-6 w-6" />
      </button>
      <button
        type="button"
        className={cn(keyClass, "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-brand-violet/5")}
        onClick={() => onDigit("0")}
      >
        0
      </button>
      <button
        type="button"
        aria-label={submitLabel}
        disabled={!canSubmit}
        className={cn(keyClass, "bg-brand-orange text-white hover:bg-brand-orange/90 disabled:opacity-40")}
        onClick={onSubmit}
      >
        <Check className="h-7 w-7" />
      </button>
    </div>
  );
}
