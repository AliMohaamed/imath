import { DETECTED_COUNTRY_COOKIE, getPricingForCountry, normalizeCountryCode } from "@/lib/pricing";

/**
 * The visitor's real country and the currency they were shown. Vercel's header wins over the
 * cookie because the request body and cookies can be edited by the visitor.
 */
export function getGeoContext(request: Request, cookieStore: { get(name: string): { value: string } | undefined }) {
  const country =
    normalizeCountryCode(request.headers.get("x-vercel-ip-country")) ??
    normalizeCountryCode(cookieStore.get(DETECTED_COUNTRY_COOKIE)?.value);
  const pricing = getPricingForCountry(country);

  return {
    country,
    pricingRegion: pricing.region,
    currency: pricing.currency,
  };
}
