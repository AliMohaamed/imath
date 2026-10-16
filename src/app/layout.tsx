import type { ReactNode } from "react";
import "@/app/globals.css";

// <html>/<body> live in app/[locale]/layout.tsx so they can carry the page's lang and dir.
// app/not-found.tsx renders its own document for requests outside any locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
