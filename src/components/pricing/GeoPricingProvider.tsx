"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DETECTED_COUNTRY_COOKIE,
  getPricingForCountry,
  normalizeCountryCode,
  type PricingRegion,
} from "@/lib/pricing";

type GeoPricingContextValue = {
  /** The visitor's real country, or undefined when it couldn't be detected. */
  detectedCountry: string | undefined;
  /** The price list shown: the visitor's country when it has its own prices, otherwise INTL (USD). */
  pricingRegion: PricingRegion;
  currency: string;
  plans: ReturnType<typeof getPricingForCountry>["plans"];
};

const defaultPricing = getPricingForCountry(undefined);
const GeoPricingContext = createContext<GeoPricingContextValue>({
  detectedCountry: undefined,
  pricingRegion: defaultPricing.region,
  currency: defaultPricing.currency,
  plans: defaultPricing.plans,
});

function readCookie(cookies: string, name: string) {
  return cookies
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

// The proxy sets the cookie before the page loads and nothing changes it afterwards,
// so there is nothing to subscribe to.
const subscribeToNothing = () => () => {};
const getCookieSnapshot = () => document.cookie;
const getServerCookieSnapshot = () => "";

/**
 * Prices render for the default region on the server and switch to the visitor's country
 * during hydration, using the cookie the proxy sets from x-vercel-ip-country. Reading it
 * on the server would make every marketing page dynamic; the pricing section is far below the fold.
 * Visitors can't choose another country's prices.
 */
export function GeoPricingProvider({ children }: { children: ReactNode }) {
  const cookies = useSyncExternalStore(subscribeToNothing, getCookieSnapshot, getServerCookieSnapshot);

  const value = useMemo(() => {
    const detectedCountry = normalizeCountryCode(readCookie(cookies, DETECTED_COUNTRY_COOKIE));
    const pricing = getPricingForCountry(detectedCountry);

    return {
      detectedCountry,
      pricingRegion: pricing.region,
      currency: pricing.currency,
      plans: pricing.plans,
    } satisfies GeoPricingContextValue;
  }, [cookies]);

  return (
    <GeoPricingContext.Provider value={value}>
      {children}
    </GeoPricingContext.Provider>
  );
}

export function useGeoPricing() {
  return useContext(GeoPricingContext);
}
