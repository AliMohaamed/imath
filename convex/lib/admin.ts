import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

/** The signed-in user's email, read from the users table when the token doesn't carry it. */
export async function getViewerEmail(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  if (identity.email) {
    return identity.email.toLowerCase();
  }

  const userId = await getAuthUserId(ctx);
  const user = userId ? await ctx.db.get(userId) : null;
  return user?.email?.toLowerCase() ?? "";
}

/** Anyone can sign up, so an empty or missing allowlist must lock everyone out rather than let everyone in. */
export function isAllowedAdmin(email: string | null) {
  return Boolean(email) && getAllowedAdminEmails().includes(email!);
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const email = await getViewerEmail(ctx);
  if (email === null) {
    throw new Error("Unauthorized");
  }
  if (!isAllowedAdmin(email)) {
    throw new Error("Forbidden");
  }
  return email;
}
