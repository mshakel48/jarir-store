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

export const fetchDeskOrders = createServerFn({ method: "POST" }).handler(async () => {
  const fromMem = [...memory().values()].map(parseOrder).filter((o): o is Order => Boolean(o));
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ payload: string }>(
      "select payload from store_orders order by updated_at desc limit 80",
    );
    const fromDb = rows.map((row) => parseOrder(row.payload)).filter((o): o is Order => Boolean(o));
    const map = new Map<string, Order>();
    for (const order of [...fromMem, ...fromDb]) map.set(order.id, order);
    return [...map.values()].sort((a, b) => +new Date(b.updatedAt ?? b.date) - +new Date(a.updatedAt ?? a.date));
  } catch {
    return fromMem;
  }
});

export const saveDeskOrder = createServerFn({ method: "POST" })
  .validator((data: Order) => data)
  .handler(async ({ data }) => {
    if (!data?.id) return { ok: false as const };
    const payload = JSON.stringify(data);
    memory().set(data.id, payload);
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      await sql.query(
        `insert into store_orders (id, payload, updated_at)
         values ($1, $2, now())
         on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
        [data.id, payload],
      );
    } catch {
      /* memory still holds it for this process */
    }
    return { ok: true as const };
  });
