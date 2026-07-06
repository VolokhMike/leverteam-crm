import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/rbac";
import { trafferStatsFrom, salesStatsFrom } from "@/lib/stats";
import type { TeamMember } from "@/lib/types";

// GET /api/team — списки траферов и продажников с агрегированной статистикой.
// Только для администратора.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const [stages, users, byTraffer, bySales] = await Promise.all([
    prisma.stage.findMany({ select: { id: true, key: true } }),
    prisma.user.findMany({
      where: { role: { in: ["SALES", "TRAFFER"] } },
      select: {
        id: true,
        name: true,
        username: true,
        telegram: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    }),
    prisma.lead.groupBy({
      by: ["trafferId", "stageId"],
      where: { trafferId: { not: null } },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ["salesRepId", "stageId"],
      where: { salesRepId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const stageKeyById = new Map(stages.map((s) => [s.id, s.key]));

  // Свести строки groupBy в карту { stageKey -> count }.
  const build = (rows: { _count: { _all: number }; stageId: string }[]) => {
    const map: Record<string, number> = {};
    for (const r of rows) {
      const key = stageKeyById.get(r.stageId);
      if (key) map[key] = (map[key] ?? 0) + r._count._all;
    }
    return map;
  };

  const trafferByUser = new Map<string, typeof byTraffer>();
  for (const r of byTraffer) {
    if (!r.trafferId) continue;
    const arr = trafferByUser.get(r.trafferId) ?? [];
    arr.push(r);
    trafferByUser.set(r.trafferId, arr);
  }
  const salesByUser = new Map<string, typeof bySales>();
  for (const r of bySales) {
    if (!r.salesRepId) continue;
    const arr = salesByUser.get(r.salesRepId) ?? [];
    arr.push(r);
    salesByUser.set(r.salesRepId, arr);
  }

  const members: TeamMember[] = users.map((u) => {
    if (u.role === "TRAFFER") {
      const byStage = build(trafferByUser.get(u.id) ?? []);
      const stats = trafferStatsFrom(byStage);
      return {
        ...u,
        createdAt: u.createdAt.toISOString(),
        _count: { leads: stats.totalLeads },
        traffer: stats,
      };
    }
    const byStage = build(salesByUser.get(u.id) ?? []);
    const stats = salesStatsFrom(byStage);
    return {
      ...u,
      createdAt: u.createdAt.toISOString(),
      _count: { leads: stats.totalLeads },
      sales: stats,
    };
  });

  return NextResponse.json({
    traffers: members.filter((m) => m.role === "TRAFFER"),
    sales: members.filter((m) => m.role === "SALES"),
  });
}
