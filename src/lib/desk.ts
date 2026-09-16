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

function mergeOrders(groups: Order[][]) {
  const map = new Map<string, Order>();
  for (const group of groups) {
    for (const order of group) {
      if (!order?.id) continue;
      const cur = map.get(order.id);
      if (!cur || (order.updatedAt ?? order.date) >= (cur.updatedAt ?? cur.date)) {
        map.set(order.id, order);
      }
    }
  }
  return [...map.values()].sort((a, b) => +new Date(b.updatedAt ?? b.date) - +new Date(a.updatedAt ?? a.date)).slice(0, 80);
}

async function blobRead(): Promise<Order[] | null> {
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("jarir-desk");
    const raw = await store.get("orders", { type: "json" });
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as Order[];
    return [];
  } catch {
    return null;
  }
}

async function blobWrite(orders: Order[]) {
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("jarir-desk");
    await store.setJSON("orders", orders);
    return true;
  } catch {
    return false;
  }
}

async function sqlRead(): Promise<Order[]> {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ payload: string }>(
      "select payload from store_orders order by updated_at desc limit 80",
    );
    return rows.map((row) => parseOrder(row.payload)).filter((o): o is Order => Boolean(o));
  } catch {
    return [];
  }
}

async function sqlWrite(order: Order) {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(
      `insert into store_orders (id, payload, updated_at)
       values ($1, $2, now())
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
      [order.id, JSON.stringify(order)],
    );
  } catch {
    /* optional */
  }
}

export const fetchDeskOrders = createServerFn({ method: "POST" }).handler(async () => {
  const fromMem = [...memory().values()].map(parseOrder).filter((o): o is Order => Boolean(o));
  const fromSql = await sqlRead();
  const fromBlob = await blobRead();
  return mergeOrders([fromMem, fromSql, fromBlob ?? []]);
});

export const saveDeskOrder = createServerFn({ method: "POST" })
  .validator((data: Order) => data)
  .handler(async ({ data }) => {
    if (!data?.id) return { ok: false as const };
    memory().set(data.id, JSON.stringify(data));
    await sqlWrite(data);
    const current = await blobRead();
    const next = mergeOrders([current ?? [], [data]]);
    await blobWrite(next);
    return { ok: true as const };
  });
