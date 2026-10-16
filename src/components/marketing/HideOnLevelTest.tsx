"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/navigation";

/**
 * The level test is played on a phone with an on-screen number pad. The floating WhatsApp and
 * booking buttons sit right where its keys are, so they step out of the way on that page.
 */
export function HideOnLevelTest({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return pathname.startsWith("/assessment/level") ? null : children;
}
