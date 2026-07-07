import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/rbac";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async () => {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stages = await prisma.stage.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(stages);
});
