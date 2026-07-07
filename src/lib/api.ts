import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/**
 * Управляемая ошибка HTTP. Бросай её из хендлера, когда нужно вернуть
 * конкретный статус и сообщение: `throw new HttpError(404, "Не найдено")`.
 */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

/**
 * Преобразует любое исключение в аккуратный JSON-ответ. Внутренние детали
 * не утекают клиенту, но пишутся в серверный лог (виден в логах Netlify).
 */
function toErrorResponse(err: unknown): NextResponse {
  // Наши собственные контролируемые ошибки.
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  // Известные ошибки Prisma — маппим коды в понятные статусы.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // unique constraint
        return NextResponse.json(
          { error: "Запись с такими данными уже существует" },
          { status: 409 },
        );
      case "P2025": // record not found
        return NextResponse.json(
          { error: "Запись не найдена" },
          { status: 404 },
        );
      case "P2003": // foreign key constraint
        return NextResponse.json(
          { error: "Нарушена связь с другой записью" },
          { status: 400 },
        );
      default:
        console.error(`[api] Prisma error ${err.code}:`, err.message);
        return NextResponse.json(
          { error: "Ошибка базы данных" },
          { status: 400 },
        );
    }
  }

  // База недоступна / упала — временная ошибка, не наша вина.
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    console.error("[api] База данных недоступна:", err);
    return NextResponse.json(
      { error: "База данных временно недоступна, попробуйте позже" },
      { status: 503 },
    );
  }

  // Некорректный запрос к Prisma (обычно баг в коде, но не роняем сервер).
  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error("[api] Prisma validation:", err.message);
    return NextResponse.json(
      { error: "Некорректные данные запроса" },
      { status: 400 },
    );
  }

  // Всё остальное — 500, детали только в лог.
  console.error("[api] Необработанная ошибка:", err);
  return NextResponse.json(
    { error: "Внутренняя ошибка сервера" },
    { status: 500 },
  );
}

/**
 * Оборачивает обработчик роута: ловит любое исключение и возвращает
 * аккуратный JSON вместо «грязного» 500. Работает и для `GET()` без
 * аргументов, и для `GET(req, { params })`.
 *
 *   export const GET = apiHandler(async (req) => { ... });
 */
export function apiHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response> | Response,
): (...args: Args) => Promise<Response> {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}
