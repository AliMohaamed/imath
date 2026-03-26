"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { trackEvent } from "@/lib/analytics";

type BookingFlowContextValue = {
  startBooking: (source: string) => void;
  lastSource: string;
};

const BOOKING_STEPPER_ID = "booking-stepper";
const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

export function BookingFlowProvider({ children }: { children: ReactNode }) {
  const [lastSource, setLastSource] = useState("unknown");

  const value = useMemo<BookingFlowContextValue>(
    () => ({
      startBooking: (source: string) => {
        setLastSource(source);
        trackEvent("booking_stepper_open", { source });

        if (typeof document !== "undefined") {
          const element = document.getElementById(BOOKING_STEPPER_ID);
          element?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      lastSource,
    }),
    [lastSource]
  );

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext);

  if (!context) {
    throw new Error("useBookingFlow must be used within BookingFlowProvider.");
  }

  return context;
}

export { BOOKING_STEPPER_ID };
