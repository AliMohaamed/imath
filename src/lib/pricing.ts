/** Countries without their own prices see the Saudi prices converted to US dollars. */
export const DEFAULT_PRICING_REGION = "INTL";
/** The visitor's real country (from x-vercel-ip-country), whether or not it has its own prices. */
export const DETECTED_COUNTRY_COOKIE = "imath-country-detected";
/** Cookies from the retired country picker; the proxy deletes them so they can't change prices. */
export const LEGACY_COUNTRY_COOKIES = ["imath-country", "imath-country-override"] as const;
// The riyal is pegged at 3.75 to the dollar.
const SAR_PER_USD = 3.75;

export const EG_PLAN_DETAILS = [
  {
    months: 1,
    nameKey: "plan1Name",
    sessions: 8,
    pricePerSession: 200,
    originalPricePerSession: null,
    badge: null,
    featuresKeys: [
      "plan1Feature1",
      "plan1Feature2",
      "plan1Feature3",
      "plan1Feature4",
      "plan1Feature5",
    ],
  },
  {
    months: 3,
    nameKey: "plan2Name",
    sessions: 24,
    pricePerSession: 175,
    originalPricePerSession: 200,
    badge: "mostPopular",
    featuresKeys: [
      "plan2Feature1",
      "plan2Feature2",
      "plan2Feature3",
      "plan2Feature5",
    ],
  },
  {
    months: 6,
    nameKey: "plan3Name",
    sessions: 48,
    pricePerSession: 156,
    originalPricePerSession: 200,
    badge: null,
    featuresKeys: [
      "plan3Feature1",
      "plan3Feature2",
      "plan3Feature3",
      "plan3Feature4",
      "plan3Feature5",
    ],
  },
  {
    months: 12,
    nameKey: "plan4Name",
    sessions: 96,
    pricePerSession: 156,
    originalPricePerSession: 200,
    badge: "bestValue",
    featuresKeys: [
      "plan4Feature1",
      "plan4Feature2",
      "plan4Feature3",
      "plan4Feature4",
      "plan4Feature5",
    ],
  },
] as const;

export const PRICING_CONFIG = {
  EG: {
    currency: "EGP",
    plans: [
      { months: 1, price: 1600, savingsPercent: 0, isPopular: false },
      { months: 3, price: 4200, savingsPercent: 12, isPopular: true },
      { months: 6, price: 7500, savingsPercent: 22, isPopular: false },
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

const DEFAULT_PRICING = {
  currency: "USD",
  plans: PRICING_CONFIG.SA.plans.map((plan) => ({ ...plan, price: Math.round(plan.price / SAR_PER_USD) })),
};

export type SupportedCountryCode = keyof typeof PRICING_CONFIG;
export type PricingRegion = SupportedCountryCode | typeof DEFAULT_PRICING_REGION;

export const SUPPORTED_COUNTRY_CODES = Object.keys(
  PRICING_CONFIG,
) as SupportedCountryCode[];

export function normalizeCountryCode(countryCode?: string | null) {
  const normalized = countryCode?.trim().toUpperCase();
  // Vercel sends XX when it can't place the address.
  return normalized && /^[A-Z]{2}$/.test(normalized) && normalized !== "XX" ? normalized : undefined;
}

export function isSupportedCountryCode(
  countryCode?: string | null,
): countryCode is SupportedCountryCode {
  const normalized = normalizeCountryCode(countryCode);
  return normalized
    ? SUPPORTED_COUNTRY_CODES.includes(normalized as SupportedCountryCode)
    : false;
}

export function resolvePricingRegion(countryCode?: string | null): PricingRegion {
  const normalized = normalizeCountryCode(countryCode);
  return isSupportedCountryCode(normalized) ? normalized : DEFAULT_PRICING_REGION;
}

/** Prices follow the visitor's country only; there is no way to pick another country's prices. */
export function getPricingForCountry(countryCode?: string | null) {
  const region = resolvePricingRegion(countryCode);
  const config = region === DEFAULT_PRICING_REGION ? DEFAULT_PRICING : PRICING_CONFIG[region];

  return {
    region,
    currency: config.currency,
    plans: config.plans,
  };
}
