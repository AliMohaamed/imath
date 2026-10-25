import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { cookies } from "next/headers";
import { after, NextResponse } from "next/server";
import { assessmentRequestSchema, type AssessmentRequest } from "@/lib/assessment/api-schema";
import { getAgeFromDob } from "@/lib/assessment/common";
import { scoreAnswers } from "@/lib/assessment/personality/scoring";
import { formatPhoneNumber } from "@/lib/booking";
import { getGeoContext } from "@/lib/geo";
import { createRateLimitKey } from "@/lib/server/rate-limit";
import { escapeTelegramHtml, sendTelegramNotification } from "@/lib/telegram";

type StartArgs = ContactFields & {
  serverSecret: string;
  type: "personality" | "level";
  clientToken: string;
  locale: string;
  country?: string;
  startedAt: number;
  rateLimitKey: string;
};

type StartResult =
  | { ok: true; submissionId: string }
  | { ok: false; code: "rate_limited" };

type ContactFields = {
  parentName?: string;
  parentEmail?: string;
  phoneNumber: string;
  studentName: string;
  studentDob?: string;
  studentAge: number;
  gender?: string;
};

type UpdateInfoArgs = ContactFields & {
  serverSecret: string;
  submissionId: string;
  clientToken: string;
  type: "personality" | "level";
};

type UpdateInfoResult = { ok: true } | { ok: false; code: "not_found" | "already_completed" };

type CompleteArgs = {
  serverSecret: string;
  submissionId: string;
  clientToken: string;
  type: "personality" | "level";
  completedAt: number;
  answers?: number[];
  typeCode?: string;
  profile?: string;
  dimensionScores?: { EI: number; SN: number; TF: number; JP: number };
  placementLevel?: number;
  accuracy?: number;
  speedStars?: number;
  rounds?: Array<{ level: number; correct: number; total: number; medianMs: number }>;
};

type CompleteResult =
  | {
      ok: true;
      parentName?: string;
      studentName: string;
      studentAge: number;
      phoneNumber: string;
      country?: string;
      locale: string;
    }
  | { ok: false; code: "not_found" | "already_completed" };

const startReference = makeFunctionReference<"mutation", StartArgs, StartResult>("assessments:start");
const updateInfoReference = makeFunctionReference<"mutation", UpdateInfoArgs, UpdateInfoResult>(
  "assessments:updateInfo"
);
const completeReference = makeFunctionReference<"mutation", CompleteArgs, CompleteResult>(
  "assessments:complete"
);

function fail(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, message, ...extra }, { status });
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    console.error("[api/assessments] Request failed:", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}

async function handlePost(request: Request) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const serverSecret = process.env.CONVEX_SERVER_SECRET;
  if (!convexUrl || !serverSecret) {
    return fail("Convex backend is not configured.", 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  const parsed = assessmentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Validation failed.", 400, { fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const client = new ConvexHttpClient(convexUrl);
  const payload = parsed.data;

  if (payload.action === "start") {
    return handleStart(request, client, serverSecret, payload);
  }

  if (payload.action === "update") {
    return handleUpdate(client, serverSecret, payload);
  }

  return handleComplete(client, serverSecret, payload);
}

/** The contact details stored on a submission, normalised the same way for "start" and "update". */
function getContactFields(
  payload: Extract<AssessmentRequest, { action: "start" | "update" }>
): ContactFields {
  const phoneNumber = formatPhoneNumber(payload.info.phoneCountryCode, payload.info.phoneNumber);

  return payload.type === "personality"
    ? {
        parentName: payload.info.parentName,
        parentEmail: payload.info.parentEmail,
        phoneNumber,
        studentName: payload.info.studentName,
        studentDob: payload.info.studentDob,
        studentAge: getAgeFromDob(payload.info.studentDob) ?? 0,
        gender: payload.info.gender,
      }
    : {
        phoneNumber,
        studentName: payload.info.studentName,
        studentAge: payload.info.studentAge,
      };
}

async function handleStart(
  request: Request,
  client: ConvexHttpClient,
  serverSecret: string,
  payload: Extract<AssessmentRequest, { action: "start" }>
) {
  const cookieStore = await cookies();
  const { country } = getGeoContext(request, cookieStore);

  const args: StartArgs = {
    serverSecret,
    type: payload.type,
    clientToken: payload.clientToken,
    locale: payload.locale,
    country,
    startedAt: Date.now(),
    rateLimitKey: createRateLimitKey(request.headers),
    ...getContactFields(payload),
  };

  const result = await client.mutation(startReference, args);

  if (!result.ok) {
    return fail("Too many requests. Please wait before trying again.", 429);
  }

  return NextResponse.json({ ok: true, submissionId: result.submissionId }, { status: 201 });
}

async function handleUpdate(
  client: ConvexHttpClient,
  serverSecret: string,
  payload: Extract<AssessmentRequest, { action: "update" }>
) {
  const result = await client.mutation(updateInfoReference, {
    serverSecret,
    submissionId: payload.submissionId,
    clientToken: payload.clientToken,
    type: payload.type,
    ...getContactFields(payload),
  });

  if (!result.ok) {
    return fail("Submission not found.", result.code === "already_completed" ? 409 : 404);
  }

  return NextResponse.json({ ok: true });
}

async function handleComplete(
  client: ConvexHttpClient,
  serverSecret: string,
  payload: Extract<AssessmentRequest, { action: "complete" }>
) {
  const common = {
    serverSecret,
    submissionId: payload.submissionId,
    clientToken: payload.clientToken,
    completedAt: Date.now(),
  };

  const personalityScore = payload.type === "personality" ? scoreAnswers(payload.answers) : null;

  const args: CompleteArgs = personalityScore
    ? {
        ...common,
        type: "personality",
        answers: payload.type === "personality" ? payload.answers : undefined,
        typeCode: personalityScore.typeCode,
        profile: personalityScore.profile,
        dimensionScores: personalityScore.scores,
      }
    : { ...common, type: "level", ...(payload.type === "level" ? payload.result : {}) };

  const result = await client.mutation(completeReference, args);

  if (!result.ok) {
    // Completing twice is harmless for the child, so treat it as success.
    if (result.code === "already_completed") {
      return NextResponse.json({ ok: true });
    }
    return fail("Submission not found.", 404);
  }

  // Sent after the response so a slow Telegram never delays (or fails) the child's result.
  after(() => notifyCompletion(payload, result, personalityScore));

  return NextResponse.json({ ok: true });
}

async function notifyCompletion(
  payload: Extract<AssessmentRequest, { action: "complete" }>,
  submission: Extract<CompleteResult, { ok: true }>,
  personalityScore: ReturnType<typeof scoreAnswers> | null
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return;
  }

  const student = `${escapeTelegramHtml(submission.studentName)} (${submission.studentAge})`;
  const phone = `<code>${escapeTelegramHtml(submission.phoneNumber)}</code>`;
  const origin = `${submission.country ?? "-"} · ${submission.locale.toUpperCase()}`;

  const lines =
    payload.type === "personality" && personalityScore
      ? [
          "<b>🧠 اختبار الشخصية اكتمل</b>",
          `👶 <b>الطالب:</b> ${student}`,
          `⚡ <b>النتيجة:</b> ${personalityScore.profile} (${personalityScore.typeCode})`,
          `👤 <b>ولي الأمر:</b> ${escapeTelegramHtml(submission.parentName ?? "-")}`,
          `📞 <b>الهاتف:</b> ${phone}`,
          `🌍 ${origin}`,
        ]
      : payload.type === "level"
      ? [
          "<b>🔢 اختبار المستوى اكتمل</b>",
          `👶 <b>الطالب:</b> ${student}`,
          `🏅 <b>المستوى:</b> ${payload.result.placementLevel} (${"★".repeat(payload.result.speedStars) || "-"}, ${Math.round(payload.result.accuracy)}%)`,
          `📞 <b>الهاتف:</b> ${phone}`,
          `🌍 ${origin}`,
        ]
      : [];

  if (lines.length === 0) {
    return;
  }

  try {
    await sendTelegramNotification({ botToken, chatId, message: lines.join("\n") });
  } catch (error) {
    // The child's result must never fail because a notification did.
    console.error("[api/assessments] Telegram notification failed:", error);
  }
}
