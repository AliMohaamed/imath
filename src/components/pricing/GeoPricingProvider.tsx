"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { trackEvent } from "@/lib/analytics";
import {
  DEFAULT_COUNTRY_CODE,
  DETECTED_COUNTRY_COOKIE,
  EFFECTIVE_COUNTRY_COOKIE,
  getInitialCountrySelection,
  getPricingForCountry,
  OVERRIDE_COUNTRY_COOKIE,
  type SupportedCountryCode,
  SUPPORTED_COUNTRY_CODES,
} from "@/lib/pricing";

type GeoPricingContextValue = {
  detectedCountry: SupportedCountryCode;
  selectedCountry: SupportedCountryCode;
  selectionMode: "auto" | "override";
  currency: string;
  plans: ReturnType<typeof getPricingForCountry>["plans"];
  supportedCountries: SupportedCountryCode[];
  setCountrySelection: (country: SupportedCountryCode | "auto") => void;
};

const GeoPricingContext = createContext<GeoPricingContextValue>({
  detectedCountry: DEFAULT_COUNTRY_CODE,
  selectedCountry: DEFAULT_COUNTRY_CODE,
  selectionMode: "auto",
  currency: "EGP",
  plans: getPricingForCountry(DEFAULT_COUNTRY_CODE).plans,
  supportedCountries: SUPPORTED_COUNTRY_CODES,
  setCountrySelection: () => {},
});

function readCookie(cookies: string, name: string) {
  return cookies
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

// The cookies only change through setCountrySelection below, which also updates state,
// so there is nothing to subscribe to.
const subscribeToNothing = () => () => {};
const getCookieSnapshot = () => document.cookie;
const getServerCookieSnapshot = () => "";

/**
 * Prices render for the default country on the server and switch to the visitor's country
 * during hydration, using the cookies the proxy sets from x-vercel-ip-country. Reading them
 * on the server would make every marketing page dynamic; the pricing section is far below the fold.
 */
export function GeoPricingProvider({ children }: { children: ReactNode }) {
  const cookies = useSyncExternalStore(subscribeToNothing, getCookieSnapshot, getServerCookieSnapshot);
  // null until the visitor picks a country in this session.
  const [choice, setChoice] = useState<SupportedCountryCode | "auto" | null>(null);

  const value = useMemo(() => {
    const initial = getInitialCountrySelection({
      detectedCountry: readCookie(cookies, DETECTED_COUNTRY_COOKIE),
      overrideCountry: readCookie(cookies, OVERRIDE_COUNTRY_COOKIE),
    });
    const detectedCountry = initial.detectedCountry;
    const selectionMode = choice === null ? initial.selectionMode : choice === "auto" ? "auto" : "override";
    const selectedCountry =
      choice === null ? initial.selectedCountry : choice === "auto" ? detectedCountry : choice;
    const pricing = getPricingForCountry(selectedCountry);

    return {
      detectedCountry,
      selectedCountry,
      selectionMode,
      currency: pricing.currency,
      plans: pricing.plans,
      supportedCountries: SUPPORTED_COUNTRY_CODES,
      setCountrySelection: (country: SupportedCountryCode | "auto") => {
        setChoice(country);

        if (country === "auto") {
          document.cookie = `${OVERRIDE_COUNTRY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
          document.cookie = `${EFFECTIVE_COUNTRY_COOKIE}=${detectedCountry}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
          trackEvent("pricing_country_override", {
            mode: "auto",
            country: detectedCountry,
          });
          return;
        }

        document.cookie = `${OVERRIDE_COUNTRY_COOKIE}=${country}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        document.cookie = `${EFFECTIVE_COUNTRY_COOKIE}=${country}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        trackEvent("pricing_country_override", {
          mode: "override",
          country,
        });
      },
    } satisfies GeoPricingContextValue;
  }, [cookies, choice]);

  return (
    <GeoPricingContext.Provider value={value}>
      {children}
    </GeoPricingContext.Provider>
  );
}

export function useGeoPricing() {
  return useContext(GeoPricingContext);
}
