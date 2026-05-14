import { createHash } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { bookingFormSchema, formatPhoneNumber, formatPreferredSlotValue } from "@/lib/booking";
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
  interestedPackage?: string;
  submittedAt: number;
  rateLimitKey: string;
};

type SubmitLeadResult =
  | { ok: true; leadId: string; notificationId: string; deliveryId: string }
  | { ok: false; code: "rate_limited" };

type RecordDeliveryAttemptArgs = {
  deliveryId: string;
  status: string;
  attempts: number;
  lastAttemptAt: number;
  errorMessage?: string;
  externalMessageId?: string;
};

const submitLeadReference = makeFunctionReference<"mutation", SubmitLeadArgs, SubmitLeadResult>("leads:submit");
const recordDeliveryAttemptReference = makeFunctionReference<
  "mutation",
  RecordDeliveryAttemptArgs,
  { ok: true }
>("notifications:recordDeliveryAttempt");

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

function formatTelegramMessage(params: {
  parentName: string;
  studentName: string;
  studentAge: number;
  phoneNumber: string;
  timezone: string;
  preferredSlots: string[];
  country: string;
  currency: string;
  locale: string;
  interestedPackage?: string;
}) {
  const title = "<b>🔔 طلب حصة تجريبية جديدة</b>";
  const separator = "──────────────────";
  
  return [
    title,
    separator,
    `👤 <b>ولي الأمر:</b> ${params.parentName}`,
    `👶 <b>الطالب:</b> ${params.studentName} (${params.studentAge} سنوات)`,
    `📞 <b>الهاتف:</b> <code>${params.phoneNumber}</code>`,
    `🌍 <b>الدولة:</b> ${params.country}`,
    `💰 <b>العملة:</b> ${params.currency}`,
    `🗣️ <b>اللغة المفضلة:</b> ${params.locale.toUpperCase()}`,
    `⏰ <b>توقيت المستخدم:</b> <code>${params.timezone}</code>`,
    ...(params.interestedPackage && params.interestedPackage !== "not_sure" ? [`📦 <b>الباقة المهتم بها:</b> ${params.interestedPackage} أشهر`] : []),
    separator,
    `📅 <b>الموعد المختار:</b>`,
    ...params.preferredSlots.map((slot) => `▫️ ${formatPreferredSlotValue(slot, "ar")}`),
    separator,
    `<i>تم الإرسال تلقائيًا من موقع iMath</i>`
  ].join("\n");
}

async function sendTelegramNotification(params: {
  botToken: string;
  chatId: string;
  message: string;
}) {
  const response = await fetch(`https://api.telegram.org/bot${params.botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: params.chatId,
      text: params.message,
      parse_mode: "HTML",
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    throw new Error(payload.description ?? "Telegram delivery failed.");
  }

  return payload.result?.message_id ? String(payload.result.message_id) : undefined;
}

export async function POST(request: Request) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

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
    interestedPackage: payload.interestedPackage,
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

  if (telegramBotToken && telegramChatId) {
    const telegramMessage = formatTelegramMessage({
      parentName: payload.parentName,
      studentName: payload.studentName,
      studentAge: payload.studentAge,
      phoneNumber: formatPhoneNumber(payload.phoneCountryCode, payload.phoneNumber),
      timezone: payload.timezone,
      preferredSlots: payload.preferredSlots,
      country,
      currency,
      locale: payload.locale,
      interestedPackage: payload.interestedPackage,
    });

    let attempts = 0;
    let delivered = false;
    let externalMessageId: string | undefined;
    let errorMessage: string | undefined;

    while (attempts < 2 && !delivered) {
      attempts += 1;

      try {
        externalMessageId = await sendTelegramNotification({
          botToken: telegramBotToken,
          chatId: telegramChatId,
          message: telegramMessage,
        });
        delivered = true;
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : "Telegram delivery failed.";
      }
    }

    await client.mutation(recordDeliveryAttemptReference, {
      deliveryId: result.deliveryId,
      status: delivered ? "sent" : "failed",
      attempts,
      lastAttemptAt: Date.now(),
      errorMessage: delivered ? undefined : errorMessage,
      externalMessageId,
    });
  } else {
    await client.mutation(recordDeliveryAttemptReference, {
      deliveryId: result.deliveryId,
      status: "skipped",
      attempts: 0,
      lastAttemptAt: Date.now(),
      errorMessage: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.",
    });
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
