/** Chamadas ao agents-api via proxy Next (/api/agents/...). */

export async function postAgent<T = any>(
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`/api/agents/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: T = {} as T;
  try {
    data = (await res.json()) as T;
  } catch {
    /* ignore */
  }
  return { ok: res.ok, status: res.status, data };
}
