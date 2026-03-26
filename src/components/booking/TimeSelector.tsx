"use client";

import type { BookingTimeSlot } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TimeSelectorProps = {
  options: BookingTimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  emptyLabel: string;
  disabledLabel: string;
  isDisabled: boolean;
};

export function TimeSelector({
  options,
  selectedTime,
  onSelect,
  emptyLabel,
  disabledLabel,
  isDisabled,
}: TimeSelectorProps) {
  if (isDisabled) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        {disabledLabel}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const isSelected = option.value === selectedTime;

        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-12 rounded-2xl text-sm font-black shadow-sm",
              isSelected ? "bg-brand-orange text-white hover:bg-brand-orange/90" : "text-slate-700"
            )}
            onClick={() => onSelect(option.value)}
            aria-pressed={isSelected}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
