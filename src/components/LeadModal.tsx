"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import { mutateJson } from "@/lib/fetcher";
import type { Lead, Niche, Stage, SalesRep } from "@/lib/types";

type Props = {
  open: boolean;
  lead: Lead | null; // null => create
  niches: Niche[];
  stages: Stage[];
  salesReps: SalesRep[];
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
};

const empty = {
  title: "",
  telegramLink: "",
  username: "",
  nicheId: "",
  stageId: "",
  salesRepId: "",
  trafferName: "",
  trafferUsername: "",
  notes: "",
  pinned: false,
};

export default function LeadModal({
  open,
  lead,
  niches,
  stages,
  salesReps,
  isAdmin,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (lead) {
      setForm({
        title: lead.title ?? "",
        telegramLink: lead.telegramLink ?? "",
        username: lead.username ?? "",
        nicheId: lead.nicheId ?? "",
        stageId: lead.stageId ?? "",
        salesRepId: lead.salesRepId ?? "",
        trafferName: lead.trafferName ?? "",
        trafferUsername: lead.trafferUsername ?? "",
        notes: lead.notes ?? "",
        pinned: lead.pinned ?? false,
      });
    } else {
      setForm({
        ...empty,
        stageId: stages[0]?.id ?? "",
      });
    }
  }, [open, lead, stages]);

  if (!open) return null;

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Укажите заголовок");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        telegramLink: form.telegramLink.trim(),
        username: form.username.trim(),
        nicheId: form.nicheId || null,
        stageId: form.stageId,
        trafferName: form.trafferName.trim(),
        trafferUsername: form.trafferUsername.trim(),
        notes: form.notes.trim(),
        pinned: form.pinned,
        ...(isAdmin ? { salesRepId: form.salesRepId || null } : {}),
      };
      if (lead) {
        await mutateJson(`/api/leads/${lead.id}`, "PATCH", payload);
      } else {
        await mutateJson("/api/leads", "POST", payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!lead) return;
    if (!confirm("Удалить этого лида?")) return;
    setSaving(true);
    try {
      await mutateJson(`/api/leads/${lead.id}`, "DELETE");
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Не удалось удалить");
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800";
  const labelCls =
    "mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto scrollbar-thin rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {lead ? "Редактировать лида" : "Новый лид"}
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
            <label className={labelCls}>Заголовок *</label>
            <input
              className={input}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Имя / ник эксперта"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ссылка Telegram</label>
              <input
                className={input}
                value={form.telegramLink}
                onChange={(e) => set("telegramLink", e.target.value)}
                placeholder="https://t.me/username"
              />
            </div>
            <div>
              <label className={labelCls}>Username</label>
              <input
                className={input}
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="username"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ниша</label>
              <select
                className={input}
                value={form.nicheId}
                onChange={(e) => set("nicheId", e.target.value)}
              >
                <option value="">— не выбрана —</option>
                {niches.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Этап</label>
              <select
                className={input}
                value={form.stageId}
                onChange={(e) => set("stageId", e.target.value)}
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className={labelCls}>Продажник</label>
              <select
                className={input}
                value={form.salesRepId}
                onChange={(e) => set("salesRepId", e.target.value)}
              >
                <option value="">— не назначен —</option>
                {salesReps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.telegram ? `(${s.telegram})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Траффер — имя</label>
              <input
                className={input}
                value={form.trafferName}
                onChange={(e) => set("trafferName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Траффер — username</label>
              <input
                className={input}
                value={form.trafferUsername}
                onChange={(e) => set("trafferUsername", e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Заметки</label>
            <textarea
              className={`${input} min-h-[70px] resize-y`}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => set("pinned", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Закрепить карточку
          </label>

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {lead ? "Сохранить" : "Создать"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Отмена
            </button>
            {lead && (
              <button
                type="button"
                onClick={remove}
                disabled={saving}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
