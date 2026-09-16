import { getStore } from "@netlify/blobs";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("", { status: 204, headers: cors });

  try {
    const store = getStore({ name: "jarir-desk", consistency: "strong" });
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const op = body?.op || "list";

    if (op === "replace" && Array.isArray(body?.orders)) {
      const next = body.orders.slice(0, 80);
      await store.setJSON("orders", next);
      return Response.json({ ok: true, orders: next }, { headers: cors });
    }

    if (op === "save" && body?.order?.id) {
      const current = (await store.get("orders", { type: "json" })) || [];
      const list = Array.isArray(current) ? current : [];
      const next = [body.order, ...list.filter((item: { id?: string }) => item?.id !== body.order.id)].slice(0, 80);
      await store.setJSON("orders", next);
      return Response.json({ ok: true, orders: next }, { headers: cors });
    }

    const orders = (await store.get("orders", { type: "json" })) || [];
    return Response.json({ ok: true, orders: Array.isArray(orders) ? orders : [] }, { headers: cors });
  } catch (error) {
    return Response.json(
      { ok: false, error: String((error as Error)?.message || error) },
      { status: 500, headers: cors },
    );
  }
};

export const config = {
  path: "/api/desk",
};
