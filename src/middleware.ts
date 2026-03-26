import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, localePrefix } from './navigation';
import { 
  convexAuthNextjsMiddleware, 
  createRouteMatcher,
  nextjsMiddlewareRedirect 
} from "@convex-dev/auth/nextjs/server";

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,
  
  // Set the locale prefix strategy
  localePrefix
});

const isProtectedPage = createRouteMatcher(["/(ar|en)/admin(.*)", "/admin(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // 1. Protect Admin routes
  if (isProtectedPage(request) && !(await convexAuth.isAuthenticated())) {
    // Redirect to login if trying to access admin
    // Note: The login path depends on your implementation, assuming /ar/login
    // For now, let's redirect to home to avoid issues
    return nextjsMiddlewareRedirect(request, "/");
  }

  // 2. Handle i18n
  return intlMiddleware(request);
});

export const config = {
  // Match only internationalized pathnames and exclude assets
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|fonts).*)'
  ]
};
