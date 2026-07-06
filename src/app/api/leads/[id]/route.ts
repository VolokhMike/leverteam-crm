import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin, canAccessLead } from "@/lib/rbac";
import { leadInclude } from "@/lib/queries";
import { COLD_STAGE } from "@/lib/constants";

type Ctx = { params: { id: string } };

async function loadAndAuthorize(id: string) {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { id: true, salesRepId: true },
  });
  if (!lead) return { error: NextResponse.json({ error: "Лид не найден" }, { status: 404 }) };
  if (!canAccessLead(user, lead)) {
    return { error: NextResponse.json({ error: "Доступ запрещён" }, { status: 403 }) };
  }
  return { user, lead };
}

// GET /api/leads/:id
export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await loadAndAuthorize(params.id);
  if (auth.error) return auth.error;

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: leadInclude,
  });
  return NextResponse.json(lead);
}

// PATCH /api/leads/:id  — update fields, move stage, pin, reassign
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await loadAndAuthorize(params.id);
  if (auth.error) return auth.error;
  const { user } = auth;

  const body = await req.json().catch(() => ({}));
  const data: Prisma.LeadUpdateInput = {};

  const stringFields = [
    "title",
    "telegramLink",
    "username",
    "trafferName",
    "trafferUsername",
    "notes",
  ] as const;
  for (const f of stringFields) {
    if (f in body) {
      const v = body[f];
      (data as any)[f] = v === "" ? null : v;
    }
  }

  if ("pinned" in body) data.pinned = Boolean(body.pinned);
  if ("position" in body && typeof body.position === "number") {
    data.position = body.position;
  }

  // Stage move (by id or key)
  if (body.stageId) {
    data.stage = { connect: { id: body.stageId } };
  } else if (body.stageKey) {
    data.stage = { connect: { key: body.stageKey } };
  }

  // Niche (by id or key; empty string / null clears it)
  if ("nicheId" in body) {
    data.niche = body.nicheId
      ? { connect: { id: body.nicheId } }
      : { disconnect: true };
  } else if ("nicheKey" in body) {
    data.niche = body.nicheKey
      ? { connect: { key: body.nicheKey } }
      : { disconnect: true };
  }

  // Only admins may reassign the sales rep.
  if ("salesRepId" in body && isAdmin(user!)) {
    data.salesRep = body.salesRepId
      ? { connect: { id: body.salesRepId } }
      : { disconnect: true };
  }

  // «Взятие в работу»: продажник, работая с неназначенным лидом,
  // автоматически закрепляет его за собой — когда перетаскивает карточку
  // из «Холодных» в другую колонку или жмёт «Взять себе» (takeOwnership).
  if (!isAdmin(user!) && auth.lead.salesRepId === null) {
    let targetStageKey: string | null = body.stageKey ?? null;
    if (!targetStageKey && body.stageId) {
      const st = await prisma.stage.findUnique({
        where: { id: body.stageId },
        select: { key: true },
      });
      targetStageKey = st?.key ?? null;
    }
    const movingOutOfCold =
      targetStageKey !== null && targetStageKey !== COLD_STAGE;
    if (body.takeOwnership === true || movingOutOfCold) {
      data.salesRep = { connect: { id: user!.id } };
    }
  }

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data,
    include: leadInclude,
  });

  return NextResponse.json(lead);
}

// DELETE /api/leads/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await loadAndAuthorize(params.id);
  if (auth.error) return auth.error;

  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
