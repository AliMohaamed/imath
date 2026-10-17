"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { trackEvent } from "@/lib/analytics";

type BookingFlowContextValue = {
  startBooking: (source: string) => void;
  closeBooking: () => void;
  isOpen: boolean;
};

/** Links ending in one of these hashes open the booking dialog (e.g. `/#book` in a guide or an ad). */
const BOOKING_HASHES = ["#book", "#booking-stepper"];
const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

export function BookingFlowProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState("unknown");
  // Bumped on every open so the form can apply that open's prefill and source.
  const [openId, setOpenId] = useState(0);

  const startBooking = useCallback((nextSource: string) => {
    setSource(nextSource);
    setOpenId((id) => id + 1);
    setIsOpen(true);
    trackEvent("booking_stepper_open", { source: nextSource });
  }, []);

  const closeBooking = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const openFromHash = () => {
      if (!BOOKING_HASHES.includes(window.location.hash)) {
        return;
      }

      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      startBooking("deep_link");
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [startBooking]);

  const value = useMemo<BookingFlowContextValue>(
    () => ({ startBooking, closeBooking, isOpen }),
    [startBooking, closeBooking, isOpen]
  );

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
      <BookingDialog isOpen={isOpen} source={source} openId={openId} onClose={closeBooking} />
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
