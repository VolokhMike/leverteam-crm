"use client";

import { Search, X, Plus, User } from "lucide-react";
import { colorClasses } from "@/lib/constants";
import type { Niche } from "@/lib/types";

type Props = {
  niches: Niche[];
  activeNiche: string | null;
  onNiche: (key: string | null) => void;
  search: string;
  onSearch: (v: string) => void;
  onlyMine?: boolean;
  onOnlyMine?: (v: boolean) => void;
  onAdd?: () => void;
  canAdd?: boolean;
};

export default function Filters({
  niches,
  activeNiche,
  onNiche,
  search,
  onSearch,
  onlyMine = false,
  onOnlyMine,
  onAdd,
  canAdd,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Найти эксперта на доске…"
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-900"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Очистить поиск"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {canAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 hover:shadow-card-hover"
          >
            <Plus className="h-4 w-4" />
            Добавить лида
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {onOnlyMine && (
          <>
            <button
              onClick={() => onOnlyMine(!onlyMine)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                onlyMine
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Мои лиды
            </button>
            <span className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-700" />
          </>
        )}
        <button
          onClick={() => onNiche(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            activeNiche === null
              ? "bg-brand-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
          }`}
        >
          Все ниши
        </button>
        {niches.map((n) => {
          const active = activeNiche === n.key;
          const c = colorClasses(n.color);
          return (
            <button
              key={n.id}
              onClick={() => onNiche(active ? null : n.key)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? `${c.badge} ring-2 ring-offset-1 ring-offset-slate-100 dark:ring-offset-slate-950`
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
              {n.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
