/**
 * Public mutations that only our Next.js API routes should call take this secret, so a visitor who
 * reads NEXT_PUBLIC_CONVEX_URL can't skip the route's validation and rate limiting.
 * Set CONVEX_SERVER_SECRET to the same value in the Convex deployment and in the Next.js env.
 */
export function requireServerSecret(secret: string) {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected || !timingSafeEqual(secret, expected)) {
    throw new Error("Forbidden");
  }
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}
