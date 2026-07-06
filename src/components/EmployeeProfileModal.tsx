"use client";

import useSWR from "swr";
import { X, Loader2, Mail, Send, Calendar } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Badge } from "@/components/Badge";
import { roleLabel, ROLE_BADGE_COLORS } from "@/lib/constants";
import type { EmployeeDetail } from "@/lib/types";

type Props = {
  employeeId: string | null;
  onClose: () => void;
};

export default function EmployeeProfileModal({ employeeId, onClose }: Props) {
  const { data, isLoading } = useSWR<EmployeeDetail>(
    employeeId ? `/api/users/${employeeId}` : null,
    fetcher,
  );

  if (!employeeId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="scrollbar-thin h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Профиль сотрудника</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading || !data ? (
          <div className="flex h-40 items-center justify-center text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка…
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
                {data.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-bold">{data.name}</div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Badge
                    label={roleLabel(data.role)}
                    color={ROLE_BADGE_COLORS[data.role] ?? "slate"}
                  />
                  {!data.active && (
                    <Badge label="Деактивирован" color="rose" />
                  )}
                </div>
              </div>
            </div>

            <div className="mb-5 space-y-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">Логин:</span> {data.username}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Send className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">Telegram:</span>{" "}
                {data.telegram || "—"}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">Добавлен:</span>{" "}
                {new Intl.DateTimeFormat("ru-RU").format(
                  new Date(data.createdAt),
                )}
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Закреплённые лиды
              </h3>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {data.leads.length}
              </span>
            </div>

            <div className="space-y-2">
              {data.leads.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-400">
                  Нет закреплённых лидов
                </p>
              )}
              {data.leads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800"
                >
                  <div className="mb-1 text-sm font-medium">{lead.title}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.niche && (
                      <Badge label={lead.niche.name} color={lead.niche.color} />
                    )}
                    <Badge label={lead.stage.name} color={lead.stage.color} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
