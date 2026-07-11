import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/rbac";
import { userPublicSelect } from "@/lib/queries";
import { apiHandler } from "@/lib/api";

// GET /api/users?role=SALES  — admin only
export const GET = apiHandler(async (req: NextRequest) => {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const roleParam = new URL(req.url).searchParams.get("role");
  const where: Prisma.UserWhereInput = {};
  if (roleParam === "SALES" || roleParam === "ADMIN") where.role = roleParam as Role;

  const users = await prisma.user.findMany({
    where,
    select: userPublicSelect,
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  // Счётчик «Лиды» зависит от роли:
  //  - продажник → закреплённые за ним лиды (salesRepId);
  //  - трафер/админ → приведённые им лиды (trafferId).
  const shaped = users.map((u) => {
    const c = u._count as { leads: number; traffedLeads: number };
    const leads = u.role === "SALES" ? c.leads : c.traffedLeads;
    return { ...u, _count: { leads } };
  });
  return NextResponse.json(shaped);
});

// POST /api/users  — create employee (admin only)
export const POST = apiHandler(async (req: NextRequest) => {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const username = body?.username?.trim();
  const password = body?.password;
  const role: Role =
    body?.role === "ADMIN"
      ? Role.ADMIN
      : body?.role === "TRAFFER"
        ? Role.TRAFFER
        : Role.SALES;

  if (!name || !username || !password) {
    return NextResponse.json(
      { error: "Имя, логин и пароль обязательны" },
      { status: 400 },
    );
  }
  if (String(password).length < 4) {
    return NextResponse.json({ error: "Пароль слишком короткий" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return NextResponse.json({ error: "Логин уже занят" }, { status: 409 });
  }

  const created = await prisma.user.create({
    data: {
      name,
      username,
      telegram: body?.telegram?.trim() || null,
      role,
      passwordHash: await bcrypt.hash(String(password), 10),
    },
    select: userPublicSelect,
  });

  return NextResponse.json(created, { status: 201 });
});
