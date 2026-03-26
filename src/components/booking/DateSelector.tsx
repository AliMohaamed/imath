"use client";

import type { BookableDateOption } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DateSelectorProps = {
  options: BookableDateOption[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
  todayLabel: string;
};

export function DateSelector({
  options,
  selectedDate,
  onSelect,
  todayLabel,
}: DateSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((option) => {
        const isSelected = option.value === selectedDate;

        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-auto min-h-24 flex-col items-start gap-1 rounded-3xl px-4 py-4 text-left shadow-sm",
              isSelected ? "bg-brand-violet text-white" : "text-slate-700"
            )}
            onClick={() => onSelect(option.value)}
            aria-pressed={isSelected}
          >
            <span className={cn("text-xs uppercase tracking-[0.18em]", isSelected ? "text-white/80" : "text-slate-400")}>
              {option.isToday ? todayLabel : option.longLabel}
            </span>
            <span className="text-sm font-black leading-tight">{option.shortLabel}</span>
          </Button>
        );
      })}
    </div>
  );
}
