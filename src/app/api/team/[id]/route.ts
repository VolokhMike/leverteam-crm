import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/rbac";
import { leadInclude } from "@/lib/queries";
import { trafferStatsFrom, salesStatsFrom } from "@/lib/stats";
import type { TeamMemberDetail } from "@/lib/types";

type Ctx = { params: { id: string } };

// GET /api/team/:id — профиль сотрудника с индивидуальной статистикой.
// Только для администратора.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const profile = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      username: true,
      telegram: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
  if (!profile) {
    return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });
  }

  const isTrafferProfile = profile.role === "TRAFFER";
  // Лиды, относящиеся к сотруднику: приведённые (трафер) или закреплённые (продажник).
  const leadWhere = isTrafferProfile
    ? { trafferId: profile.id }
    : { salesRepId: profile.id };

  const [stages, grouped, recentLeads] = await Promise.all([
    prisma.stage.findMany({ orderBy: { order: "asc" } }),
    prisma.lead.groupBy({
      by: ["stageId"],
      where: leadWhere,
      _count: { _all: true },
    }),
    prisma.lead.findMany({
      where: leadWhere,
      include: leadInclude,
      orderBy: [{ updatedAt: "desc" }],
      take: 25,
    }),
  ]);

  const stageKeyById = new Map(stages.map((s) => [s.id, s.key]));
  const byStage: Record<string, number> = {};
  for (const s of stages) byStage[s.key] = 0;
  for (const g of grouped) {
    const key = stageKeyById.get(g.stageId);
    if (key) byStage[key] = g._count._all;
  }

  const detail: TeamMemberDetail = {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    _count: { leads: recentLeads.length },
    byStage,
    recentLeads: recentLeads as unknown as TeamMemberDetail["recentLeads"],
    ...(isTrafferProfile
      ? { traffer: trafferStatsFrom(byStage) }
      : { sales: salesStatsFrom(byStage) }),
  };
  // total leads = сумма по этапам (recentLeads ограничен 25).
  detail._count.leads = Object.values(byStage).reduce((a, b) => a + b, 0);

  return NextResponse.json(detail);
}
