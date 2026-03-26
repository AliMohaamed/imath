import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Tables for iMath Lead Management
  leads: defineTable({
    parentName: v.string(),
    studentName: v.string(),
    studentAge: v.number(),
    phoneNumber: v.string(),
    email: v.optional(v.string()),
    previousExperience: v.string(),
    timezone: v.string(),
    preferredSlots: v.array(v.string()),
    status: v.string(), // New Request, Trial Scheduled, etc.
    country: v.optional(v.string()),
    currency: v.optional(v.string()),
    locale: v.string(),
    submittedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"])
    .index("by_country", ["country"]),

  leadSubmissionRateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
    lastSubmissionAt: v.number(),
  }).index("by_key", ["key"]),

  adminNotifications: defineTable({
    leadId: v.id("leads"),
    kind: v.string(),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  })
    .index("by_is_read_and_created_at", ["isRead", "createdAt"])
    .index("by_created_at", ["createdAt"]),

  notificationDeliveries: defineTable({
    leadId: v.id("leads"),
    channel: v.string(),
    status: v.string(),
    attempts: v.number(),
    createdAt: v.number(),
    lastAttemptAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    externalMessageId: v.optional(v.string()),
  })
    .index("by_status_and_created_at", ["status", "createdAt"])
    .index("by_created_at", ["createdAt"]),

  // Pricing can be stored here or defined in code
  pricing: defineTable({
    countryCode: v.string(),
    currency: v.string(),
    packages: v.array(v.object({
      months: v.number(),
      price: v.number(),
    })),
  }).index("by_country", ["countryCode"]),
});
