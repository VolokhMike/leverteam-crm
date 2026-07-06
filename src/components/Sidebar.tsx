"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, Shield, Settings, BarChart3 } from "lucide-react";
import type { ReactNode } from "react";
import { roleLabel } from "@/lib/constants";

type Props = {
  user: { name?: string | null; role: "ADMIN" | "SALES" | "TRAFFER" };
};

/**
 * Левое боковое меню (Sidebar) — закреплено слева на всю высоту экрана.
 * Вверху — логотип Leverteam. Пункт «Меню админа» виден только администраторам.
 */
export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";

  const navItem = (href: string, label: string, icon: ReactNode) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        title={label}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          active
            ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-600/15 dark:text-brand-300 dark:ring-brand-500/30"
            : "text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="hidden md:inline">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r border-stone-200 bg-white/80 text-stone-600 backdrop-blur-xl md:w-60 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
      {/* Логотип Leverteam */}
      <div className="flex h-16 items-center gap-2.5 px-3 md:px-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-card">
          <KanbanSquare className="h-5 w-5" />
        </span>
        <span className="hidden text-xl font-extrabold tracking-tight text-stone-900 md:inline dark:text-white">
          <span className="text-brand-600 dark:text-brand-400">Lever</span>team
        </span>
      </div>

      {/* Навигация */}
      <nav className="flex flex-1 flex-col gap-1 p-2 md:p-3">
        {navItem("/board", "Доска", <KanbanSquare className="h-5 w-5" />)}
        {isAdmin &&
          navItem(
            "/admin/employees",
            "Сотрудники",
            <Shield className="h-5 w-5" />,
          )}
        {isAdmin &&
          navItem(
            "/admin/team",
            "Команда / Статистика",
            <BarChart3 className="h-5 w-5" />,
          )}
        {isAdmin &&
          navItem(
            "/admin/settings",
            "Настройки",
            <Settings className="h-5 w-5" />,
          )}
      </nav>

      {/* Подпись роли внизу */}
      <div className="hidden px-4 py-4 text-xs text-stone-400 md:block dark:text-slate-500">
        {roleLabel(user.role)}
        <div className="truncate font-medium text-stone-600 dark:text-slate-400">
          {user.name}
        </div>
      </div>
    </aside>
  );
}
