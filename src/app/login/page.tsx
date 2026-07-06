"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KanbanSquare, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Неверный логин или пароль");
      return;
    }
    router.push("/board");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sand-50 p-4 dark:bg-slate-950">
      {/* Тёплые размытые пятна на фоне */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-600/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-700/10" />

      <div className="relative w-full max-w-md rounded-3xl border border-stone-200/80 bg-white/80 p-8 shadow-card backdrop-blur-xl sm:p-10 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card-hover">
            <KanbanSquare className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            <span className="text-brand-600 dark:text-brand-400">Lever</span>team
          </h1>
          <p className="text-sm text-stone-500 dark:text-slate-400">
            Управление экспертами
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700 dark:text-slate-300">
              Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-800"
              placeholder="login"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700 dark:text-slate-300">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-800"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 hover:shadow-card-hover disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
