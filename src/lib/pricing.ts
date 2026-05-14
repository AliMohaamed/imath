export const DEFAULT_COUNTRY_CODE = "EG";
export const EFFECTIVE_COUNTRY_COOKIE = "imath-country";
export const DETECTED_COUNTRY_COOKIE = "imath-country-detected";
export const OVERRIDE_COUNTRY_COOKIE = "imath-country-override";

export const PRICING_CONFIG = {
  EG: {
    currency: "EGP",
    plans: [
      { months: 1, price: 1600, savingsPercent: 0, isPopular: false },
      { months: 3, price: 4200, savingsPercent: 12, isPopular: false },
      { months: 6, price: 7500, savingsPercent: 22, isPopular: true },
      { months: 12, price: 15000, savingsPercent: 22, isPopular: false },
    ],
  },
  SA: {
    currency: "SAR",
    plans: [
      { months: 1, price: 160, savingsPercent: 0, isPopular: false },
      { months: 3, price: 428, savingsPercent: 11, isPopular: false },
      { months: 6, price: 800, savingsPercent: 16, isPopular: true },
      { months: 12, price: 1500, savingsPercent: 21, isPopular: false },
    ],
  },
  KW: {
    currency: "KWD",
    plans: [
      { months: 1, price: 15, savingsPercent: 0, isPopular: false },
      { months: 3, price: 40, savingsPercent: 11, isPopular: false },
      { months: 6, price: 77, savingsPercent: 14, isPopular: true },
      { months: 12, price: 149, savingsPercent: 17, isPopular: false },
    ],
  },
  AE: {
    currency: "AED",
    plans: [
      { months: 1, price: 160, savingsPercent: 0, isPopular: false },
      { months: 3, price: 428, savingsPercent: 11, isPopular: false },
      { months: 6, price: 800, savingsPercent: 14, isPopular: true },
      { months: 12, price: 1500, savingsPercent: 17, isPopular: false },
    ],
  },
  QA: {
    currency: "QAR",
    plans: [
      { months: 1, price: 160, savingsPercent: 0, isPopular: false },
      { months: 3, price: 428, savingsPercent: 11, isPopular: false },
      { months: 6, price: 800, savingsPercent: 14, isPopular: true },
      { months: 12, price: 1500, savingsPercent: 17, isPopular: false },
    ],
  },
} as const;

export type SupportedCountryCode = keyof typeof PRICING_CONFIG;

export const SUPPORTED_COUNTRY_CODES = Object.keys(
  PRICING_CONFIG,
) as SupportedCountryCode[];

export function normalizeCountryCode(countryCode?: string | null) {
  const normalized = countryCode?.trim().toUpperCase();
  return normalized && /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
}

export function isSupportedCountryCode(
  countryCode?: string | null,
): countryCode is SupportedCountryCode {
  const normalized = normalizeCountryCode(countryCode);
  return normalized
    ? SUPPORTED_COUNTRY_CODES.includes(normalized as SupportedCountryCode)
    : false;
}

export function resolveSupportedCountryCode(countryCode?: string | null) {
  return isSupportedCountryCode(countryCode)
    ? countryCode
    : DEFAULT_COUNTRY_CODE;
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
