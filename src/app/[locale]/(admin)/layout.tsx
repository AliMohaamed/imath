import type { Metadata } from "next";
import { AdminShellClient } from "@/components/admin/AdminShellClient";

export const metadata: Metadata = {
  title: { absolute: "iMath Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <AdminShellClient locale={locale}>
      {children}
    </AdminShellClient>
  );
}
