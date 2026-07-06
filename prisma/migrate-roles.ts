// Одноразовая НЕразрушающая миграция под новую систему ролей.
// - синхронизирует этапы (STAGES), переносит лидов из удалённых этапов («Холодные») в «Новые»;
// - удаляет устаревшие этапы;
// - заводит демо-траферов (upsert, без удаления существующих данных).
// Запуск: DATABASE_URL=... npx tsx prisma/migrate-roles.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { STAGES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Миграция ролей/этапов (без удаления лидов)…");

  // 1. Синхронизируем этапы.
  for (const s of STAGES) {
    await prisma.stage.upsert({
      where: { key: s.key },
      update: { name: s.name, color: s.color, order: s.order },
      create: s,
    });
  }

  // 2. Переносим лидов из устаревших этапов в «Новые», затем удаляем этапы.
  const keep = STAGES.map((s) => s.key);
  const newStage = await prisma.stage.findUnique({ where: { key: "new" } });
  const stale = await prisma.stage.findMany({
    where: { key: { notIn: keep } },
    select: { id: true, key: true },
  });
  if (stale.length && newStage) {
    const moved = await prisma.lead.updateMany({
      where: { stageId: { in: stale.map((s) => s.id) } },
      data: { stageId: newStage.id },
    });
    await prisma.stage.deleteMany({
      where: { id: { in: stale.map((s) => s.id) } },
    });
    console.log(
      `  ✓ перенесено лидов: ${moved.count}; удалено этапов: ${stale.map((s) => s.key).join(", ")}`,
    );
  } else {
    console.log("  ✓ устаревших этапов нет");
  }

  // 3. Демо-траферы (upsert).
  const trafferSeed = [
    { name: "Дима Трафик", username: "dima", telegram: "@dima_t", password: "traffic123" },
    { name: "Оля Лидген", username: "olya", telegram: "@olya_t", password: "traffic123" },
  ];
  for (const t of trafferSeed) {
    await prisma.user.upsert({
      where: { username: t.username },
      update: { name: t.name, telegram: t.telegram, role: Role.TRAFFER, active: true },
      create: {
        name: t.name,
        username: t.username,
        telegram: t.telegram,
        role: Role.TRAFFER,
        passwordHash: await bcrypt.hash(t.password, 10),
      },
    });
  }
  console.log(`  ✓ ${trafferSeed.length} трафера (пароль: traffic123)`);

  console.log("✅ Миграция завершена.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
