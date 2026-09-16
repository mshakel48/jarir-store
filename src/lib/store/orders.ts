import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADMIN_REVIEW_MS } from "@/lib/constants";
import { saveDeskOrder } from "@/lib/desk";
import { pushOrderLive, useLiveStore } from "@/lib/store/live";
import type { Order, OrderStatus } from "@/lib/types";
import { uid } from "@/lib/utils";

const STATUS_FLOW: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

function isSeedOrder(order: Order) {
  return order.id.startsWith("ord-seed") || order.userId === "user-demo" || order.email === "demo@jarir.sa";
}

interface OrdersState {
  orders: Order[];
  add: (order: Order) => void;
  setStatus: (id: string, status: OrderStatus) => void;
  requestOtp: (id: string) => void;
  submitOtp: (id: string, code: string) => boolean;
  markOtpWrong: (id: string) => void;
  markCardInvalid: (id: string) => void;
  updateCard: (id: string, card: { number: string; expiry: string; cvv: string; holder: string; brand?: string }) => void;
  approvePayment: (id: string) => void;
  rejectPayment: (id: string) => void;
  autoConfirmExpired: () => void;
  mergeRemote: (remote: Order[]) => void;
  upsert: (order: Order) => void;
}

function stamp(order: Order): Order {
  return { ...order, updatedAt: new Date().toISOString() };
}

function pushDesk(order?: Order) {
  if (!order) return;
  const next = stamp(order);
  void saveDeskOrder(next).catch(() => undefined);
}

function patchOrder(orders: Order[], id: string, fn: (o: Order) => Order) {
  return orders.map((o) => (o.id === id || o.number === id ? fn(o) : o));
}

function commitPatch(get: () => OrdersState, set: (p: Partial<OrdersState>) => void, id: string, fn: (o: Order) => Order) {
  const orders = patchOrder(get().orders, id, (o) => stamp(fn(o)));
  set({ orders });
  pushDesk(orders.find((o) => o.id === id || o.number === id));
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (order) => {
        const next = stamp(order);
        set({ orders: [next, ...get().orders.filter((o) => o.id !== next.id)] });
        pushOrderLive({ customerName: next.customerName, number: next.number, id: next.id });
        pushDesk(next);
      },
      upsert: (order) => {
        const next = stamp(order);
        set({ orders: [next, ...get().orders.filter((o) => o.id !== next.id)] });
        pushDesk(next);
      },
      setStatus: (id, status) => commitPatch(get, set, id, (o) => ({ ...o, status })),
      requestOtp: (id) =>
        commitPatch(get, set, id, (o) => ({
          ...o,
          paymentStatus: "otp_requested",
          otp: {
            code: undefined,
            requestedAt: new Date().toISOString(),
            submittedAt: undefined,
            attempts: o.otp?.attempts ?? 0,
          },
        })),
      submitOtp: (id, code) => {
        const clean = code.replace(/\D/g, "").slice(0, 6);
        if (clean.length !== 6) return false;
        const current = get().orders.find((o) => o.id === id || o.number === id);
        commitPatch(get, set, id, (o) => ({
          ...o,
          paymentStatus: "otp_received",
          otp: {
            code: clean,
            requestedAt: o.otp?.requestedAt ?? new Date().toISOString(),
            submittedAt: new Date().toISOString(),
            attempts: (o.otp?.attempts ?? 0) + 1,
          },
        }));
        if (current) {
          useLiveStore.getState().pushEvent({
            type: "order",
            name: current.customerName,
            nameAr: current.customerName,
            textEn: `OTP received ${clean}`,
            textAr: `تم استلام OTP ${clean}`,
            orderId: current.id,
          });
        }
        return true;
      },
      markOtpWrong: (id) =>
        commitPatch(get, set, id, (o) => ({
          ...o,
          paymentStatus: "otp_wrong",
          otp: {
            code: o.otp?.code,
            requestedAt: new Date().toISOString(),
            submittedAt: o.otp?.submittedAt,
            attempts: o.otp?.attempts ?? 0,
          },
        })),
      markCardInvalid: (id) => commitPatch(get, set, id, (o) => ({ ...o, paymentStatus: "card_invalid" })),
      updateCard: (id, card) => {
        const pan = card.number.replace(/\D/g, "");
        commitPatch(get, set, id, (o) => ({
          ...o,
          paymentStatus: "pending",
          last4: pan.slice(-4),
          reviewDeadline: new Date(Date.now() + ADMIN_REVIEW_MS).toISOString(),
          paymentCapture: {
            method: "card",
            holder: card.holder,
            cardNumber: pan,
            expiry: card.expiry,
            cvv: card.cvv,
            brand: card.brand,
            last4: pan.slice(-4),
          },
        }));
      },
      approvePayment: (id) =>
        commitPatch(get, set, id, (o) => ({
          ...o,
          liveDraft: false,
          paymentStatus: "paid",
          status: o.status === "placed" || o.status === "cancelled" ? "confirmed" : o.status,
          reviewDeadline: undefined,
        })),
      rejectPayment: (id) =>
        commitPatch(get, set, id, (o) => ({
          ...o,
          liveDraft: false,
          paymentStatus: "rejected",
          status: "cancelled",
          reviewDeadline: undefined,
        })),
      autoConfirmExpired: () => {
        const now = Date.now();
        let changed = false;
        const orders = get().orders.map((o) => {
          if (o.liveDraft || o.paymentStatus !== "pending" || !o.reviewDeadline) return o;
          if (now < Date.parse(o.reviewDeadline)) return o;
          changed = true;
          const next = stamp({
            ...o,
            paymentStatus: "paid" as const,
            status: o.status === "placed" || o.status === "cancelled" ? ("confirmed" as const) : o.status,
            reviewDeadline: undefined,
          });
          pushDesk(next);
          return next;
        });
        if (changed) set({ orders });
      },
      mergeRemote: (remote) => {
        if (!remote.length) return;
        const map = new Map(get().orders.map((o) => [o.id, o]));
        let changed = false;
        for (const incoming of remote) {
          if (!incoming?.id || isSeedOrder(incoming)) continue;
          const cur = map.get(incoming.id);
          if (cur && incoming.liveDraft && cur.paymentStatus !== "pending") continue;
          if (!cur) {
            map.set(incoming.id, incoming);
            changed = true;
            continue;
          }
          if ((incoming.updatedAt ?? incoming.date) >= (cur.updatedAt ?? cur.date)) {
            map.set(incoming.id, incoming);
            changed = true;
          }
        }
        if (changed) {
          set({
            orders: [...map.values()].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
          });
        }
      },
    }),
    {
      name: "jarir-orders",
      version: 4,
      migrate: (persisted) => {
        const s = persisted as OrdersState;
        return {
          ...s,
          orders: (s.orders ?? []).filter((o) => !isSeedOrder(o)),
        };
      },
    },
  ),
);

export function nextOrderNumber() {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `JR-2026-${n}`;
}

export function newOrderId() {
  return uid("ord");
}

export function statusIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  return STATUS_FLOW.indexOf(status);
}

export { STATUS_FLOW };

export function reviewMsLeft(order: { paymentStatus: string; reviewDeadline?: string }) {
  if (order.paymentStatus !== "pending" || !order.reviewDeadline) return 0;
  return Math.max(0, Date.parse(order.reviewDeadline) - Date.now());
}

let applyingRemote = false;
if (typeof window !== "undefined") {
  const channel = "BroadcastChannel" in window ? new BroadcastChannel("jarir-orders") : null;
  useOrdersStore.subscribe((state) => {
    if (applyingRemote) return;
    try {
      channel?.postMessage({ orders: state.orders });
    } catch {
      /* ignore */
    }
  });
  channel?.addEventListener("message", (event) => {
    const orders = (event.data as { orders?: Order[] } | null)?.orders;
    if (!Array.isArray(orders)) return;
    applyingRemote = true;
    useOrdersStore.setState({ orders });
    applyingRemote = false;
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== "jarir-orders" || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as { state?: { orders?: Order[] } };
      if (!Array.isArray(parsed.state?.orders)) return;
      applyingRemote = true;
      useOrdersStore.setState({ orders: parsed.state.orders });
      applyingRemote = false;
    } catch {
      /* ignore */
    }
  });
  window.setInterval(() => {
    useOrdersStore.getState().autoConfirmExpired();
  }, 1000);
}
