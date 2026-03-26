export const DEFAULT_COUNTRY_CODE = "EG";
export const EFFECTIVE_COUNTRY_COOKIE = "imath-country";
export const DETECTED_COUNTRY_COOKIE = "imath-country-detected";
export const OVERRIDE_COUNTRY_COOKIE = "imath-country-override";

export const PRICING_CONFIG = {
  EG: {
    currency: "EGP",
    plans: [
      { months: 1, price: 240, savingsPercent: 0, isPopular: false },
      { months: 3, price: 600, savingsPercent: 15, isPopular: true },
      { months: 6, price: 1100, savingsPercent: 25, isPopular: false },
      { months: 12, price: 2000, savingsPercent: 35, isPopular: false },
    ],
  },
  SA: {
    currency: "SAR",
    plans: [
      { months: 1, price: 129, savingsPercent: 0, isPopular: false },
      { months: 3, price: 329, savingsPercent: 15, isPopular: true },
      { months: 6, price: 609, savingsPercent: 25, isPopular: false },
      { months: 12, price: 1149, savingsPercent: 35, isPopular: false },
    ],
  },
  KW: {
    currency: "KWD",
    plans: [
      { months: 1, price: 11, savingsPercent: 0, isPopular: false },
      { months: 3, price: 28, savingsPercent: 15, isPopular: true },
      { months: 6, price: 51, savingsPercent: 25, isPopular: false },
      { months: 12, price: 95, savingsPercent: 35, isPopular: false },
    ],
  },
  AE: {
    currency: "AED",
    plans: [
      { months: 1, price: 139, savingsPercent: 0, isPopular: false },
      { months: 3, price: 355, savingsPercent: 15, isPopular: true },
      { months: 6, price: 659, savingsPercent: 25, isPopular: false },
      { months: 12, price: 1239, savingsPercent: 35, isPopular: false },
    ],
  },
  QA: {
    currency: "QAR",
    plans: [
      { months: 1, price: 135, savingsPercent: 0, isPopular: false },
      { months: 3, price: 345, savingsPercent: 15, isPopular: true },
      { months: 6, price: 639, savingsPercent: 25, isPopular: false },
      { months: 12, price: 1199, savingsPercent: 35, isPopular: false },
    ],
  },
} as const;

export type SupportedCountryCode = keyof typeof PRICING_CONFIG;

export const SUPPORTED_COUNTRY_CODES = Object.keys(PRICING_CONFIG) as SupportedCountryCode[];

export function normalizeCountryCode(countryCode?: string | null) {
  const normalized = countryCode?.trim().toUpperCase();
  return normalized && /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
}

export function isSupportedCountryCode(countryCode?: string | null): countryCode is SupportedCountryCode {
  const normalized = normalizeCountryCode(countryCode);
  return normalized ? SUPPORTED_COUNTRY_CODES.includes(normalized as SupportedCountryCode) : false;
}

export function resolveSupportedCountryCode(countryCode?: string | null) {
  return isSupportedCountryCode(countryCode) ? countryCode : DEFAULT_COUNTRY_CODE;
}

export function getPricingForCountry(countryCode?: string | null) {
  const resolvedCountryCode = resolveSupportedCountryCode(countryCode);
  const config = PRICING_CONFIG[resolvedCountryCode];

  return {
    countryCode: resolvedCountryCode,
    currency: config.currency,
    plans: config.plans,
  };
}

export function getDetectedCountryFromHeader(countryCode?: string | null) {
  return resolveSupportedCountryCode(countryCode);
}

export function getInitialCountrySelection(params: {
  detectedCountry?: string | null;
  overrideCountry?: string | null;
}) {
  const detectedCountry = resolveSupportedCountryCode(params.detectedCountry);
  const overrideCountry = params.overrideCountry;

  if (isSupportedCountryCode(overrideCountry)) {
    return {
      detectedCountry,
      selectedCountry: overrideCountry,
      selectionMode: "override" as const,
    };
  }

  return {
    detectedCountry,
    selectedCountry: detectedCountry,
    selectionMode: "auto" as const,
  };
}
