"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, Shield } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  user: { name?: string | null; role: "ADMIN" | "SALES" };
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
        className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
          active
            ? "bg-brand-600/20 text-white ring-1 ring-inset ring-brand-500/40"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="hidden md:inline">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r border-graphite-800 bg-graphite-900 text-slate-300 md:w-60">
      {/* Логотип Leverteam */}
      <div className="flex h-16 items-center gap-2 border-b border-graphite-800 px-3 md:px-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white">
          <KanbanSquare className="h-5 w-5" />
        </span>
        <span className="hidden text-lg font-bold tracking-tight text-white md:inline">
          <span className="text-brand-400">Lever</span>team
        </span>
      </div>

      {/* Навигация */}
      <nav className="flex flex-1 flex-col gap-1 p-2 md:p-3">
        {navItem("/board", "Доска", <KanbanSquare className="h-5 w-5" />)}
        {isAdmin &&
          navItem(
            "/admin/employees",
            "Меню админа",
            <Shield className="h-5 w-5" />,
          )}
      </nav>

      {/* Подпись роли внизу */}
      <div className="hidden border-t border-graphite-800 px-4 py-3 text-xs text-slate-500 md:block">
        {isAdmin ? "Администратор" : "Продажник"}
        <div className="truncate text-slate-400">{user.name}</div>
      </div>
    </aside>
  );
}
