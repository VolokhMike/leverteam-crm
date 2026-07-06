import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getSessionUser,
  isAdmin,
  isTraffer,
  leadScopeForUser,
} from "@/lib/rbac";
import { leadInclude } from "@/lib/queries";
import { NEW_STAGE } from "@/lib/constants";

// GET /api/leads?search=&niche=&stage=
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const niche = searchParams.get("niche")?.trim(); // niche key
  const stage = searchParams.get("stage")?.trim(); // stage key

  const where: Prisma.LeadWhereInput = { ...leadScopeForUser(user) };

  if (niche) where.niche = { key: niche };
  if (stage) where.stage = { key: stage };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { telegramLink: { contains: search, mode: "insensitive" } },
      { trafferName: { contains: search, mode: "insensitive" } },
      { trafferUsername: { contains: search, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: leadInclude,
    orderBy: [{ pinned: "desc" }, { position: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(leads);
}

// POST /api/leads
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Заголовок обязателен" }, { status: 400 });
  }

  const traffer = isTraffer(user);

  // Трафер всегда создаёт лида в стартовой колонке «Новые».
  // Остальные могут указать этап (id, key), по умолчанию — «Новые».
  let stageId: string | undefined = traffer ? undefined : body.stageId;
  if (!stageId) {
    const stage = await prisma.stage.findUnique({
      where: { key: traffer ? NEW_STAGE : body.stageKey || NEW_STAGE },
    });
    stageId = stage?.id;
  }
  if (!stageId) {
    return NextResponse.json({ error: "Этап не найден" }, { status: 400 });
  }

  // Resolve niche (id or key), optional.
  let nicheId: string | null = body.nicheId ?? null;
  if (!nicheId && body.nicheKey) {
    const niche = await prisma.niche.findUnique({ where: { key: body.nicheKey } });
    nicheId = niche?.id ?? null;
  }

  // Кто закреплён продажником:
  //  - трафер: никто (лид нераспределён, ждёт «Распределить лидов»);
  //  - продажник: только сам себе;
  //  - админ: как указано.
  const salesRepId = traffer
    ? null
    : isAdmin(user)
      ? body.salesRepId ?? null
      : user.id;

  // Кто трафер (привёл лида):
  //  - трафер: он сам (автоматически);
  //  - админ: как указано (опционально);
  //  - продажник: как указано (обычно не заполняется).
  const trafferId = traffer ? user.id : body.trafferId ?? null;

  // Для отображения в карточке сохраняем и текстовые поля трафера.
  const trafferName = traffer
    ? user.name ?? user.username
    : body.trafferName || null;
  const trafferUsername = traffer
    ? `@${user.username}`
    : body.trafferUsername || null;

  // Place at the bottom of the target column.
  const last = await prisma.lead.findFirst({
    where: { stageId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1000;

  const lead = await prisma.lead.create({
    data: {
      title: body.title.trim(),
      telegramLink: body.telegramLink || null,
      username: body.username || null,
      trafferName,
      trafferUsername,
      notes: body.notes || null,
      pinned: Boolean(body.pinned),
      position,
      stageId,
      nicheId,
      salesRepId,
      trafferId,
    },
    include: leadInclude,
  });

  return NextResponse.json(lead, { status: 201 });
}
