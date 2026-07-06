import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NICHES, STAGES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Niches ───────────────────────────────────────────────
  for (const n of NICHES) {
    await prisma.niche.upsert({
      where: { key: n.key },
      update: { name: n.name, color: n.color, order: n.order },
      create: n,
    });
  }
  // Удаляем ниши, которых больше нет в списке (лиды получат nicheId = null).
  const keepKeys = NICHES.map((n) => n.key);
  const removed = await prisma.niche.deleteMany({
    where: { key: { notIn: keepKeys } },
  });
  console.log(`  ✓ ${NICHES.length} niches (removed ${removed.count} stale)`);

  // ─── Stages ───────────────────────────────────────────────
  for (const s of STAGES) {
    await prisma.stage.upsert({
      where: { key: s.key },
      update: { name: s.name, color: s.color, order: s.order },
      create: s,
    });
  }
  console.log(`  ✓ ${STAGES.length} stages`);

  // ─── Administrator "Роман" ────────────────────────────────
  const adminName = process.env.ADMIN_NAME || "Роман";
  const adminUsername = process.env.ADMIN_USERNAME || "roman";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: { name: adminName, role: Role.ADMIN, active: true },
    create: {
      name: adminName,
      username: adminUsername,
      telegram: "@roman_lever",
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });
  console.log(`  ✓ admin: ${adminUsername} / ${adminPassword}`);

  // ─── Sales reps ───────────────────────────────────────────
  const salesSeed = [
    { name: "Алексей Петров", username: "alex", telegram: "@alex_sales", password: "sales123" },
    { name: "Мария Иванова", username: "maria", telegram: "@maria_sales", password: "sales123" },
  ];
  const sales = [] as { id: string; name: string; telegram: string | null }[];
  for (const s of salesSeed) {
    const u = await prisma.user.upsert({
      where: { username: s.username },
      update: { name: s.name, telegram: s.telegram, role: Role.SALES, active: true },
      create: {
        name: s.name,
        username: s.username,
        telegram: s.telegram,
        role: Role.SALES,
        passwordHash: await bcrypt.hash(s.password, 10),
      },
    });
    sales.push({ id: u.id, name: u.name, telegram: u.telegram });
  }
  console.log(`  ✓ ${sales.length} sales reps (password: sales123)`);

  // ─── Demo leads ───────────────────────────────────────────
  const niches = await prisma.niche.findMany();
  const stages = await prisma.stage.findMany();
  const nicheBy = (k: string) => niches.find((n) => n.key === k)!;
  const stageBy = (k: string) => stages.find((s) => s.key === k)!;

  // rep: 0 = Алексей, 1 = Мария, null = не назначен (сырой лид в «Холодных»).
  const demo: Array<{
    title: string;
    username: string;
    stage: string;
    niche: string;
    rep: number | null;
    traffer: string;
    trafferU: string;
    pinned?: boolean;
  }> = [
    // ── Холодные (сырые лиды от траферов, без продажника) ──
    { title: "РКО холодный №1", username: "rko_cold1", stage: "cold", niche: "rko", rep: null, traffer: "Петя", trafferU: "@petya_t" },
    { title: "Нейросети холодный", username: "ai_cold", stage: "cold", niche: "neuro", rep: null, traffer: "Дима", trafferU: "@dima_t" },
    { title: "Профессии холодный", username: "prof_cold", stage: "cold", niche: "professions", rep: null, traffer: "Оля", trafferU: "@olya_t" },
    { title: "РКО холодный №2", username: "rko_cold2", stage: "cold", niche: "rko", rep: null, traffer: "Костя", trafferU: "@kostya_t" },
    // ── В работе у продажников ──
    { title: "Расчётный счёт под ключ", username: "rko_fast", stage: "first_touch", niche: "rko", rep: 0, traffer: "Дима", trafferU: "@dima_t", pinned: true },
    { title: "Эквайринг для магазинов", username: "rko_pay", stage: "call_queue", niche: "rko", rep: 1, traffer: "Оля", trafferU: "@olya_t" },
    { title: "Нейро-художник", username: "ai_artist", stage: "qualified", niche: "neuro", rep: 1, traffer: "Костя", trafferU: "@kostya_t" },
    { title: "Автоматизация на нейросетях", username: "ai_automation", stage: "producer", niche: "neuro", rep: 0, traffer: "Саша", trafferU: "@sasha_t" },
    { title: "Промпт-инженер", username: "prompt_pro", stage: "bought", niche: "neuro", rep: 1, traffer: "Ника", trafferU: "@nika_t" },
    { title: "Обучение профессиям", username: "prof_school", stage: "rejected", niche: "professions", rep: 0, traffer: "Ваня", trafferU: "@vanya_t" },
    { title: "Профессия аналитик данных", username: "prof_data", stage: "new", niche: "professions", rep: 1, traffer: "Лена", trafferU: "@lena_t" },
    { title: "РКО для самозанятых", username: "rko_self", stage: "call_queue", niche: "rko", rep: 0, traffer: "Женя", trafferU: "@zhenya_t" },
  ];

  // Clean previous demo leads to keep seed idempotent-ish.
  await prisma.lead.deleteMany({});

  let pos = 0;
  for (const d of demo) {
    await prisma.lead.create({
      data: {
        title: d.title,
        username: d.username,
        telegramLink: `https://t.me/${d.username}`,
        trafferName: d.traffer,
        trafferUsername: d.trafferU,
        pinned: d.pinned ?? false,
        position: (pos += 1000),
        nicheId: nicheBy(d.niche).id,
        stageId: stageBy(d.stage).id,
        salesRepId: d.rep === null ? null : sales[d.rep].id,
      },
    });
  }
  console.log(`  ✓ ${demo.length} demo leads`);

  console.log("✅ Seed complete.");
  console.log(`\n   Login as admin:  ${adminUsername} / ${adminPassword}`);
  console.log(`   Login as sales:  alex / sales123  (or maria / sales123)\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
