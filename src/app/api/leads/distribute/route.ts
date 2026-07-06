import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/rbac";
import { NEW_STAGE } from "@/lib/constants";

// POST /api/leads/distribute
// Равномерно (Round-Robin) распределяет всех нераспределённых лидов из колонки
// «Новые» между активными продажниками. Только для администратора.
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  // Стартовая колонка «Новые».
  const newStage = await prisma.stage.findUnique({
    where: { key: NEW_STAGE },
    select: { id: true },
  });
  if (!newStage) {
    return NextResponse.json({ error: "Колонка «Новые» не найдена" }, { status: 400 });
  }

  // Активные продажники — получатели распределения.
  const reps = await prisma.user.findMany({
    where: { role: "SALES", active: true },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  if (reps.length === 0) {
    return NextResponse.json(
      { error: "Нет активных продажников для распределения" },
      { status: 400 },
    );
  }

  // Нераспределённые лиды в «Новых» (без продажника).
  const leads = await prisma.lead.findMany({
    where: { stageId: newStage.id, salesRepId: null },
    orderBy: [{ pinned: "desc" }, { position: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  if (leads.length === 0) {
    return NextResponse.json({
      distributed: 0,
      reps: reps.map((r) => ({ id: r.id, name: r.name, count: 0 })),
      message: "Нет нераспределённых лидов в колонке «Новые»",
    });
  }

  // Round-Robin: i-й лид → продажнику (i % reps.length).
  const perRep = new Map<string, number>(reps.map((r) => [r.id, 0]));
  const updates = leads.map((lead, i) => {
    const rep = reps[i % reps.length];
    perRep.set(rep.id, (perRep.get(rep.id) ?? 0) + 1);
    return prisma.lead.update({
      where: { id: lead.id },
      data: { salesRepId: rep.id },
    });
  });

  // Одной транзакцией — либо все назначения, либо ни одного.
  await prisma.$transaction(updates);

  return NextResponse.json({
    distributed: leads.length,
    reps: reps.map((r) => ({
      id: r.id,
      name: r.name,
      count: perRep.get(r.id) ?? 0,
    })),
  });
}
