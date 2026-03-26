import createMiddleware from 'next-intl/middleware';
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect
} from "@convex-dev/auth/nextjs/server";
import { routing } from './navigation';

const intlProxy = createMiddleware(routing);
const isProtectedPage = createRouteMatcher(["/(ar|en)/admin(.*)", "/admin(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isProtectedPage(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  return intlProxy(request);
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|fonts).*)'
  ]
};
