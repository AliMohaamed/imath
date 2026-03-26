import { AdminAuthForm } from "@/components/admin/AdminAuthForm";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminAuthForm locale={locale} />;
}
