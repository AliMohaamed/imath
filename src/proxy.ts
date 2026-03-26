import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect
} from "@convex-dev/auth/nextjs/server";
import {
  DETECTED_COUNTRY_COOKIE,
  EFFECTIVE_COUNTRY_COOKIE,
  getDetectedCountryFromHeader,
  OVERRIDE_COUNTRY_COOKIE,
  resolveSupportedCountryCode,
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

function applyGeoCookies(request: Request, response: NextResponse) {
  const overrideCountry = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OVERRIDE_COUNTRY_COOKIE}=`))
    ?.split("=")[1];
  const detectedCountry = getDetectedCountryFromHeader(request.headers.get("x-vercel-ip-country"));
  const effectiveCountry = overrideCountry
    ? resolveSupportedCountryCode(overrideCountry)
    : detectedCountry;

  response.cookies.set(DETECTED_COUNTRY_COOKIE, detectedCountry, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  response.cookies.set(EFFECTIVE_COUNTRY_COOKIE, effectiveCountry, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return response;
}

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isProtectedPage(request) && !isLoginPage(request) && !(await convexAuth.isAuthenticated())) {
    return applyGeoCookies(request, nextjsMiddlewareRedirect(request, "/"));
  }

  return applyGeoCookies(request, intlProxy(request));
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|images|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$|font).*)'
  ]
};
