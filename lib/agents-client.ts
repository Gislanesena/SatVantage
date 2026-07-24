/** Chamadas ao agents-api via proxy Next (/api/agents/...). */

export type AgentPostResult<T = Record<string, unknown>> = {
  ok: boolean;
  status: number;
  data: T;
  degraded?: boolean;
  upstreamFail?: string;
};

export async function postAgent<T extends Record<string, unknown> = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>,
): Promise<AgentPostResult<T>> {
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

  const degraded = Boolean(
    (data as { degraded?: boolean }).degraded ||
      (data as { fonte?: string }).fonte === "local",
  );
  const rawUpstreamFail = (data as { upstream_fail?: unknown }).upstream_fail;
  const upstreamFail =
    typeof rawUpstreamFail === "string" ? rawUpstreamFail : undefined;

  if (degraded || !res.ok) {
    console.warn(
      `[postAgent] path=${path} status=${res.status} degraded=${degraded}` +
        (upstreamFail ? ` upstream_fail=${upstreamFail}` : ""),
    );
  }

  return { ok: res.ok, status: res.status, data, degraded, upstreamFail };
}
