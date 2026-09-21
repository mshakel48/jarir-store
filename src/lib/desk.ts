import type { Order } from "@/lib/types";

const DESK_URLS = ["/api/desk", "https://jarir-store.netlify.app/api/desk"];

async function readDesk(res: Response): Promise<{ ok?: boolean; orders?: Order[] } | null> {
  if (!res.ok) return null;
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.includes("json")) return null;
  const data = (await res.json()) as { ok?: boolean; orders?: Order[] };
  if (Array.isArray(data?.orders) || data?.ok) return data;
  return null;
}

async function apiDesk(payload: { op: "list" | "save" | "replace"; order?: Order; orders?: Order[] }): Promise<{ ok?: boolean; orders?: Order[] } | null> {
  const body = JSON.stringify(payload);
  for (const url of DESK_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "text/plain;charset=UTF-8" },
        body,
        keepalive: true,
        mode: "cors",
        cache: "no-store",
      });
      const data = await readDesk(res);
      if (data) return data;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function fetchDeskOrders(): Promise<Order[]> {
  for (const url of DESK_URLS) {
    try {
      const res = await fetch(url, { method: "GET", mode: "cors", cache: "no-store" });
      const data = await readDesk(res);
      if (Array.isArray(data?.orders)) return data.orders;
    } catch {
      /* try next */
    }
  }
  const posted = await apiDesk({ op: "list" });
  return Array.isArray(posted?.orders) ? posted.orders : [];
}

export async function saveDeskOrder(order: Order) {
  if (!order?.id) return { ok: false as const };
  const api = await apiDesk({ op: "save", order });
  return { ok: Boolean(api?.ok) as true | false };
}
