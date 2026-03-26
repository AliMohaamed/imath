"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { trackEvent } from "@/lib/analytics";
import {
  DEFAULT_COUNTRY_CODE,
  EFFECTIVE_COUNTRY_COOKIE,
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

type GeoPricingProviderProps = {
  children: ReactNode;
  initialDetectedCountry: SupportedCountryCode;
  initialSelectedCountry: SupportedCountryCode;
  initialSelectionMode: "auto" | "override";
};

export function GeoPricingProvider({
  children,
  initialDetectedCountry,
  initialSelectedCountry,
  initialSelectionMode,
}: GeoPricingProviderProps) {
  const [selectionMode, setSelectionMode] = useState<"auto" | "override">(initialSelectionMode);
  const [selectedCountry, setSelectedCountry] = useState<SupportedCountryCode>(initialSelectedCountry);

  const value = useMemo(() => {
    const pricing = getPricingForCountry(selectedCountry);

    return {
      detectedCountry: initialDetectedCountry,
      selectedCountry,
      selectionMode,
      currency: pricing.currency,
      plans: pricing.plans,
      supportedCountries: SUPPORTED_COUNTRY_CODES,
      setCountrySelection: (country: SupportedCountryCode | "auto") => {
        if (country === "auto") {
          setSelectionMode("auto");
          setSelectedCountry(initialDetectedCountry);
          document.cookie = `${OVERRIDE_COUNTRY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
          document.cookie = `${EFFECTIVE_COUNTRY_COOKIE}=${initialDetectedCountry}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
          trackEvent("pricing_country_override", {
            mode: "auto",
            country: initialDetectedCountry,
          });
          return;
        }

        setSelectionMode("override");
        setSelectedCountry(country);
        document.cookie = `${OVERRIDE_COUNTRY_COOKIE}=${country}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        document.cookie = `${EFFECTIVE_COUNTRY_COOKIE}=${country}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        trackEvent("pricing_country_override", {
          mode: "override",
          country,
        });
      },
    };
  }, [initialDetectedCountry, selectedCountry, selectionMode]);

  return (
    <GeoPricingContext.Provider value={value}>
      {children}
    </GeoPricingContext.Provider>
  );
}

export function useGeoPricing() {
  return useContext(GeoPricingContext);
}
