import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name?: string | null;
  username: string;
  role: "ADMIN" | "SALES";
};

/** Returns the current authenticated user, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser) ?? null;
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "ADMIN";
}

/**
 * Builds the `where` clause for querying leads, scoped by role.
 * Admins see everything; sales reps see only leads assigned to them.
 */
export function leadScopeForUser(user: SessionUser): Prisma.LeadWhereInput {
  if (isAdmin(user)) return {};
  return { salesRepId: user.id };
}

/** Whether the user is allowed to read/mutate a specific lead. */
export function canAccessLead(
  user: SessionUser,
  lead: { salesRepId: string | null },
): boolean {
  if (isAdmin(user)) return true;
  return lead.salesRepId === user.id;
}
