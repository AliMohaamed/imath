import { AdminShellClient } from "@/components/admin/AdminShellClient";

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
