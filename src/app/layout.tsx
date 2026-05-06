import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="antialiased bg-white text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
