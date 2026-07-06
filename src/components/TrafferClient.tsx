"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Plus,
  X,
  Loader2,
  Link2,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Badge } from "@/components/Badge";
import { fetcher, mutateJson } from "@/lib/fetcher";
import { QUALIFIED_REACHED_KEYS } from "@/lib/stats";
import { BOUGHT_STAGE } from "@/lib/constants";
import type { Lead, Niche } from "@/lib/types";

type Props = {
  user: { id: string; name?: string | null; role: "ADMIN" | "SALES" | "TRAFFER" };
};

export default function TrafferClient({ user }: Props) {
  const { data: leads = [], isLoading, mutate } = useSWR<Lead[]>(
    "/api/leads",
    fetcher,
  );
  const { data: niches = [] } = useSWR<Niche[]>("/api/niches", fetcher);

  const [open, setOpen] = useState(false);

  const stats = useMemo(() => {
    const total = leads.length;
    const qualified = leads.filter((l) =>
      QUALIFIED_REACHED_KEYS.includes(l.stage.key),
    ).length;
    const bought = leads.filter((l) => l.stage.key === BOUGHT_STAGE).length;
    return { total, qualified, bought };
  }, [leads]);

  return (
    <>
      <Sidebar user={user} />
      <div className="flex min-h-screen flex-col pl-16 md:pl-60">
        <Header user={user} />

        <main className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-6">
          {/* Заголовок + кнопка */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Мои лиды</h1>
              <p className="text-sm text-stone-500 dark:text-slate-400">
                Добавляйте лидов и следите за качеством своего трафика.
              </p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 hover:shadow-card-hover"
            >
              <Plus className="h-4 w-4" />
              Добавить лида
            </button>
          </div>

          {/* Статистика трафика */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <StatTile
              icon={<Users className="h-5 w-5" />}
              label="Всего приведено"
              value={stats.total}
              ring="bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-300"
            />
            <StatTile
              icon={<TrendingUp className="h-5 w-5" />}
              label="Квалифицированы"
              value={stats.qualified}
              ring="bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
            />
            <StatTile
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Купили"
              value={stats.bought}
              ring="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
            />
          </div>

          {/* Список лидов */}
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-stone-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка…
            </div>
          ) : leads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 py-16 text-center text-sm text-stone-400 dark:border-slate-700 dark:bg-slate-900/40">
              Пока нет лидов. Нажмите «Добавить лида», чтобы завести первого.
            </div>
          ) : (
            <div className="space-y-2">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col gap-2 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {lead.telegramLink ? (
                        <a
                          href={lead.telegramLink}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate font-semibold text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {lead.title}
                        </a>
                      ) : (
                        <span className="truncate font-semibold">
                          {lead.title}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-stone-400">
                      {new Intl.DateTimeFormat("ru-RU", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(lead.createdAt))}
                      {lead.username ? ` · @${lead.username}` : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {lead.niche && (
                      <Badge label={lead.niche.name} color={lead.niche.color} />
                    )}
                    <Badge label={lead.stage.name} color={lead.stage.color} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {open && (
        <AddLeadModal
          niches={niches}
          onClose={() => setOpen(false)}
          onSaved={() => mutate()}
        />
      )}
    </>
  );
}

function StatTile({
  icon,
  label,
  value,
  ring,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  ring: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-white px-4 py-3 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ring}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xl font-bold tabular-nums">{value}</div>
        <div className="truncate text-xs text-stone-500 dark:text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}

function AddLeadModal({
  niches,
  onClose,
  onSaved,
}: {
  niches: Niche[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [username, setUsername] = useState("");
  const [nicheId, setNicheId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const input =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-800";
  const labelCls =
    "mb-1.5 block text-sm font-semibold text-stone-700 dark:text-slate-300";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const finalTitle = title.trim() || username.trim() || telegramLink.trim();
    if (!finalTitle) {
      setError("Укажите имя, ссылку или username лида");
      return;
    }
    setSaving(true);
    try {
      // trafferId и этап «Новые» проставляются на бэкенде автоматически.
      await mutateJson("/api/leads", "POST", {
        title: finalTitle,
        telegramLink: telegramLink.trim() || null,
        username: username.trim().replace(/^@/, "") || null,
        nicheId: nicheId || null,
        notes: notes.trim() || null,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Не удалось сохранить");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto scrollbar-thin rounded-2xl border border-stone-200 bg-white p-6 shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Новый лид</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className={labelCls}>Имя / заголовок</label>
            <input
              className={input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Эксперт по РКО"
              autoFocus
            />
          </div>
          <div>
            <label className={labelCls}>Ссылка Telegram</label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                className={`${input} pl-9`}
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                placeholder="https://t.me/username"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Username</label>
              <input
                className={input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
            </div>
            <div>
              <label className={labelCls}>Ниша</label>
              <select
                className={input}
                value={nicheId}
                onChange={(e) => setNicheId(e.target.value)}
              >
                <option value="">— не выбрана —</option>
                {niches.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Заметки</label>
            <textarea
              className={`${input} min-h-[70px] resize-y`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Вводные по лиду…"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Добавить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
