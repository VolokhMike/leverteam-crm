import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin, leadScopeForUser } from "@/lib/rbac";
import { leadInclude } from "@/lib/queries";

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

  // Resolve stage (id, key, or default to "new").
  let stageId: string | undefined = body.stageId;
  if (!stageId) {
    const stage = await prisma.stage.findUnique({
      where: { key: body.stageKey || "new" },
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

  // Sales reps can only assign leads to themselves.
  const salesRepId = isAdmin(user)
    ? (body.salesRepId ?? null)
    : user.id;

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
      trafferName: body.trafferName || null,
      trafferUsername: body.trafferUsername || null,
      notes: body.notes || null,
      pinned: Boolean(body.pinned),
      position,
      stageId,
      nicheId,
      salesRepId,
    },
    include: leadInclude,
  });

  return NextResponse.json(lead, { status: 201 });
}
