import { v } from "convex/values";
import { mutation } from "./_generated/server";

const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;

export const submit = mutation({
  args: {
    parentName: v.string(),
    studentName: v.string(),
    studentAge: v.number(),
    phoneNumber: v.string(),
    email: v.optional(v.string()),
    previousExperience: v.string(),
    timezone: v.string(),
    preferredSlots: v.array(v.string()),
    status: v.string(),
    country: v.optional(v.string()),
    currency: v.optional(v.string()),
    locale: v.string(),
    interestedPackage: v.optional(v.string()),
    submittedAt: v.number(),
    rateLimitKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existingRateLimit = await ctx.db
      .query("leadSubmissionRateLimits")
      .withIndex("by_key", (q) => q.eq("key", args.rateLimitKey))
      .unique();

    if (
      existingRateLimit &&
      args.submittedAt - existingRateLimit.windowStart < RATE_LIMIT_WINDOW_MS &&
      existingRateLimit.count >= RATE_LIMIT_MAX_SUBMISSIONS
    ) {
      return {
        ok: false as const,
        code: "rate_limited" as const,
      };
    }

    if (!existingRateLimit || args.submittedAt - existingRateLimit.windowStart >= RATE_LIMIT_WINDOW_MS) {
      if (existingRateLimit) {
        await ctx.db.patch(existingRateLimit._id, {
          windowStart: args.submittedAt,
          count: 1,
          lastSubmissionAt: args.submittedAt,
        });
      } else {
        await ctx.db.insert("leadSubmissionRateLimits", {
          key: args.rateLimitKey,
          windowStart: args.submittedAt,
          count: 1,
          lastSubmissionAt: args.submittedAt,
        });
      }
    } else {
      await ctx.db.patch(existingRateLimit._id, {
        count: existingRateLimit.count + 1,
        lastSubmissionAt: args.submittedAt,
      });
    }

    const leadId = await ctx.db.insert("leads", {
      parentName: args.parentName,
      studentName: args.studentName,
      studentAge: args.studentAge,
      phoneNumber: args.phoneNumber,
      email: args.email,
      previousExperience: args.previousExperience,
      timezone: args.timezone,
      preferredSlots: args.preferredSlots,
      status: args.status,
      country: args.country,
      currency: args.currency,
      locale: args.locale,
      interestedPackage: args.interestedPackage,
      submittedAt: args.submittedAt,
    });

    const notificationId = await ctx.db.insert("adminNotifications", {
      leadId,
      kind: "new_lead",
      title: `New trial request from ${args.parentName}`,
      message: `${args.studentName} (${args.studentAge}) - ${args.country ?? "EG"} - ${args.phoneNumber}`,
      isRead: false,
      createdAt: args.submittedAt,
    });

    const deliveryId = await ctx.db.insert("notificationDeliveries", {
      leadId,
      channel: "telegram",
      status: "pending",
      attempts: 0,
      createdAt: args.submittedAt,
    });

    return {
      ok: true as const,
      leadId,
      notificationId,
      deliveryId,
    };
  },
});
