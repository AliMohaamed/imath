import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect
} from "@convex-dev/auth/nextjs/server";
import {
  DETECTED_COUNTRY_COOKIE,
  LEGACY_COUNTRY_COOKIES,
  normalizeCountryCode,
} from '@/lib/pricing';
import { routing } from './navigation';

const intlProxy = createMiddleware(routing);

const isProtectedPage = createRouteMatcher([
  "/admin(.*)",
  "/(ar|en)/admin(.*)",
]);

const isLoginPage = createRouteMatcher([
  "/admin/login",
  "/(ar|en)/admin/login",
]);

function applyGeoCookies(request: NextRequest, response: NextResponse) {
  const detectedCountry = normalizeCountryCode(request.headers.get("x-vercel-ip-country"));

  if (detectedCountry) {
    response.cookies.set(DETECTED_COUNTRY_COOKIE, detectedCountry, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  for (const name of LEGACY_COUNTRY_COOKIES) {
    if (request.cookies.has(name)) {
      response.cookies.delete(name);
    }
  }

  return response;
}

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'ar';
  const prefix = locale === 'en' ? '/en' : '/ar';
  // Only admin pages need the auth check; skipping it elsewhere keeps it off the public pages' TTFB.
  if (isProtectedPage(request) && !isLoginPage(request) && !(await convexAuth.isAuthenticated())) {
    return applyGeoCookies(request, nextjsMiddlewareRedirect(request, `${prefix}/admin/login`));
  }

  return applyGeoCookies(request, intlProxy(request));
});

export const config = {
  matcher: [
    '/api/auth/:path*',
    // Metadata files (robots.txt, sitemap.xml, manifest) must skip the locale rewrite or they 404.
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|images|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|webmanifest|xml|txt)$|font).*)'
  ]
};
