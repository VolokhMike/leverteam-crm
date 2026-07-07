"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

// Ловит ошибки рендера/загрузки в любом сегменте приложения.
// Вместо белого экрана показывает аккуратную заглушку с кнопкой перезагрузки.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ui] Ошибка страницы:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          Что-то пошло не так
        </h1>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Произошла ошибка при загрузке страницы. Данные не потеряны — попробуйте
          повторить.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <RotateCcw className="h-4 w-4" />
            Повторить
          </button>
          <a
            href="/board"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            На доску
          </a>
        </div>
      </div>
    </div>
  );
}
