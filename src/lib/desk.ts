import type { Order } from "@/lib/types";

const DESK_URL = "https://jarir-store.netlify.app/api/desk";

async function apiDesk(payload: { op: "list" | "save" | "replace"; order?: Order; orders?: Order[] }): Promise<{ ok?: boolean; orders?: Order[] } | null> {
  try {
    const res = await fetch(DESK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!res.ok) return null;
    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("json")) return null;
    return (await res.json()) as { ok?: boolean; orders?: Order[] };
  } catch {
    return null;
  }
}

export async function fetchDeskOrders(): Promise<Order[]> {
  const api = await apiDesk({ op: "list" });
  return Array.isArray(api?.orders) ? api.orders : [];
}

export async function saveDeskOrder(order: Order) {
  if (!order?.id) return { ok: false as const };
  const api = await apiDesk({ op: "save", order });
  return { ok: Boolean(api?.ok) as true | false };
}
