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
  }).index("by_status", ["status"]),

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
