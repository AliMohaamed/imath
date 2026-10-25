import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  bookingFormSchema,
  EGYPT_TIME_ZONE,
  formatDateInTimeZone,
  formatPhoneNumber,
  formatPreferredSlotValue,
  preferredSlotToDate,
} from "@/lib/booking";
import { getGeoContext } from "@/lib/geo";
import { DEFAULT_PRICING_REGION } from "@/lib/pricing";
import { createRateLimitKey } from "@/lib/server/rate-limit";
import { escapeTelegramHtml, sendTelegramNotification } from "@/lib/telegram";

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

function formatCountry(countryCode: string | undefined) {
  if (!countryCode) {
    return "غير معروفة";
  }

  const flag = String.fromCodePoint(...[...countryCode].map((letter) => 0x1f1a5 + letter.charCodeAt(0)));
  const name = new Intl.DisplayNames(["ar"], { type: "region" }).of(countryCode) ?? countryCode;
  return `${flag} ${name} (${countryCode})`;
}

function formatSessionTimes(slot: string, timezone: string) {
  const date = preferredSlotToDate(slot, timezone);

  // An unrecognised time zone leaves only the time the parent picked, with no conversion.
  if (!date) {
    return [`🕐 <b>بتوقيت ولي الأمر:</b> ${formatPreferredSlotValue(slot, "ar")} (<code>${escapeTelegramHtml(timezone)}</code>)`];
  }

  return [
    `🕐 <b>بتوقيت ولي الأمر</b> (<code>${escapeTelegramHtml(timezone)}</code>): ${formatDateInTimeZone(date, "ar", timezone)}`,
    `🇪🇬 <b>بتوقيت مصر:</b> ${formatDateInTimeZone(date, "ar", EGYPT_TIME_ZONE)}`,
  ];
}

function formatTelegramMessage(params: {
  parentName: string;
  studentName: string;
  studentAge: number;
  phoneNumber: string;
  email?: string;
  timezone: string;
  preferredSlots: string[];
  country: string | undefined;
  pricingRegion: string;
  currency: string;
  locale: string;
  interestedPackage?: string;
}) {
  const title = "<b>🔔 طلب حصة تجريبية جديدة</b>";
  const separator = "──────────────────";
  const pricing =
    params.pricingRegion === DEFAULT_PRICING_REGION ? `${params.currency} (السعر الدولي)` : params.currency;

  return [
    title,
    separator,
    `👤 <b>ولي الأمر:</b> ${escapeTelegramHtml(params.parentName)}`,
    `📞 <b>الهاتف:</b> <code>${escapeTelegramHtml(params.phoneNumber)}</code>`,
    ...(params.email ? [`✉️ <b>البريد:</b> ${escapeTelegramHtml(params.email)}`] : []),
    `👶 <b>الطالب:</b> ${escapeTelegramHtml(params.studentName)} (${params.studentAge} سنوات)`,
    `🌍 <b>الدولة:</b> ${formatCountry(params.country)}`,
    `💰 <b>الأسعار المعروضة:</b> ${pricing}`,
    `🗣️ <b>اللغة المفضلة:</b> ${params.locale.toUpperCase()}`,
    ...(params.interestedPackage && params.interestedPackage !== "not_sure" ? [`📦 <b>الباقة المهتم بها:</b> ${escapeTelegramHtml(params.interestedPackage)} أشهر`] : []),
    separator,
    `📅 <b>موعد الحصة التجريبية:</b>`,
    ...params.preferredSlots.flatMap((slot) => formatSessionTimes(slot, params.timezone)),
    separator,
    `<i>تم الإرسال تلقائيًا من موقع iMath</i>`
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    console.error("[api/leads] Lead submission failed:", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong while submitting your request. Please try again." },
      { status: 500 }
    );
  }
}

async function handlePost(request: Request) {
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
  const { country, pricingRegion, currency } = getGeoContext(request, cookieStore);
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
      email: payload.email || undefined,
      timezone: payload.timezone,
      preferredSlots: payload.preferredSlots,
      country,
      pricingRegion,
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
