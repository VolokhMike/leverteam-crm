import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin, isTraffer, canAccessLead } from "@/lib/rbac";
import { leadInclude } from "@/lib/queries";

type Ctx = { params: { id: string } };

async function loadAndAuthorize(id: string) {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { id: true, salesRepId: true, trafferId: true },
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

  // Трафер видит своих лидов, но не может их редактировать.
  if (isTraffer(user!)) {
    return NextResponse.json(
      { error: "Трафер не может изменять лидов" },
      { status: 403 },
    );
  }

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

  if (isTraffer(auth.user!)) {
    return NextResponse.json(
      { error: "Трафер не может удалять лидов" },
      { status: 403 },
    );
  }

  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
