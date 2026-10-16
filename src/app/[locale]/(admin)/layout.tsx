import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { AdminShellClient } from "@/components/admin/AdminShellClient";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

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

  // Convex auth reads request cookies, so it is scoped to the admin area to keep the
  // marketing pages statically renderable.
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <AdminShellClient locale={locale}>
          {children}
        </AdminShellClient>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
