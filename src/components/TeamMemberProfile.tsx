"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  Send,
  Calendar,
  AtSign,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Badge } from "@/components/Badge";
import EmployeeFormModal from "@/components/EmployeeFormModal";
import { fetcher, mutateJson } from "@/lib/fetcher";
import { roleLabel, ROLE_BADGE_COLORS, colorClasses } from "@/lib/constants";
import { STAGES } from "@/lib/constants";
import type { TeamMemberDetail } from "@/lib/types";

type Props = {
  user: { id: string; name?: string | null; role: "ADMIN" | "SALES" | "TRAFFER" };
  memberId: string;
};

export default function TeamMemberProfile({ user, memberId }: Props) {
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR<TeamMemberDetail>(
    `/api/team/${memberId}`,
    fetcher,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!data) return;
    if (data.id === user.id) {
      alert("Нельзя удалить самого себя");
      return;
    }
    if (!confirm(`Удалить сотрудника «${data.name}»? Его лиды останутся.`))
      return;
    setDeleting(true);
    try {
      await mutateJson(`/api/users/${data.id}`, "DELETE");
      router.push("/admin/team");
    } catch (err: any) {
      alert(err.message || "Не удалось удалить");
      setDeleting(false);
    }
  }

  const isTrafferProfile = data?.role === "TRAFFER";

  return (
    <>
      <Sidebar user={user} />
      <div className="min-h-screen pl-16 md:pl-60">
        <Header user={user} />

        <main className="mx-auto max-w-3xl px-4 py-6 lg:px-6">
          <button
            onClick={() => router.push("/admin/team")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-brand-600 dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            К команде
          </button>

          {isLoading || !data ? (
            <div className="flex h-40 items-center justify-center text-stone-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка…
            </div>
          ) : (
            <>
              {/* Шапка профиля */}
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
                    {data.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xl font-bold">{data.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4" />
                    Изменить
                  </button>
                  <button
                    onClick={remove}
                    disabled={deleting || data.id === user.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-rose-950/40"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Удалить
                  </button>
                </div>
              </div>

              {/* Контактные данные */}
              <div className="mb-6 grid grid-cols-1 gap-2 rounded-2xl border border-stone-200/70 bg-white p-4 text-sm shadow-card sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
                <InfoRow icon={<AtSign className="h-4 w-4" />} label="Логин">
                  {data.username}
                </InfoRow>
                <InfoRow icon={<Send className="h-4 w-4" />} label="Telegram">
                  {data.telegram || "—"}
                </InfoRow>
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Добавлен">
                  {new Intl.DateTimeFormat("ru-RU").format(
                    new Date(data.createdAt),
                  )}
                </InfoRow>
              </div>

              {/* Ключевые метрики */}
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-400">
                {isTrafferProfile ? "Качество трафика" : "Воронка продаж"}
              </h3>
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {isTrafferProfile && data.traffer ? (
                  <>
                    <Stat value={data.traffer.totalLeads} label="Приведено" />
                    <Stat
                      value={data.traffer.qualified}
                      label="Квалифицированы"
                      accent="indigo"
                    />
                    <Stat
                      value={data.traffer.bought}
                      label="Купили"
                      accent="emerald"
                    />
                    <Stat
                      value={`${data.traffer.qualifiedRate}%`}
                      label="Конверсия в квал."
                      accent="brand"
                    />
                  </>
                ) : data.sales ? (
                  <>
                    <Stat value={data.sales.totalLeads} label="Всего лидов" />
                    <Stat
                      value={data.sales.inWork}
                      label="В работе"
                      accent="violet"
                    />
                    <Stat
                      value={data.sales.bought}
                      label="Купили"
                      accent="emerald"
                    />
                    <Stat
                      value={`${data.sales.winRate}%`}
                      label="Win Rate"
                      accent="brand"
                    />
                  </>
                ) : null}
              </div>

              {/* Распределение по этапам */}
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-400">
                Распределение по этапам
              </h3>
              <div className="space-y-2 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
                {(() => {
                  const max = Math.max(1, ...Object.values(data.byStage));
                  return STAGES.map((s) => {
                    const count = data.byStage[s.key] ?? 0;
                    const c = colorClasses(s.color);
                    return (
                      <div key={s.key} className="flex items-center gap-3">
                        <div className="w-40 shrink-0 truncate text-sm text-stone-600 dark:text-slate-300">
                          {s.name}
                        </div>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${c.dot}`}
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                        <div className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">
                          {count}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </main>
      </div>

      {data && (
        <EmployeeFormModal
          open={editOpen}
          employee={data}
          onClose={() => setEditOpen(false)}
          onSaved={() => mutate()}
        />
      )}
    </>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-stone-600 dark:text-slate-300">
      <span className="text-stone-400">{icon}</span>
      <span className="text-stone-400">{label}:</span>
      <span className="truncate font-medium">{children}</span>
    </div>
  );
}

function Stat({
  value,
  label,
  accent = "slate",
}: {
  value: number | string;
  label: string;
  accent?: "slate" | "indigo" | "emerald" | "violet" | "brand";
}) {
  const tone: Record<string, string> = {
    slate: "text-stone-800 dark:text-slate-100",
    indigo: "text-indigo-600 dark:text-indigo-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    brand: "text-brand-600 dark:text-brand-400",
  };
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className={`text-2xl font-bold tabular-nums ${tone[accent]}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-stone-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}
