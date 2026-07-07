"use client";

import { useEffect } from "react";

// Последний рубеж: срабатывает, если падает сам корневой layout.
// Должен отрисовать собственные <html>/<body>. Tailwind тут недоступен —
// используем инлайн-стили.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ui] Критическая ошибка приложения:", error);
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f2",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            margin: 16,
            padding: 24,
            background: "#fff",
            border: "1px solid #e7e2d9",
            borderRadius: 16,
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ margin: "0 0 8px", fontSize: 18, color: "#1e293b" }}>
            Приложение временно недоступно
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "#64748b" }}>
            Произошла критическая ошибка. Попробуйте перезагрузить страницу.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#ed4924",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Перезагрузить
          </button>
        </div>
      </body>
    </html>
  );
}
