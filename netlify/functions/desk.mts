import { getStore } from "@netlify/blobs";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,HEAD,POST,OPTIONS",
  "access-control-max-age": "86400",
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

async function readBody(req: Request) {
  const text = await req.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export default async (req: Request) => {
  if (req.method === "OPTIONS" || req.method === "HEAD") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const store = getStore({ name: "jarir-desk", consistency: "strong" });
    const body = req.method === "POST" ? await readBody(req) : {};
    const op = (body as { op?: string }).op || "list";

    if (op === "replace" && Array.isArray((body as { orders?: unknown[] }).orders)) {
      const next = ((body as { orders: unknown[] }).orders as unknown[]).slice(0, 80);
      await store.setJSON("orders", next);
      return Response.json({ ok: true, orders: next }, { headers: cors });
    }

    if (op === "save" && (body as { order?: { id?: string } }).order?.id) {
      const order = (body as { order: unknown }).order;
      const current = (await store.get("orders", { type: "json" })) || [];
      const list = Array.isArray(current) ? current : [];
      const next = [order, ...list.filter((item: { id?: string }) => item?.id !== (order as { id: string }).id)].slice(0, 80);
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
