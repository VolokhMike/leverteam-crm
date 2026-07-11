import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/rbac";
import { userPublicSelect, leadInclude } from "@/lib/queries";
import { apiHandler } from "@/lib/api";

type Ctx = { params: { id: string } };

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isAdmin(user)) return { error: NextResponse.json({ error: "Доступ запрещён" }, { status: 403 }) };
  return { user };
}

// GET /api/users/:id — profile + assigned leads (admin only)
export const GET = apiHandler(async (_req: NextRequest, { params }: Ctx) => {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const profile = await prisma.user.findUnique({
    where: { id: params.id },
    select: userPublicSelect,
  });
  if (!profile) return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });

  // Релевантные лиды зависят от роли: продажник → закреплённые (salesRepId),
  // трафер/админ → приведённые им (trafferId).
  const leadWhere =
    profile.role === "SALES"
      ? { salesRepId: params.id }
      : { trafferId: params.id };

  const leads = await prisma.lead.findMany({
    where: leadWhere,
    include: leadInclude,
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  const c = profile._count as { leads: number; traffedLeads: number };
  const leadCount = profile.role === "SALES" ? c.leads : c.traffedLeads;

  return NextResponse.json({
    ...profile,
    _count: { leads: leadCount },
    leads,
  });
});

// PATCH /api/users/:id — update name/telegram/role/active/password (admin only)
export const PATCH = apiHandler(async (req: NextRequest, { params }: Ctx) => {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const body = await req.json().catch(() => ({}));
  const data: Prisma.UserUpdateInput = {};

  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if ("telegram" in body) data.telegram = body.telegram?.trim() || null;
  if (body.role === "ADMIN" || body.role === "SALES" || body.role === "TRAFFER")
    data.role = body.role as Role;

  // Смена логина: проверяем длину и уникальность (исключая самого пользователя).
  if (typeof body.username === "string" && body.username.trim()) {
    const username = body.username.trim();
    if (username.length < 3) {
      return NextResponse.json(
        { error: "Логин слишком короткий (минимум 3 символа)" },
        { status: 400 },
      );
    }
    const taken = await prisma.user.findFirst({
      where: { username, id: { not: params.id } },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json({ error: "Логин уже занят" }, { status: 409 });
    }
    data.username = username;
  }
  if ("active" in body) data.active = Boolean(body.active);
  if (body.password) {
    if (String(body.password).length < 4) {
      return NextResponse.json({ error: "Пароль слишком короткий" }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(String(body.password), 10);
  }

  // Prevent an admin from demoting/deactivating themselves out of access.
  if (
    params.id === user!.id &&
    ((data.role && data.role !== "ADMIN") || data.active === false)
  ) {
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
});

// DELETE /api/users/:id — remove employee (admin only)
export const DELETE = apiHandler(async (_req: NextRequest, { params }: Ctx) => {
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
});
