import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  const allowedEmails = getAllowedAdminEmails();
  const identityEmail = identity.email?.toLowerCase();
  if (allowedEmails.length > 0 && (!identityEmail || !allowedEmails.includes(identityEmail))) {
    throw new Error("Forbidden");
  }
}

export const listUnread = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("adminNotifications")
      .withIndex("by_is_read_and_created_at", (q) => q.eq("isRead", false))
      .order("desc")
      .take(20);
  },
});

export const markAsRead = mutation({
  args: {
    notificationId: v.id("adminNotifications"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });
    return { ok: true as const };
  },
});

export const listRecentDeliveries = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("notificationDeliveries")
      .withIndex("by_created_at")
      .order("desc")
      .take(20);
  },
});

export const recordDeliveryAttempt = mutation({
  args: {
    deliveryId: v.id("notificationDeliveries"),
    status: v.string(),
    attempts: v.number(),
    lastAttemptAt: v.number(),
    errorMessage: v.optional(v.string()),
    externalMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.deliveryId, {
      status: args.status,
      attempts: args.attempts,
      lastAttemptAt: args.lastAttemptAt,
      errorMessage: args.errorMessage,
      externalMessageId: args.externalMessageId,
    });
    return { ok: true as const };
  },
});
