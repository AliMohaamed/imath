export const DEFAULT_COUNTRY_CODE = "EG";

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  EG: "EGP",
  SA: "SAR",
  KW: "KWD",
  AE: "AED",
  QA: "QAR",
};

export function normalizeCountryCode(countryCode?: string | null) {
  const normalized = countryCode?.trim().toUpperCase();
  return normalized && /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
}

export function getCurrencyForCountry(countryCode?: string | null) {
  const normalized = normalizeCountryCode(countryCode) ?? DEFAULT_COUNTRY_CODE;
  return COUNTRY_CURRENCY_MAP[normalized] ?? COUNTRY_CURRENCY_MAP[DEFAULT_COUNTRY_CODE];
}

export function getGeoContext(countryCode?: string | null) {
  const country = normalizeCountryCode(countryCode) ?? DEFAULT_COUNTRY_CODE;

  return {
    country,
    currency: getCurrencyForCountry(country),
  };
}
