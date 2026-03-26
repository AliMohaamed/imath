"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { BookingModal } from "@/components/booking/BookingModal";
import { trackEvent } from "@/lib/analytics";

type BookingModalContextValue = {
  openModal: (source: string) => void;
  closeModal: (reason?: string) => void;
};

const BookingModalContext = createContext<BookingModalContextValue | null>(null);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState("unknown");

  const openModal = (source: string) => {
    setSource(source);
    setIsOpen(true);
    trackEvent("booking_modal_open", { source });
  };

  const closeModal = (reason = "dismissed") => {
    setIsOpen(false);
    trackEvent("booking_modal_close", { source, reason });
  };

  return (
    <BookingModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <BookingModal
        isOpen={isOpen}
        source={source}
        onClose={closeModal}
      />
    </BookingModalContext.Provider>
  );
}

export function useBookingModal() {
  const context = useContext(BookingModalContext);

  if (!context) {
    throw new Error("useBookingModal must be used within BookingModalProvider.");
  }

  return context;
}
