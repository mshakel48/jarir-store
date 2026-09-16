import { getStore } from "@netlify/blobs";

const headers = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "cache-control": "no-store",
};

function json(data, status = 200) {
  return { statusCode: status, headers, body: JSON.stringify(data) };
}

async function readOrders(store) {
  const raw = await store.get("orders", { type: "json" });
  return Array.isArray(raw) ? raw : [];
}

async function handle(op, order) {
  const store = getStore("jarir-desk");
  if (op === "save" && order?.id) {
    const current = await readOrders(store);
    const next = [order, ...current.filter((item) => item?.id !== order.id)].slice(0, 80);
    await store.setJSON("orders", next);
    return json({ ok: true, orders: next });
  }
  const orders = await readOrders(store);
  return json({ ok: true, orders });
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const op = body.op || (event.httpMethod === "GET" ? "list" : "list");
    return await handle(op, body.order);
  } catch (error) {
    return json({ ok: false, error: String(error?.message || error) }, 500);
  }
};

export default async (req) => {
  if (req.method === "OPTIONS") return new Response("", { status: 204, headers });
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const result = await handle(body.op || "list", body.order);
    return new Response(result.body, { status: result.statusCode, headers });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error?.message || error) }), {
      status: 500,
      headers,
    });
  }
};

export const config = {
  path: "/api/desk",
};
