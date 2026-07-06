"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, Save, UserCog, KeyRound, ShieldCheck } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { mutateJson } from "@/lib/fetcher";

type Props = {
  user: { id: string; name: string; username: string; role: "ADMIN" | "SALES" };
};

export default function AccountSettings({ user }: Props) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const usernameChanged = username.trim() !== user.username;
  const passwordChanged = password.length > 0;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(null);

    if (!name.trim()) return setError("Имя не может быть пустым");
    if (!username.trim() || username.trim().length < 3)
      return setError("Логин слишком короткий (минимум 3 символа)");
    if (passwordChanged) {
      if (password.length < 4)
        return setError("Пароль слишком короткий (минимум 4 символа)");
      if (password !== confirm) return setError("Пароли не совпадают");
    }

    const patch: Record<string, unknown> = {};
    if (name.trim() !== user.name) patch.name = name.trim();
    if (usernameChanged) patch.username = username.trim();
    if (passwordChanged) patch.password = password;

    if (Object.keys(patch).length === 0) {
      setError("Нет изменений для сохранения");
      return;
    }

    setSaving(true);
    try {
      await mutateJson(`/api/users/${user.id}`, "PATCH", patch);

      // Если сменили логин или пароль — просим войти заново с новыми данными.
      if (usernameChanged || passwordChanged) {
        setDone(
          "Данные для входа обновлены. Сейчас вы будете перенаправлены на страницу входа…",
        );
        setTimeout(() => signOut({ callbackUrl: "/login" }), 1600);
      } else {
        setDone("Настройки сохранены");
        setSaving(false);
      }
    } catch (err: any) {
      setError(err.message || "Не удалось сохранить");
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-800";
  const labelCls =
    "mb-1.5 block text-sm font-semibold text-stone-700 dark:text-slate-300";
  const card =
    "rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6";

  return (
    <>
      <Sidebar user={user} />
      <div className="min-h-screen pl-16 md:pl-60">
        <Header user={user} />

        <main className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Настройки аккаунта</h1>
            <p className="text-sm text-stone-500 dark:text-slate-400">
              Измените имя, логин и пароль для входа в систему.
            </p>
          </div>

          <form onSubmit={save} className="space-y-5">
            {/* Профиль */}
            <div className={card}>
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-slate-100">
                <UserCog className="h-4.5 w-4.5 text-brand-600" size={18} />
                Профиль и логин
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Отображаемое имя</label>
                  <input
                    className={input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Логин для входа</label>
                  <input
                    className={input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                  <p className="mt-1.5 text-xs text-stone-400 dark:text-slate-500">
                    С этим логином вы входите в систему.
                  </p>
                </div>
              </div>
            </div>

            {/* Пароль */}
            <div className={card}>
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-slate-100">
                <KeyRound className="h-4.5 w-4.5 text-brand-600" size={18} />
                Смена пароля
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Новый пароль</label>
                  <input
                    type="password"
                    className={input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="оставьте пустым, чтобы не менять"
                  />
                </div>
                <div>
                  <label className={labelCls}>Повторите пароль</label>
                  <input
                    type="password"
                    className={input}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••"
                    disabled={!passwordChanged}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                {error}
              </div>
            )}
            {done && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {done}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 hover:shadow-card-hover disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Сохранить изменения
              </button>
              {(usernameChanged || passwordChanged) && !done && (
                <span className="text-xs text-stone-400 dark:text-slate-500">
                  После смены логина/пароля потребуется войти заново.
                </span>
              )}
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
