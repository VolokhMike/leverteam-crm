"use client";

import { Users, Briefcase, Clock, CheckCircle2 } from "lucide-react";
import type { Metrics as MetricsType } from "@/lib/types";

const CARDS = [
  {
    key: "total",
    label: "Всего экспертов",
    icon: Users,
    accent: "text-slate-500",
    ring: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    key: "inWork",
    label: "В работе",
    icon: Briefcase,
    accent: "text-violet-500",
    ring: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
  },
  {
    key: "inQueue",
    label: "В очереди",
    icon: Clock,
    accent: "text-amber-500",
    ring: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    key: "bought",
    label: "Купили",
    icon: CheckCircle2,
    accent: "text-emerald-500",
    ring: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
  },
] as const;

export default function Metrics({ metrics }: { metrics?: MetricsType }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:justify-center lg:gap-3">
      {CARDS.map((c) => {
        const Icon = c.icon;
        const value = metrics ? metrics[c.key] : undefined;
        return (
          <div
            key={c.key}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 lg:min-w-[150px]"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.ring}`}
            >
              <Icon className="h-4.5 w-4.5" size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-lg font-bold leading-none tabular-nums">
                {value ?? "—"}
              </div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                {c.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
