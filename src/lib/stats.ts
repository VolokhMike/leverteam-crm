// Расчёт статистики трафера/продажника по распределению их лидов на этапах.
import {
  STAGES,
  QUALIFIED_STAGE,
  BOUGHT_STAGE,
  REJECTED_STAGE,
} from "@/lib/constants";
import type { TrafferStats, SalesStats } from "@/lib/types";

// Этапы, которые считаем «квалификацией достигнута» (квалифицированные и дальше,
// кроме отказа) — для оценки качества трафика.
const QUALIFIED_ORDER =
  STAGES.find((s) => s.key === QUALIFIED_STAGE)?.order ?? 0;
export const QUALIFIED_REACHED_KEYS = STAGES.filter(
  (s) => s.order >= QUALIFIED_ORDER && s.key !== REJECTED_STAGE,
).map((s) => s.key);

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

function sum(byStageKey: Record<string, number>): number {
  return Object.values(byStageKey).reduce((a, b) => a + b, 0);
}

// Статистика трафера: качество приведённого трафика.
export function trafferStatsFrom(
  byStageKey: Record<string, number>,
): TrafferStats {
  const totalLeads = sum(byStageKey);
  const bought = byStageKey[BOUGHT_STAGE] ?? 0;
  const rejected = byStageKey[REJECTED_STAGE] ?? 0;
  const qualified = QUALIFIED_REACHED_KEYS.reduce(
    (acc, k) => acc + (byStageKey[k] ?? 0),
    0,
  );
  return {
    totalLeads,
    qualified,
    bought,
    rejected,
    qualifiedRate: pct(qualified, totalLeads),
    boughtRate: pct(bought, totalLeads),
  };
}

// Статистика продажника: воронка закреплённых лидов.
export function salesStatsFrom(byStageKey: Record<string, number>): SalesStats {
  const totalLeads = sum(byStageKey);
  const bought = byStageKey[BOUGHT_STAGE] ?? 0;
  const rejected = byStageKey[REJECTED_STAGE] ?? 0;
  const inWork = totalLeads - bought - rejected;
  return {
    totalLeads,
    inWork,
    bought,
    rejected,
    // Win Rate = закрытые сделки / (закрытые + отказы).
    winRate: pct(bought, bought + rejected),
  };
}
