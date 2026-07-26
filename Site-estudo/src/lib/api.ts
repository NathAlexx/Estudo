async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro na requisição (${res.status})`);
  }
  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(url: string, data: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(data) }),
  del: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
