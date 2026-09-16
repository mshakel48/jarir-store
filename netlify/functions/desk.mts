import { getStore } from "@netlify/blobs";

export default async (req: Request) => {
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
  if (req.method === "OPTIONS") return new Response("", { status: 204, headers });

  try {
    const store = getStore({ name: "jarir-desk", consistency: "strong" });
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const op = body?.op || "list";

    if (op === "save" && body?.order?.id) {
      const current = (await store.get("orders", { type: "json" })) || [];
      const list = Array.isArray(current) ? current : [];
      const next = [body.order, ...list.filter((item: { id?: string }) => item?.id !== body.order.id)].slice(0, 80);
      await store.setJSON("orders", next);
      return Response.json({ ok: true, orders: next }, { headers });
    }

    const orders = (await store.get("orders", { type: "json" })) || [];
    return Response.json({ ok: true, orders: Array.isArray(orders) ? orders : [] }, { headers });
  } catch (error) {
    return Response.json(
      { ok: false, error: String((error as Error)?.message || error) },
      { status: 500, headers },
    );
  }
};

export const config = {
  path: "/api/desk",
};
