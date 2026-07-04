"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  UserPlus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Badge } from "@/components/Badge";
import EmployeeFormModal from "@/components/EmployeeFormModal";
import EmployeeProfileModal from "@/components/EmployeeProfileModal";
import { fetcher, mutateJson } from "@/lib/fetcher";
import type { Employee } from "@/lib/types";

type Props = {
  user: { id: string; name?: string | null; role: "ADMIN" | "SALES" };
};

export default function EmployeesClient({ user }: Props) {
  const { data: employees = [], isLoading, mutate } = useSWR<Employee[]>(
    "/api/users",
    fetcher,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(emp: Employee) {
    if (emp.id === user.id) {
      alert("Нельзя удалить самого себя");
      return;
    }
    if (
      !confirm(
        `Удалить сотрудника «${emp.name}»? Его лиды останутся, но без ответственного.`,
      )
    )
      return;
    setBusyId(emp.id);
    try {
      await mutateJson(`/api/users/${emp.id}`, "DELETE");
      mutate();
    } catch (err: any) {
      alert(err.message || "Не удалось удалить");
    } finally {
      setBusyId(null);
    }
  }

  const admins = employees.filter((e) => e.role === "ADMIN");
  const sales = employees.filter((e) => e.role === "SALES");

  return (
    <>
      <Sidebar user={user} />
      <div className="min-h-screen pl-16 md:pl-60">
      <Header user={user} />

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Управление сотрудниками</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {admins.length} админ(ов) · {sales.length} продажник(ов)
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <UserPlus className="h-4 w-4" />
            Добавить сотрудника
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка…
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="px-4 py-3 font-medium">Сотрудник</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    Telegram
                  </th>
                  <th className="px-4 py-3 font-medium">Роль</th>
                  <th className="px-4 py-3 font-medium">Лиды</th>
                  <th className="px-4 py-3 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {emp.name}
                            {emp.id === user.id && (
                              <span className="ml-1.5 text-xs text-slate-400">
                                (вы)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            @{emp.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                      {emp.telegram || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          label={emp.role === "ADMIN" ? "Админ" : "Продажник"}
                          color={emp.role === "ADMIN" ? "violet" : "sky"}
                        />
                        {!emp.active &&
                          (emp.role === "ADMIN" ? (
                            <ShieldOff className="h-4 w-4 text-rose-400" />
                          ) : (
                            <span className="text-xs text-rose-400">
                              выкл
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                      {emp._count.leads}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setProfileId(emp.id)}
                          title="Профиль"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditing(emp);
                            setFormOpen(true);
                          }}
                          title="Редактировать"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(emp)}
                          disabled={busyId === emp.id || emp.id === user.id}
                          title="Удалить"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 dark:hover:bg-rose-950/40"
                        >
                          {busyId === emp.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Продажники видят только своих лидов. Администраторы видят всю доску.
        </p>
      </main>

      <EmployeeFormModal
        open={formOpen}
        employee={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => mutate()}
      />
      <EmployeeProfileModal
        employeeId={profileId}
        onClose={() => setProfileId(null)}
      />
      </div>
    </>
  );
}
