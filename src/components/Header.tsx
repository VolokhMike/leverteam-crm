"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { ReactNode } from "react";
import { roleLabel } from "@/lib/constants";

type Props = {
  user: { name?: string | null; role: "ADMIN" | "SALES" | "TRAFFER" };
  center?: ReactNode;
};

/**
 * Верхняя шапка. Навигация вынесена в левый Sidebar — здесь остаются только
 * метрики (center), профиль текущего пользователя и переключатель тем.
 */
export default function Header({ user, center }: Props) {
  const isAdmin = user.role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-sand-50/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 lg:px-6">
        {/* Center: metrics */}
        {center && (
          <div className="order-last w-full lg:order-none lg:w-auto lg:flex-1">
            {center}
          </div>
        )}

        {/* Right: user + actions */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold leading-tight">
              {user.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isAdmin ? "Администратор" : "Продажник"}
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
            {(user.name || "?").charAt(0).toUpperCase()}
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Выйти"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>
    </header>
  );
}
