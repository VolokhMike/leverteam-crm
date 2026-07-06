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
// «Новые» — стартовая колонка: сюда попадают лиды, которых заносят траферы
// (без закреплённого продажника). Админ распределяет их между продажниками
// кнопкой «Распределить лидов».
export const STAGES: SeedItem[] = [
  { key: "new", name: "Новые", color: "slate", order: 1 },
  { key: "first_touch", name: "Первое касание", color: "blue", order: 2 },
  { key: "qualified", name: "Квалифицированные", color: "indigo", order: 3 },
  { key: "call_queue", name: "Очередь на созвон", color: "amber", order: 4 },
  { key: "producer", name: "В работе", color: "violet", order: 5 },
  { key: "bought", name: "Купили", color: "emerald", order: 6 },
  { key: "rejected", name: "Отказ", color: "rose", order: 7 },
];

// Stage keys used by the "quick action" buttons on the card.
export const STAGE_ORDER = STAGES.map((s) => s.key);
export const NEW_STAGE = "new";
export const QUALIFIED_STAGE = "qualified";
export const REJECTED_STAGE = "rejected";
export const BOUGHT_STAGE = "bought";

// ─── Цвета для бейджей / колонок (полные классы для Tailwind JIT) ───
// Минималистичный стиль тега Leverteam: цветной текст на очень светлом фоне
// с тонкой рамкой того же оттенка.
export const COLOR_CLASSES: Record<
  ColorToken,
  { badge: string; dot: string; columnBar: string }
> = {
  slate: {
    badge:
      "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
    dot: "bg-slate-400",
    columnBar: "bg-slate-400",
  },
  blue: {
    badge:
      "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
    dot: "bg-blue-500",
    columnBar: "bg-blue-500",
  },
  indigo: {
    badge:
      "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900",
    dot: "bg-indigo-500",
    columnBar: "bg-indigo-500",
  },
  violet: {
    badge:
      "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
    dot: "bg-violet-500",
    columnBar: "bg-violet-500",
  },
  amber: {
    badge:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    dot: "bg-amber-500",
    columnBar: "bg-amber-500",
  },
  emerald: {
    badge:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
    dot: "bg-emerald-500",
    columnBar: "bg-emerald-500",
  },
  rose: {
    badge:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
    dot: "bg-rose-500",
    columnBar: "bg-rose-500",
  },
  red: {
    badge:
      "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
    dot: "bg-red-500",
    columnBar: "bg-red-500",
  },
  orange: {
    badge:
      "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900",
    dot: "bg-orange-500",
    columnBar: "bg-orange-500",
  },
  pink: {
    badge:
      "bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-900",
    dot: "bg-pink-500",
    columnBar: "bg-pink-500",
  },
  sky: {
    badge:
      "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
    dot: "bg-sky-500",
    columnBar: "bg-sky-500",
  },
  fuchsia: {
    badge:
      "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-300 dark:border-fuchsia-900",
    dot: "bg-fuchsia-500",
    columnBar: "bg-fuchsia-500",
  },
  cyan: {
    badge:
      "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-900",
    dot: "bg-cyan-500",
    columnBar: "bg-cyan-500",
  },
  green: {
    badge:
      "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
    dot: "bg-green-500",
    columnBar: "bg-green-500",
  },
};

export function colorClasses(token: string) {
  return COLOR_CLASSES[token as ColorToken] ?? COLOR_CLASSES.slate;
}

// ─── Роли ────────────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Администратор",
  SALES: "Продажник",
  TRAFFER: "Трафер",
};

export const ROLE_BADGE_COLORS: Record<string, ColorToken> = {
  ADMIN: "violet",
  SALES: "sky",
  TRAFFER: "orange",
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
