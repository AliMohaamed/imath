import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { LEAD_STATUS_OPTIONS } from "../src/lib/leads";
import { getViewerEmail, isAllowedAdmin, requireAdmin } from "./lib/admin";

export const getViewer = query({
  args: {},
  handler: async (ctx) => {
    const email = await getViewerEmail(ctx);
    if (email === null) {
      return {
        isAuthenticated: false,
        isAuthorized: false,
        email: null,
      };
    }

    return {
      isAuthenticated: true,
      isAuthorized: isAllowedAdmin(email),
      email: email || "unknown",
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
