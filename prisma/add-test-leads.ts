// Добавляет тестовых лидов от траферов (идемпотентно: все лиды с префиксом
// [test] сначала удаляются, затем создаются заново).
// Запуск: DATABASE_URL=... npx tsx prisma/add-test-leads.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PREFIX = "[test]";

async function main() {
  console.log("🌱 Добавляю тестовых лидов от траферов…");

  const [niches, stages, traffers, sales] = await Promise.all([
    prisma.niche.findMany(),
    prisma.stage.findMany(),
    prisma.user.findMany({ where: { role: "TRAFFER", active: true }, orderBy: { createdAt: "asc" } }),
    prisma.user.findMany({ where: { role: "SALES", active: true }, orderBy: { createdAt: "asc" } }),
  ]);

  if (traffers.length === 0) throw new Error("Нет траферов");
  if (sales.length === 0) throw new Error("Нет продажников");

  const nicheBy = (k: string) => niches.find((n) => n.key === k)!;
  const stageBy = (k: string) => stages.find((s) => s.key === k)!;
  const nicheKeys = ["rko", "neuro", "professions"];

  // stage: если salesRep нужен — распределён, иначе нераспределённый в «Новых».
  // Раскладка подобрана так, чтобы у траферов были разные конверсии.
  const plan: Array<{ stage: string; assigned: boolean }> = [
    // Нераспределённые в «Новые» (для кнопки «Распределить лидов»)
    ...Array.from({ length: 14 }, () => ({ stage: "new", assigned: false })),
    // Уже в работе / закрытые (для статистики)
    { stage: "first_touch", assigned: true },
    { stage: "first_touch", assigned: true },
    { stage: "qualified", assigned: true },
    { stage: "qualified", assigned: true },
    { stage: "qualified", assigned: true },
    { stage: "call_queue", assigned: true },
    { stage: "call_queue", assigned: true },
    { stage: "producer", assigned: true },
    { stage: "producer", assigned: true },
    { stage: "bought", assigned: true },
    { stage: "bought", assigned: true },
    { stage: "bought", assigned: true },
    { stage: "rejected", assigned: true },
    { stage: "rejected", assigned: true },
    { stage: "rejected", assigned: true },
    { stage: "rejected", assigned: true },
  ];

  // Удаляем предыдущие тестовые лиды.
  const del = await prisma.lead.deleteMany({ where: { title: { startsWith: PREFIX } } });
  if (del.count) console.log(`  ✓ удалено старых тестовых лидов: ${del.count}`);

  let pos = 100000; // высокий базовый position, чтобы не мешать реальным лидам
  let i = 0;
  const perStage = new Map<string, number>();

  for (const item of plan) {
    const traffer = traffers[i % traffers.length];
    const salesRep = item.assigned ? sales[i % sales.length] : null;
    const nicheKey = nicheKeys[i % nicheKeys.length];
    const uname = `test_${nicheKey}_${i + 1}`;

    await prisma.lead.create({
      data: {
        title: `${PREFIX} ${nicheBy(nicheKey).name} лид №${i + 1}`,
        username: uname,
        telegramLink: `https://t.me/${uname}`,
        trafferName: traffer.name,
        trafferUsername: `@${traffer.username}`,
        notes: "Тестовый лид",
        position: (pos += 100),
        nicheId: nicheBy(nicheKey).id,
        stageId: stageBy(item.stage).id,
        salesRepId: salesRep?.id ?? null,
        trafferId: traffer.id,
      },
    });

    perStage.set(item.stage, (perStage.get(item.stage) ?? 0) + 1);
    i++;
  }

  console.log(`  ✓ создано лидов: ${plan.length}`);
  console.log(
    "    по этапам: " +
      [...perStage.entries()].map(([k, v]) => `${k}=${v}`).join(", "),
  );
  console.log(
    `    траферы: ${traffers.map((t) => t.username).join(", ")}`,
  );
  const unassigned = plan.filter((p) => !p.assigned).length;
  console.log(`    нераспределённых в «Новые»: ${unassigned} (для кнопки «Распределить»)`);
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
