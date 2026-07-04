import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/rbac";
import { userPublicSelect, leadInclude } from "@/lib/queries";

type Ctx = { params: { id: string } };

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isAdmin(user)) return { error: NextResponse.json({ error: "Доступ запрещён" }, { status: 403 }) };
  return { user };
}

// GET /api/users/:id — profile + assigned leads (admin only)
export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const profile = await prisma.user.findUnique({
    where: { id: params.id },
    select: userPublicSelect,
  });
  if (!profile) return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });

  const leads = await prisma.lead.findMany({
    where: { salesRepId: params.id },
    include: leadInclude,
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ ...profile, leads });
}

// PATCH /api/users/:id — update name/telegram/role/active/password (admin only)
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const body = await req.json().catch(() => ({}));
  const data: Prisma.UserUpdateInput = {};

  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if ("telegram" in body) data.telegram = body.telegram?.trim() || null;
  if (body.role === "ADMIN" || body.role === "SALES") data.role = body.role as Role;
  if ("active" in body) data.active = Boolean(body.active);
  if (body.password) {
    if (String(body.password).length < 4) {
      return NextResponse.json({ error: "Пароль слишком короткий" }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(String(body.password), 10);
  }

  // Prevent an admin from demoting/deactivating themselves out of access.
  if (params.id === user!.id && (data.role === "SALES" || data.active === false)) {
    return NextResponse.json(
      { error: "Нельзя понизить или деактивировать самого себя" },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: userPublicSelect,
  });
  return NextResponse.json(updated);
}

// DELETE /api/users/:id — remove employee (admin only)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  if (params.id === user!.id) {
    return NextResponse.json({ error: "Нельзя удалить самого себя" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { role: true },
  });
  if (!target) return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });

  // Never allow deleting the last remaining admin.
  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) {
      return NextResponse.json(
        { error: "Нельзя удалить последнего администратора" },
        { status: 400 },
      );
    }
  }

  // Leads keep existing; their salesRepId is set NULL (onDelete: SetNull).
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
