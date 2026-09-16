import { createServerFn } from "@tanstack/react-start";
import type { Order } from "@/lib/types";

type DeskMem = { __jarirDesk?: Map<string, string> };

function memory() {
  const g = globalThis as DeskMem;
  g.__jarirDesk ??= new Map();
  return g.__jarirDesk;
}

function parseOrder(raw: string): Order | null {
  try {
    const order = JSON.parse(raw) as Order;
    return order?.id ? order : null;
  } catch {
    return null;
  }
}

async function apiDesk(payload: { op: "list" | "save"; order?: Order }): Promise<{ ok?: boolean; orders?: Order[] } | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch("/api/desk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("json")) return null;
    return (await res.json()) as { ok?: boolean; orders?: Order[] };
  } catch {
    return null;
  }
}

const fetchDeskOrdersFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ payload: string }>(
      "select payload from store_orders order by updated_at desc limit 80",
    );
    const fromSql = rows.map((row) => parseOrder(row.payload)).filter((o): o is Order => Boolean(o));
    const fromMem = [...memory().values()].map(parseOrder).filter((o): o is Order => Boolean(o));
    const map = new Map<string, Order>();
    for (const order of [...fromMem, ...fromSql]) map.set(order.id, order);
    return [...map.values()];
  } catch {
    return [...memory().values()].map(parseOrder).filter((o): o is Order => Boolean(o));
  }
});

const saveDeskOrderFn = createServerFn({ method: "POST" })
  .validator((data: Order) => data)
  .handler(async ({ data }) => {
    if (!data?.id) return { ok: false as const };
    memory().set(data.id, JSON.stringify(data));
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      await sql.query(
        `insert into store_orders (id, payload, updated_at)
         values ($1, $2, now())
         on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
        [data.id, JSON.stringify(data)],
      );
    } catch {
      /* preview memory still holds it */
    }
    return { ok: true as const };
  });

export async function fetchDeskOrders(): Promise<Order[]> {
  const api = await apiDesk({ op: "list" });
  if (Array.isArray(api?.orders)) return api.orders;
  try {
    return await fetchDeskOrdersFn();
  } catch {
    return [];
  }
}

export async function saveDeskOrder(order: Order) {
  if (!order?.id) return { ok: false as const };
  const api = await apiDesk({ op: "save", order });
  if (api?.ok) return { ok: true as const };
  try {
    return await saveDeskOrderFn({ data: order });
  } catch {
    return { ok: false as const };
  }
}
