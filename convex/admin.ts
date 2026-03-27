import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { LEAD_STATUS_OPTIONS } from "../src/lib/leads";

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
  return identity;
}

export const getViewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isAuthenticated: false,
        isAuthorized: false,
        email: null,
      };
    }

    // Try to get email from identity or fetch the user doc
    let email = identity.email?.toLowerCase();
    if (!email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_id", (q) => q.eq("_id", identity.subject as any))
        .unique();
      email = user?.email?.toLowerCase();
    }

    if (!email) {
      return {
        isAuthenticated: true,
        isAuthorized: false,
        email: "unknown",
      };
    }

    const allowedEmails = getAllowedAdminEmails();
    const isAuthorized =
      allowedEmails.length === 0 ? true : allowedEmails.includes(email);

    return {
      isAuthenticated: true,
      isAuthorized,
      email,
    };
  },
});

export const listLeads = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("leads")
      .withIndex("by_submitted_at")
      .order("desc")
      .take(200);
  },
});

export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      ...LEAD_STATUS_OPTIONS.map((status) => v.literal(status))
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.leadId, { status: args.status });
    return { ok: true as const };
  },
});
