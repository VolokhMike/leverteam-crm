"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Loader2, Radio, Briefcase, ChevronRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { fetcher } from "@/lib/fetcher";
import type { TeamMember } from "@/lib/types";

type Props = {
  user: { id: string; name?: string | null; role: "ADMIN" | "SALES" | "TRAFFER" };
};

type TeamResponse = { traffers: TeamMember[]; sales: TeamMember[] };

export default function TeamClient({ user }: Props) {
  const { data, isLoading } = useSWR<TeamResponse>("/api/team", fetcher);
  const router = useRouter();

  return (
    <>
      <Sidebar user={user} />
      <div className="min-h-screen pl-16 md:pl-60">
        <Header user={user} />

        <main className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Команда / Статистика</h1>
            <p className="text-sm text-stone-500 dark:text-slate-400">
              Нажмите на сотрудника, чтобы открыть его профиль и статистику.
            </p>
          </div>

          {isLoading || !data ? (
            <div className="flex h-40 items-center justify-center text-stone-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка…
            </div>
          ) : (
            <div className="space-y-8">
              {/* Траферы */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Radio className="h-4.5 w-4.5 text-brand-600" size={18} />
                  <h2 className="text-lg font-bold">Траферы</h2>
                  <span className="rounded-full bg-stone-200/80 px-2 py-0.5 text-xs font-semibold text-stone-600 dark:bg-slate-800 dark:text-slate-300">
                    {data.traffers.length}
                  </span>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-stone-200/70 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400 dark:border-slate-800">
                        <th className="px-4 py-3 font-medium">Трафер</th>
                        <th className="px-4 py-3 text-right font-medium">Привёл</th>
                        <th className="px-4 py-3 text-right font-medium">Квал.</th>
                        <th className="px-4 py-3 text-right font-medium">Купили</th>
                        <th className="px-4 py-3 text-right font-medium">Качество</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.traffers.length === 0 && (
                        <EmptyRow cols={6} text="Нет траферов" />
                      )}
                      {data.traffers.map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => router.push(`/admin/team/${t.id}`)}
                          className="cursor-pointer border-b border-stone-100 last:border-0 transition hover:bg-stone-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                        >
                          <NameCell member={t} />
                          <NumCell value={t.traffer?.totalLeads ?? 0} />
                          <NumCell value={t.traffer?.qualified ?? 0} />
                          <NumCell value={t.traffer?.bought ?? 0} />
                          <td className="px-4 py-3 text-right">
                            <RateBadge value={t.traffer?.qualifiedRate ?? 0} />
                          </td>
                          <ArrowCell />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Продажники */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Briefcase className="h-4.5 w-4.5 text-brand-600" size={18} />
                  <h2 className="text-lg font-bold">Продажники</h2>
                  <span className="rounded-full bg-stone-200/80 px-2 py-0.5 text-xs font-semibold text-stone-600 dark:bg-slate-800 dark:text-slate-300">
                    {data.sales.length}
                  </span>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-stone-200/70 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400 dark:border-slate-800">
                        <th className="px-4 py-3 font-medium">Продажник</th>
                        <th className="px-4 py-3 text-right font-medium">Всего</th>
                        <th className="px-4 py-3 text-right font-medium">В работе</th>
                        <th className="px-4 py-3 text-right font-medium">Купили</th>
                        <th className="px-4 py-3 text-right font-medium">Отказ</th>
                        <th className="px-4 py-3 text-right font-medium">Win Rate</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.sales.length === 0 && (
                        <EmptyRow cols={7} text="Нет продажников" />
                      )}
                      {data.sales.map((s) => (
                        <tr
                          key={s.id}
                          onClick={() => router.push(`/admin/team/${s.id}`)}
                          className="cursor-pointer border-b border-stone-100 last:border-0 transition hover:bg-stone-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                        >
                          <NameCell member={s} />
                          <NumCell value={s.sales?.totalLeads ?? 0} />
                          <NumCell value={s.sales?.inWork ?? 0} />
                          <NumCell value={s.sales?.bought ?? 0} />
                          <NumCell value={s.sales?.rejected ?? 0} />
                          <td className="px-4 py-3 text-right">
                            <RateBadge value={s.sales?.winRate ?? 0} />
                          </td>
                          <ArrowCell />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function NameCell({ member }: { member: TeamMember }) {
  return (
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-medium">
            {member.name}
            {!member.active && (
              <span className="ml-1.5 text-xs text-rose-400">выкл</span>
            )}
          </div>
          <div className="truncate text-xs text-stone-400">
            @{member.username}
          </div>
        </div>
      </div>
    </td>
  );
}

function NumCell({ value }: { value: number }) {
  return (
    <td className="px-4 py-3 text-right tabular-nums text-stone-700 dark:text-slate-200">
      {value}
    </td>
  );
}

function ArrowCell() {
  return (
    <td className="pr-3 text-right text-stone-300 dark:text-slate-600">
      <ChevronRight className="ml-auto h-4 w-4" />
    </td>
  );
}

function RateBadge({ value }: { value: number }) {
  const tone =
    value >= 50
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      : value >= 20
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        : "bg-stone-100 text-stone-500 dark:bg-slate-800 dark:text-slate-400";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`}
    >
      {value}%
    </span>
  );
}

function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td
        colSpan={cols}
        className="px-4 py-8 text-center text-sm text-stone-400"
      >
        {text}
      </td>
    </tr>
  );
}
