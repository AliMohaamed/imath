"use client";

type AnalyticsPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  const entry = {
    event,
    ...payload,
    timestamp: Date.now(),
  };

  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer?.push(entry);
  window.dispatchEvent(new CustomEvent("imath:analytics", { detail: entry }));

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", entry);
  }
}
