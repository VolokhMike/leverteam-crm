// Добавляет тестовых продажников и траферов (upsert — не трогает существующих).
// Запуск: DATABASE_URL=... npx tsx prisma/add-test-users.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALES = [
  { name: "Игорь Соколов", username: "igor", telegram: "@igor_sales" },
  { name: "Наталья Кузнецова", username: "natalia", telegram: "@natalia_sales" },
  { name: "Павел Морозов", username: "pavel", telegram: "@pavel_sales" },
];

const TRAFFERS = [
  { name: "Костя Трафик", username: "kostya", telegram: "@kostya_t" },
  { name: "Женя Лидген", username: "zhenya", telegram: "@zhenya_t" },
  { name: "Саша Поток", username: "sasha", telegram: "@sasha_t" },
];

const SALES_PASSWORD = "sales123";
const TRAFFER_PASSWORD = "traffic123";

async function upsertUser(
  u: { name: string; username: string; telegram: string },
  role: Role,
  password: string,
) {
  await prisma.user.upsert({
    where: { username: u.username },
    update: { name: u.name, telegram: u.telegram, role, active: true },
    create: {
      name: u.name,
      username: u.username,
      telegram: u.telegram,
      role,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
}

async function main() {
  console.log("👥 Добавляю тестовых пользователей…");

  for (const s of SALES) await upsertUser(s, Role.SALES, SALES_PASSWORD);
  console.log(`  ✓ ${SALES.length} продажников (пароль: ${SALES_PASSWORD})`);
  console.log(`     ${SALES.map((s) => s.username).join(", ")}`);

  for (const t of TRAFFERS) await upsertUser(t, Role.TRAFFER, TRAFFER_PASSWORD);
  console.log(`  ✓ ${TRAFFERS.length} траферов (пароль: ${TRAFFER_PASSWORD})`);
  console.log(`     ${TRAFFERS.map((t) => t.username).join(", ")}`);

  const counts = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  console.log(
    "  Итого в системе: " +
      counts.map((c) => `${c.role}=${c._count._all}`).join(", "),
  );
  console.log("✅ Готово.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
