export const LEAD_STATUS_OPTIONS = [
  "New Request",
  "Trial Scheduled",
  "Trial Completed",
  "Subscribed",
  "Did Not Subscribe",
] as const;

export type LeadStatus = (typeof LEAD_STATUS_OPTIONS)[number];

export const LEAD_FILTER_STATUS_OPTIONS = ["all", ...LEAD_STATUS_OPTIONS] as const;
export type LeadFilterStatus = (typeof LEAD_FILTER_STATUS_OPTIONS)[number];

export const LEAD_COUNTRY_FILTER_OPTIONS = ["all", "EG", "SA", "KW", "AE", "QA"] as const;
export type LeadCountryFilter = (typeof LEAD_COUNTRY_FILTER_OPTIONS)[number];
