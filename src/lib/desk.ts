import type { Order } from "@/lib/types";

const DESK_URLS = ["/api/desk", "https://jarir-store.netlify.app/api/desk"];
const DESK_KEY_NAME = "jarir-desk-key";

export function setDeskKey(key: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(DESK_KEY_NAME, key);
}

export function clearDeskKey() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(DESK_KEY_NAME);
}

export function getDeskKey() {
  if (typeof sessionStorage === "undefined") return "";
  return sessionStorage.getItem(DESK_KEY_NAME) || "";
}

function deskHeaders(withKey: boolean): HeadersInit {
  const headers: Record<string, string> = {
    "content-type": "text/plain;charset=UTF-8",
  };
  if (withKey) {
    const key = getDeskKey();
    if (key) headers["x-desk-key"] = key;
  }
  return headers;
}

async function readDesk(res: Response): Promise<{ ok?: boolean; orders?: Order[] } | null> {
  if (!res.ok) return null;
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.includes("json")) return null;
  const data = (await res.json()) as { ok?: boolean; orders?: Order[] };
  if (Array.isArray(data?.orders) || data?.ok) return data;
  return null;
}

async function apiDesk(
  payload: { op: "list" | "save" | "replace"; order?: Order; orders?: Order[] },
  withKey = false,
): Promise<{ ok?: boolean; orders?: Order[] } | null> {
  const body = JSON.stringify(payload);
  for (const url of DESK_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: deskHeaders(withKey),
        body,
        keepalive: true,
        mode: "cors",
        cache: "no-store",
      });
      const data = await readDesk(res);
      if (data) return data;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function fetchDeskOrders(): Promise<Order[]> {
  const key = getDeskKey();
  if (!key) return [];
  for (const url of DESK_URLS) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "x-desk-key": key },
        mode: "cors",
        cache: "no-store",
      });
      const data = await readDesk(res);
      if (Array.isArray(data?.orders)) return data.orders;
    } catch {
      /* try next */
    }
  }
  const posted = await apiDesk({ op: "list" }, true);
  return Array.isArray(posted?.orders) ? posted.orders : [];
}

export async function saveDeskOrder(order: Order) {
  if (!order?.id) return { ok: false as const };
  const api = await apiDesk({ op: "save", order });
  return { ok: Boolean(api?.ok) as true | false };
}
