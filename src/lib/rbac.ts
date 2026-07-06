import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export type AppRole = "ADMIN" | "SALES" | "TRAFFER";

export type SessionUser = {
  id: string;
  name?: string | null;
  username: string;
  role: AppRole;
};

/** Returns the current authenticated user, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser) ?? null;
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "ADMIN";
}

export function isTraffer(user: SessionUser | null): boolean {
  return user?.role === "TRAFFER";
}

/**
 * Builds the `where` clause for querying leads, scoped by role.
 * - ADMIN   → видит всё.
 * - SALES   → видит ТОЛЬКО закреплённых за ним лидов (личный кабинет).
 * - TRAFFER → видит ТОЛЬКО приведённых им лидов (качество своего трафика).
 */
export function leadScopeForUser(user: SessionUser): Prisma.LeadWhereInput {
  if (isAdmin(user)) return {};
  if (isTraffer(user)) return { trafferId: user.id };
  return { salesRepId: user.id };
}

/**
 * Whether the user is allowed to read/mutate a specific lead.
 * - SALES   → только свои закреплённые лиды.
 * - TRAFFER → только приведённые им (доступ read-only обеспечивается на уровне API).
 */
export function canAccessLead(
  user: SessionUser,
  lead: { salesRepId: string | null; trafferId?: string | null },
): boolean {
  if (isAdmin(user)) return true;
  if (isTraffer(user)) return lead.trafferId === user.id;
  return lead.salesRepId === user.id;
}
