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
  // Убираем этапы, которых больше нет (например «Холодные»): их лидов
  // переносим в стартовую колонку «Новые», затем удаляем сам этап.
  const keepStageKeys = STAGES.map((s) => s.key);
  const newStage = await prisma.stage.findUnique({ where: { key: "new" } });
  const staleStages = await prisma.stage.findMany({
    where: { key: { notIn: keepStageKeys } },
    select: { id: true },
  });
  if (staleStages.length && newStage) {
    await prisma.lead.updateMany({
      where: { stageId: { in: staleStages.map((s) => s.id) } },
      data: { stageId: newStage.id },
    });
    await prisma.stage.deleteMany({
      where: { id: { in: staleStages.map((s) => s.id) } },
    });
  }
  console.log(`  ✓ ${STAGES.length} stages (removed ${staleStages.length} stale)`);

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

  // ─── Traffers ─────────────────────────────────────────────
  const trafferSeed = [
    { name: "Дима Трафик", username: "dima", telegram: "@dima_t", password: "traffic123" },
    { name: "Оля Лидген", username: "olya", telegram: "@olya_t", password: "traffic123" },
  ];
  const traffers = [] as { id: string; name: string; username: string }[];
  for (const t of trafferSeed) {
    const u = await prisma.user.upsert({
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
    traffers.push({ id: u.id, name: u.name, username: u.username });
  }
  console.log(`  ✓ ${traffers.length} traffers (password: traffic123)`);

  // ─── Demo leads ───────────────────────────────────────────
  const niches = await prisma.niche.findMany();
  const stages = await prisma.stage.findMany();
  const nicheBy = (k: string) => niches.find((n) => n.key === k)!;
  const stageBy = (k: string) => stages.find((s) => s.key === k)!;

  // rep: 0 = Алексей, 1 = Мария, null = ещё не распределён (лежит в «Новых»).
  // traf: 0 = Дима, 1 = Оля — какой трафер привёл лида.
  const demo: Array<{
    title: string;
    username: string;
    stage: string;
    niche: string;
    rep: number | null;
    traf: number;
    pinned?: boolean;
  }> = [
    // ── Новые нераспределённые (от траферов, ждут «Распределить лидов») ──
    { title: "РКО новый №1", username: "rko_new1", stage: "new", niche: "rko", rep: null, traf: 0 },
    { title: "Нейросети новый", username: "ai_new", stage: "new", niche: "neuro", rep: null, traf: 0 },
    { title: "Профессии новый", username: "prof_new", stage: "new", niche: "professions", rep: null, traf: 1 },
    { title: "РКО новый №2", username: "rko_new2", stage: "new", niche: "rko", rep: null, traf: 1 },
    // ── В работе у продажников ──
    { title: "Расчётный счёт под ключ", username: "rko_fast", stage: "first_touch", niche: "rko", rep: 0, traf: 0, pinned: true },
    { title: "Эквайринг для магазинов", username: "rko_pay", stage: "call_queue", niche: "rko", rep: 1, traf: 1 },
    { title: "Нейро-художник", username: "ai_artist", stage: "qualified", niche: "neuro", rep: 1, traf: 0 },
    { title: "Автоматизация на нейросетях", username: "ai_automation", stage: "producer", niche: "neuro", rep: 0, traf: 0 },
    { title: "Промпт-инженер", username: "prompt_pro", stage: "bought", niche: "neuro", rep: 1, traf: 1 },
    { title: "Обучение профессиям", username: "prof_school", stage: "rejected", niche: "professions", rep: 0, traf: 1 },
    { title: "Профессия аналитик данных", username: "prof_data", stage: "qualified", niche: "professions", rep: 1, traf: 0 },
    { title: "РКО для самозанятых", username: "rko_self", stage: "call_queue", niche: "rko", rep: 0, traf: 1 },
  ];

  // Clean previous demo leads to keep seed idempotent-ish.
  await prisma.lead.deleteMany({});

  let pos = 0;
  for (const d of demo) {
    const traf = traffers[d.traf];
    await prisma.lead.create({
      data: {
        title: d.title,
        username: d.username,
        telegramLink: `https://t.me/${d.username}`,
        trafferName: traf.name,
        trafferUsername: `@${traf.username}`,
        pinned: d.pinned ?? false,
        position: (pos += 1000),
        nicheId: nicheBy(d.niche).id,
        stageId: stageBy(d.stage).id,
        salesRepId: d.rep === null ? null : sales[d.rep].id,
        trafferId: traf.id,
      },
    });
  }
  console.log(`  ✓ ${demo.length} demo leads`);

  console.log("✅ Seed complete.");
  console.log(`\n   Login as admin:   ${adminUsername} / ${adminPassword}`);
  console.log(`   Login as sales:   alex / sales123  (or maria / sales123)`);
  console.log(`   Login as traffer: dima / traffic123 (or olya / traffic123)\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
