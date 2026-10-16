"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "@/navigation";
import { trackEvent } from "@/lib/analytics";

type BookingFlowContextValue = {
  startBooking: (source: string) => void;
  lastSource: string;
};

const BOOKING_STEPPER_ID = "booking-stepper";
const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

export function BookingFlowProvider({ children }: { children: ReactNode }) {
  const [lastSource, setLastSource] = useState("unknown");
  const router = useRouter();

  const value = useMemo<BookingFlowContextValue>(
    () => ({
      startBooking: (source: string) => {
        setLastSource(source);
        trackEvent("booking_stepper_open", { source });

        if (typeof document !== "undefined") {
          const element = document.getElementById(BOOKING_STEPPER_ID);

          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            // The stepper only exists on the home page; other pages send the visitor there.
            router.push(`/#${BOOKING_STEPPER_ID}`);
          }
        }
      },
      lastSource,
    }),
    [lastSource, router]
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
