"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { mutateJson } from "@/lib/fetcher";
import type { Employee } from "@/lib/types";

type Props = {
  open: boolean;
  employee: Employee | null; // null => create
  onClose: () => void;
  onSaved: () => void;
};

export default function EmployeeFormModal({
  open,
  employee,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(employee);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [telegram, setTelegram] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SALES">("SALES");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setPassword("");
    setName(employee?.name ?? "");
    setUsername(employee?.username ?? "");
    setTelegram(employee?.telegram ?? "");
    setRole(employee?.role ?? "SALES");
    setActive(employee?.active ?? true);
  }, [open, employee]);

  if (!open) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !username.trim() || (!editing && !password)) {
      setError("Заполните имя, логин и пароль");
      return;
    }
    setSaving(true);
    try {
      if (editing && employee) {
        await mutateJson(`/api/users/${employee.id}`, "PATCH", {
          name,
          telegram,
          role,
          active,
          ...(password ? { password } : {}),
        });
      } else {
        await mutateJson("/api/users", "POST", {
          name,
          username,
          telegram,
          role,
          password,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 disabled:opacity-60";
  const labelCls =
    "mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {editing ? "Редактировать сотрудника" : "Новый сотрудник"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-3">
          <div>
            <label className={labelCls}>Имя *</label>
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Логин *</label>
              <input
                className={input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={editing}
                title={editing ? "Логин нельзя изменить" : ""}
              />
            </div>
            <div>
              <label className={labelCls}>Telegram</label>
              <input
                className={input}
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                {editing ? "Новый пароль" : "Пароль *"}
              </label>
              <input
                type="password"
                className={input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editing ? "оставьте пустым" : "••••••"}
              />
            </div>
            <div>
              <label className={labelCls}>Роль</label>
              <select
                className={input}
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "SALES")}
              >
                <option value="SALES">Продажник</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>
          </div>

          {editing && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Активен (может входить в систему)
            </label>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Сохранить" : "Создать"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
