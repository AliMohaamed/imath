import { createHash } from "node:crypto";

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }

  return headers.get("x-real-ip") ?? "unknown";
}

export function createRateLimitKey(headers: Headers) {
  const ip = getClientIp(headers);
  const userAgent = headers.get("user-agent") ?? "unknown";

  return createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");
}
