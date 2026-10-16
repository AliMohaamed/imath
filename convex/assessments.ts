import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/admin";
import { requireServerSecret } from "./lib/serverSecret";

const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;
const RATE_LIMIT_MAX_STARTS = 5;

const typeValidator = v.union(v.literal("personality"), v.literal("level"));

const dimensionScoresValidator = v.object({
  EI: v.number(),
  SN: v.number(),
  TF: v.number(),
  JP: v.number(),
});

const roundValidator = v.object({
  level: v.number(),
  correct: v.number(),
  total: v.number(),
  medianMs: v.number(),
});

export const start = mutation({
  args: {
    serverSecret: v.string(),
    type: typeValidator,
    clientToken: v.string(),
    locale: v.string(),
    country: v.optional(v.string()),
    parentName: v.optional(v.string()),
    parentEmail: v.optional(v.string()),
    phoneNumber: v.string(),
    studentName: v.string(),
    studentDob: v.optional(v.string()),
    studentAge: v.number(),
    gender: v.optional(v.string()),
    startedAt: v.number(),
    rateLimitKey: v.string(),
  },
  handler: async (ctx, { serverSecret, rateLimitKey, ...fields }) => {
    requireServerSecret(serverSecret);
    const key = `assessment:${rateLimitKey}`;
    const existing = await ctx.db
      .query("leadSubmissionRateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    const isWithinWindow = existing && fields.startedAt - existing.windowStart < RATE_LIMIT_WINDOW_MS;

    if (existing && isWithinWindow && existing.count >= RATE_LIMIT_MAX_STARTS) {
      return { ok: false as const, code: "rate_limited" as const };
    }

    if (!existing) {
      await ctx.db.insert("leadSubmissionRateLimits", {
        key,
        windowStart: fields.startedAt,
        count: 1,
        lastSubmissionAt: fields.startedAt,
      });
    } else if (!isWithinWindow) {
      await ctx.db.patch(existing._id, {
        windowStart: fields.startedAt,
        count: 1,
        lastSubmissionAt: fields.startedAt,
      });
    } else {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        lastSubmissionAt: fields.startedAt,
      });
    }

    const submissionId = await ctx.db.insert("assessmentSubmissions", {
      ...fields,
      status: "started",
    });

    return { ok: true as const, submissionId };
  },
});

export const updateInfo = mutation({
  args: {
    serverSecret: v.string(),
    // A plain string so a stale or malformed id gets "not_found" instead of a validation error.
    submissionId: v.string(),
    clientToken: v.string(),
    type: typeValidator,
    parentName: v.optional(v.string()),
    parentEmail: v.optional(v.string()),
    phoneNumber: v.string(),
    studentName: v.string(),
    studentDob: v.optional(v.string()),
    studentAge: v.number(),
    gender: v.optional(v.string()),
  },
  handler: async (ctx, { serverSecret, submissionId, clientToken, type, ...fields }) => {
    requireServerSecret(serverSecret);
    const id = ctx.db.normalizeId("assessmentSubmissions", submissionId);
    const submission = id ? await ctx.db.get(id) : null;

    if (!id || !submission || submission.clientToken !== clientToken || submission.type !== type) {
      return { ok: false as const, code: "not_found" as const };
    }

    // A finished result keeps the details it was sent to the team with.
    if (submission.status === "completed") {
      return { ok: false as const, code: "already_completed" as const };
    }

    await ctx.db.patch(id, fields);
    return { ok: true as const };
  },
});

export const complete = mutation({
  args: {
    serverSecret: v.string(),
    // A plain string so a stale or malformed id gets "not_found" instead of a validation error.
    submissionId: v.string(),
    clientToken: v.string(),
    type: typeValidator,
    completedAt: v.number(),
    // personality
    answers: v.optional(v.array(v.number())),
    typeCode: v.optional(v.string()),
    profile: v.optional(v.string()),
    dimensionScores: v.optional(dimensionScoresValidator),
    // level
    placementLevel: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    speedStars: v.optional(v.number()),
    rounds: v.optional(v.array(roundValidator)),
  },
  handler: async (ctx, { serverSecret, submissionId, clientToken, type, ...result }) => {
    requireServerSecret(serverSecret);
    const id = ctx.db.normalizeId("assessmentSubmissions", submissionId);
    const submission = id ? await ctx.db.get(id) : null;

    // Same answer for a missing record and a wrong token so ids can't be probed.
    if (!id || !submission || submission.clientToken !== clientToken || submission.type !== type) {
      return { ok: false as const, code: "not_found" as const };
    }

    if (submission.status === "completed") {
      return { ok: false as const, code: "already_completed" as const };
    }

    await ctx.db.patch(id, { ...result, status: "completed" });

    return {
      ok: true as const,
      parentName: submission.parentName,
      studentName: submission.studentName,
      studentAge: submission.studentAge,
      phoneNumber: submission.phoneNumber,
      country: submission.country,
      locale: submission.locale,
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("assessmentSubmissions")
      .withIndex("by_started_at")
      .order("desc")
      .take(200);
  },
});
