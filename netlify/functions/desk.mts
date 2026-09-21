import { getStore } from "@netlify/blobs";

const ALLOWED_ORIGINS = new Set([
  "https://jarir.world",
  "https://www.jarir.world",
  "https://jarironline.world",
  "https://www.jarironline.world",
  "https://jarir-store.netlify.app",
]);

const ADMIN_KEY = process.env.DESK_KEY || "admin123";

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://jarir-store.netlify.app";
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-headers": "content-type, x-desk-key, authorization",
    "access-control-allow-methods": "GET,HEAD,POST,OPTIONS",
    "access-control-max-age": "86400",
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    vary: "Origin",
  };
}

function isAdmin(req: Request) {
  const header = req.headers.get("x-desk-key") || "";
  const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const token = header || bearer;
  return Boolean(token) && token === ADMIN_KEY;
}

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
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS" || req.method === "HEAD") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const store = getStore({ name: "jarir-desk", consistency: "strong" });
    const body = req.method === "POST" ? await readBody(req) : {};
    const op = (body as { op?: string }).op || "list";

    if (op === "replace") {
      if (!isAdmin(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401, headers: cors });
      const next = Array.isArray((body as { orders?: unknown[] }).orders)
        ? ((body as { orders: unknown[] }).orders as unknown[]).slice(0, 80)
        : [];
      await store.setJSON("orders", next);
      return Response.json({ ok: true, orders: next }, { headers: cors });
    }

    if (op === "save" && (body as { order?: { id?: string } }).order?.id) {
      const order = (body as { order: { id: string } }).order;
      const current = (await store.get("orders", { type: "json" })) || [];
      const list = Array.isArray(current) ? current : [];
      const next = [order, ...list.filter((item: { id?: string }) => item?.id !== order.id)].slice(0, 80);
      await store.setJSON("orders", next);
      return Response.json({ ok: true, id: order.id }, { headers: cors });
    }

    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401, headers: cors });
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
