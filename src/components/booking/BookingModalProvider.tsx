"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
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
  const sourceRef = useRef("unknown");

  const openModal = (source: string) => {
    sourceRef.current = source;
    setIsOpen(true);
    trackEvent("booking_modal_open", { source });
  };

  const closeModal = (reason = "dismissed") => {
    setIsOpen(false);
    trackEvent("booking_modal_close", { source: sourceRef.current, reason });
  };

  useEffect(() => {
    if (!isOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isOpen]);

  return (
    <BookingModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <BookingModal
        isOpen={isOpen}
        source={sourceRef.current}
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
