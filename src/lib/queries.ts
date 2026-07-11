import { Prisma } from "@prisma/client";

/** Public projection of a sales rep embedded in a lead card. */
export const salesRepSelect = {
  id: true,
  name: true,
  username: true,
  telegram: true,
  role: true,
} satisfies Prisma.UserSelect;

/** Relations always loaded with a lead for the board. */
export const leadInclude = {
  niche: true,
  stage: true,
  salesRep: { select: salesRepSelect },
  traffer: { select: salesRepSelect },
} satisfies Prisma.LeadInclude;

export type LeadWithRelations = Prisma.LeadGetPayload<{
  include: typeof leadInclude;
}>;

/** Public projection of a user for the employees admin page. */
export const userPublicSelect = {
  id: true,
  name: true,
  username: true,
  telegram: true,
  role: true,
  active: true,
  createdAt: true,
  // leads = закреплённые как продажник (salesRepId);
  // traffedLeads = приведённые как трафер/админ-источник (trafferId).
  _count: { select: { leads: true, traffedLeads: true } },
} satisfies Prisma.UserSelect;
