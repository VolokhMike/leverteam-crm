import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, leadScopeForUser } from "@/lib/rbac";

// GET /api/metrics — headline counters + per-stage breakdown (role-scoped)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scope = leadScopeForUser(user);

  const [stages, grouped, total] = await Promise.all([
    prisma.stage.findMany({ orderBy: { order: "asc" } }),
    prisma.lead.groupBy({
      by: ["stageId"],
      where: scope,
      _count: { _all: true },
    }),
    prisma.lead.count({ where: scope }),
  ]);

  const countByStageId = new Map(grouped.map((g) => [g.stageId, g._count._all]));
  const byStage: Record<string, number> = {};
  for (const s of stages) byStage[s.key] = countByStageId.get(s.id) ?? 0;

  return NextResponse.json({
    total,                                // Всего экспертов
    inWork: byStage["producer"] ?? 0,     // В работе (продюсера)
    inQueue: byStage["call_queue"] ?? 0,  // В очереди на созвон
    bought: byStage["bought"] ?? 0,       // Купили
    byStage,
  });
}
