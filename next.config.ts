import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Self-contained server bundle for the VPS (see docs/self-hosting-plan.md); same runtime behavior as `next start`.
  output: "standalone",
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Font files never change in place; rename the file if a font is updated.
        source: "/font/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Image files only: a bare "/assessment/:path*" would also match the /assessment pages.
        source: "/:dir(images|assessment|og)/:file([^/]+\\.(?:png|jpe?g|webp|svg))",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
