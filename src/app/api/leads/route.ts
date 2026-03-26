import { createHash } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { bookingFormSchema, formatPhoneNumber } from "@/lib/booking";
import { getGeoContext } from "@/lib/geo";
import {
  DETECTED_COUNTRY_COOKIE,
  EFFECTIVE_COUNTRY_COOKIE,
  OVERRIDE_COUNTRY_COOKIE,
  resolveSupportedCountryCode,
} from "@/lib/pricing";

type SubmitLeadArgs = {
  parentName: string;
  studentName: string;
  studentAge: number;
  phoneNumber: string;
  email?: string;
  previousExperience: string;
  timezone: string;
  preferredSlots: string[];
  status: string;
  country?: string;
  currency?: string;
  locale: string;
  submittedAt: number;
  rateLimitKey: string;
};

type SubmitLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; code: "rate_limited" };

const submitLeadReference = makeFunctionReference<"mutation", SubmitLeadArgs, SubmitLeadResult>("leads:submit");

function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }

  return headers.get("x-real-ip") ?? "unknown";
}

function createRateLimitKey(headers: Headers) {
  const ip = getClientIp(headers);
  const userAgent = headers.get("user-agent") ?? "unknown";

  return createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex");
}

export async function POST(request: Request) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return NextResponse.json(
      { ok: false, message: "Convex backend is not configured." },
      { status: 500 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = bookingFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const submittedAt = Date.now();
  const resolvedCountry = resolveSupportedCountryCode(
    parsed.data.countryCode ||
      cookieStore.get(OVERRIDE_COUNTRY_COOKIE)?.value ||
      cookieStore.get(EFFECTIVE_COUNTRY_COOKIE)?.value ||
      cookieStore.get(DETECTED_COUNTRY_COOKIE)?.value ||
      request.headers.get("x-vercel-ip-country")
  );
  const { country, currency } = getGeoContext(resolvedCountry);
  const client = new ConvexHttpClient(convexUrl);
  const payload = parsed.data;

  const result = await client.mutation(submitLeadReference, {
    parentName: payload.parentName,
    studentName: payload.studentName,
    studentAge: payload.studentAge,
    phoneNumber: formatPhoneNumber(payload.phoneCountryCode, payload.phoneNumber),
    email: payload.email || undefined,
    previousExperience: payload.previousExperience,
    timezone: payload.timezone,
    preferredSlots: payload.preferredSlots,
    status: "New Request",
    country,
    currency,
    locale: payload.locale,
    submittedAt,
    rateLimitKey: createRateLimitKey(request.headers),
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "Too many requests. Please wait before submitting again.",
      },
      { status: 429 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      leadId: result.leadId,
      submittedAt,
      country,
      currency,
    },
    { status: 201 }
  );
}
