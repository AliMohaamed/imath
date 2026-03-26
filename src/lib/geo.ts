import { getPricingForCountry } from "@/lib/pricing";

export function getGeoContext(countryCode?: string | null) {
  const pricing = getPricingForCountry(countryCode);

  return {
    country: pricing.countryCode,
    currency: pricing.currency,
  };
}
