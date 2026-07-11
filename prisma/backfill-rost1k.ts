// Разовый бэкфилл: привязывает лиды без трафера (trafferId = null) к админу Rost1k.
// Запуск (dry-run):   DATABASE_URL=... npx tsx prisma/backfill-rost1k.ts
// Запуск (применить): DATABASE_URL=... npx tsx prisma/backfill-rost1k.ts --apply
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

async function main() {
  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      username: { equals: "Rost1k", mode: "insensitive" },
    },
    select: { id: true, name: true, username: true },
  });

  if (!admin) {
    console.error("❌ Админ с логином Rost1k не найден.");
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { username: true, name: true },
    });
    console.error("   Есть админы:", admins.map((a) => a.username).join(", "));
    process.exit(1);
  }

  const orphan = await prisma.lead.count({ where: { trafferId: null } });
  console.log(`👤 Rost1k: ${admin.name} (@${admin.username}) id=${admin.id}`);
  console.log(`📊 Лидов без трафера (trafferId = null): ${orphan}`);

  if (!APPLY) {
    console.log("\n(dry-run) Ничего не изменено. Для применения добавь --apply");
    return;
  }

  const res = await prisma.lead.updateMany({
    where: { trafferId: null },
    data: {
      trafferId: admin.id,
      trafferName: admin.name,
      trafferUsername: `@${admin.username}`,
    },
  });
  console.log(`✅ Привязано к Rost1k: ${res.count} лид(ов).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
