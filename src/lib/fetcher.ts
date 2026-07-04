export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    const error = new Error(info.error || "Ошибка загрузки данных");
    throw error;
  }
  return res.json();
};

type Method = "POST" | "PATCH" | "DELETE";

export async function mutateJson<T = any>(
  url: string,
  method: Method,
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Ошибка запроса");
  }
  return data as T;
}
