// Canonical seed data + UI color mapping for niches and stages.
// This file is imported both by the Prisma seed (prisma/seed.ts) and the UI.

export type SeedItem = {
  key: string;
  name: string;
  color: ColorToken;
  order: number;
};

export type ColorToken =
  | "slate"
  | "blue"
  | "indigo"
  | "violet"
  | "amber"
  | "emerald"
  | "rose"
  | "red"
  | "orange"
  | "pink"
  | "sky"
  | "fuchsia"
  | "cyan"
  | "green";

// ─── Ниши (категории) ───────────────────────────────────────
// Leverteam использует строго три ниши.
export const NICHES: SeedItem[] = [
  { key: "rko", name: "РКО", color: "emerald", order: 1 },
  { key: "neuro", name: "Нейросети", color: "violet", order: 2 },
  { key: "professions", name: "Профессии", color: "amber", order: 3 },
];

// ─── Этапы воронки (колонки доски) ──────────────────────────
export const STAGES: SeedItem[] = [
  { key: "new", name: "Новые", color: "slate", order: 1 },
  { key: "first_touch", name: "Первое касание", color: "blue", order: 2 },
  { key: "qualified", name: "Квалифицированные", color: "indigo", order: 3 },
  { key: "call_queue", name: "Очередь на созвон", color: "amber", order: 4 },
  { key: "producer", name: "В работе продюсера", color: "violet", order: 5 },
  { key: "bought", name: "Купили", color: "emerald", order: 6 },
  { key: "rejected", name: "Отказ", color: "rose", order: 7 },
];

// Stage keys used by the "quick action" buttons on the card.
export const STAGE_ORDER = STAGES.map((s) => s.key);
export const REJECTED_STAGE = "rejected";
export const BOUGHT_STAGE = "bought";

// ─── Цвета для бейджей / колонок (полные классы для Tailwind JIT) ───
export const COLOR_CLASSES: Record<
  ColorToken,
  { badge: string; dot: string; columnBar: string }
> = {
  slate: {
    badge:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
    columnBar: "bg-slate-400",
  },
  blue: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    dot: "bg-blue-500",
    columnBar: "bg-blue-500",
  },
  indigo: {
    badge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    dot: "bg-indigo-500",
    columnBar: "bg-indigo-500",
  },
  violet: {
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    dot: "bg-violet-500",
    columnBar: "bg-violet-500",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    dot: "bg-amber-500",
    columnBar: "bg-amber-500",
  },
  emerald: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    dot: "bg-emerald-500",
    columnBar: "bg-emerald-500",
  },
  rose: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    dot: "bg-rose-500",
    columnBar: "bg-rose-500",
  },
  red: {
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    dot: "bg-red-500",
    columnBar: "bg-red-500",
  },
  orange: {
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    dot: "bg-orange-500",
    columnBar: "bg-orange-500",
  },
  pink: {
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
    dot: "bg-pink-500",
    columnBar: "bg-pink-500",
  },
  sky: {
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    dot: "bg-sky-500",
    columnBar: "bg-sky-500",
  },
  fuchsia: {
    badge:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    dot: "bg-fuchsia-500",
    columnBar: "bg-fuchsia-500",
  },
  cyan: {
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    dot: "bg-cyan-500",
    columnBar: "bg-cyan-500",
  },
  green: {
    badge: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    dot: "bg-green-500",
    columnBar: "bg-green-500",
  },
};

export function colorClasses(token: string) {
  return COLOR_CLASSES[token as ColorToken] ?? COLOR_CLASSES.slate;
}
