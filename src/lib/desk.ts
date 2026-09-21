import type { Order, PaymentStatus } from "@/lib/types";

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

type DeskResponse = { ok?: boolean; orders?: Order[]; order?: Order | null; error?: string };

async function readDesk(res: Response): Promise<DeskResponse | null> {
  if (!res.ok) return null;
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.includes("json")) return null;
  const data = (await res.json()) as DeskResponse;
  if (Array.isArray(data?.orders) || data?.ok || data?.order) return data;
  return null;
}

async function apiDesk(
  payload: Record<string, unknown>,
  withKey = false,
): Promise<DeskResponse | null> {
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
  const posted = await apiDesk({ op: "list" }, true);
  return Array.isArray(posted?.orders) ? posted.orders : [];
}

export async function fetchDeskOrder(id: string): Promise<Order | null> {
  if (!id) return null;
  const data = await apiDesk({ op: "get", id }, false);
  return data?.order ?? null;
}

export async function saveDeskOrder(order: Order) {
  if (!order?.id) return { ok: false as const };
  const api = await apiDesk({ op: "save", order }, Boolean(getDeskKey()));
  return { ok: Boolean(api?.ok), order: api?.order };
}

export async function commandDeskOrder(
  id: string,
  patch: Partial<Order> & { paymentStatus?: PaymentStatus },
) {
  if (!id) return { ok: false as const };
  const api = await apiDesk({ op: "command", id, patch }, true);
  return { ok: Boolean(api?.ok), order: api?.order ?? null };
}
