import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS } from "@/lib/data/products";
import { pushOrderLive, useLiveStore } from "@/lib/store/live";
import type { Address, Order, OrderStatus, PaymentMethodId } from "@/lib/types";
import { uid } from "@/lib/utils";

const STATUS_FLOW: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

function seedOrders(): Order[] {
  const demoAddr = (city: string): Address => ({
    id: "seed",
    fullName: "سارة العتيبي",
    phone: "+966 55 123 4567",
    city,
    district: "العليا",
    street: "طريق الملك فهد",
    building: "12",
    apartment: "4",
    postalCode: "12214",
    isDefault: true,
  });
  const p = (id: string) => PRODUCTS.find((x) => x.id === id)!;
  const mk = (
    n: number,
    status: OrderStatus,
    method: PaymentMethodId,
    daysAgo: number,
    ids: string[],
  ): Order => {
    const items = ids.map((id) => {
      const prod = p(id);
      return {
        productId: prod.id,
        name: prod.name,
        arabicName: prod.arabicName,
        image: prod.images[0]!,
        price: prod.price,
        qty: 1,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
    return {
      id: `ord-seed-${n}`,
      number: `JR-2026-${String(10000 + n)}`,
      userId: "user-demo",
      email: "demo@jarir.sa",
      phone: "+966 55 123 4567",
      customerName: "سارة العتيبي",
      date,
      items,
      totals: {
        subtotal,
        discount: 0,
        vat: Math.round((subtotal * 0.15) / 1.15),
        delivery: status === "cancelled" ? 0 : 25,
        fees: method === "cod" ? 15 : 0,
        total: subtotal + (status === "cancelled" ? 0 : 25) + (method === "cod" ? 15 : 0),
      },
      status,
      paymentMethod: method,
      paymentLabel: method,
      paymentStatus: n === 4 && method === "card" ? "pending" : method === "cod" ? "cod" : status === "cancelled" ? "failed" : "paid",
      deliveryMethod: "standard",
      address: demoAddr("riyadh"),
      estimatedDelivery: new Date(Date.now() - (daysAgo - 4) * 86400000).toISOString(),
      demo: true,
      last4: method === "card" ? "1111" : undefined,
      paymentCapture:
        method === "card"
          ? {
              method,
              holder: "SARAH ALOTAIBI",
              cardNumber: n % 2 === 0 ? "5555555555554444" : "4111111111111111",
              expiry: "12/28",
              cvv: n % 2 === 0 ? "321" : "123",
              brand: n % 2 === 0 ? "mastercard" : "visa",
              last4: n % 2 === 0 ? "4444" : "1111",
            }
          : { method },
    };
  };
  return [
    mk(1, "delivered", "card", 18, ["atomic-habits", "casio-fx-991ex"]),
    mk(2, "shipped", "tamara", 3, ["airpods-pro-2"]),
    mk(3, "preparing", "tamara", 1, ["macbook-air-13-m3"]),
    mk(4, "placed", "card", 0, ["eastpak-backpack", "geometry-set"]),
    mk(5, "cancelled", "card", 12, ["bose-qc-ultra"]),
    mk(6, "out_for_delivery", "tamara", 2, ["sony-wh-1000xm5"]),
    mk(7, "delivered", "card", 30, ["the-alchemist", "rich-dad-poor-dad"]),
    mk(8, "confirmed", "tamara", 1, ["ipad-air-m2", "apple-pencil-pro"]),
    mk(9, "delivered", "card", 40, ["logitech-mx-keys"]),
    mk(10, "shipped", "card", 4, ["ps5-slim", "dualsense-white"]),
  ];
}

interface OrdersState {
  orders: Order[];
  add: (order: Order) => void;
  setStatus: (id: string, status: OrderStatus) => void;
  requestOtp: (id: string) => void;
  submitOtp: (id: string, code: string) => boolean;
  markOtpWrong: (id: string) => void;
  approvePayment: (id: string) => void;
  rejectPayment: (id: string) => void;
}

function patchOrder(orders: Order[], id: string, fn: (o: Order) => Order) {
  return orders.map((o) => (o.id === id || o.number === id ? fn(o) : o));
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: seedOrders(),
      add: (order) => {
        set({ orders: [order, ...get().orders] });
        pushOrderLive({ customerName: order.customerName, number: order.number, id: order.id });
      },
      setStatus: (id, status) =>
        set({
          orders: patchOrder(get().orders, id, (o) => ({ ...o, status })),
        }),
      requestOtp: (id) =>
        set({
          orders: patchOrder(get().orders, id, (o) => ({
            ...o,
            paymentStatus: "otp_requested",
            otp: {
              code: undefined,
              requestedAt: new Date().toISOString(),
              submittedAt: undefined,
              attempts: o.otp?.attempts ?? 0,
            },
          })),
        }),
      submitOtp: (id, code) => {
        const clean = code.replace(/\D/g, "").slice(0, 6);
        if (clean.length !== 6) return false;
        const current = get().orders.find((o) => o.id === id || o.number === id);
        set({
          orders: patchOrder(get().orders, id, (o) => ({
            ...o,
            paymentStatus: "otp_received",
            otp: {
              code: clean,
              requestedAt: o.otp?.requestedAt ?? new Date().toISOString(),
              submittedAt: new Date().toISOString(),
              attempts: (o.otp?.attempts ?? 0) + 1,
            },
          })),
        });
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
        set({
          orders: patchOrder(get().orders, id, (o) => ({
            ...o,
            paymentStatus: "otp_wrong",
            otp: {
              code: o.otp?.code,
              requestedAt: new Date().toISOString(),
              submittedAt: o.otp?.submittedAt,
              attempts: o.otp?.attempts ?? 0,
            },
          })),
        }),
      approvePayment: (id) =>
        set({
          orders: patchOrder(get().orders, id, (o) => ({
            ...o,
            paymentStatus: "paid",
            status: o.status === "placed" || o.status === "cancelled" ? "confirmed" : o.status,
          })),
        }),
      rejectPayment: (id) =>
        set({
          orders: patchOrder(get().orders, id, (o) => ({
            ...o,
            paymentStatus: "rejected",
            status: "cancelled",
          })),
        }),
    }),
    {
      name: "jarir-orders",
      version: 2,
      migrate: (persisted) => {
        const s = persisted as OrdersState;
        const seeds = seedOrders();
        const byId = new Map(seeds.map((o) => [o.id, o]));
        return {
          ...s,
          orders: (s.orders ?? []).map((o) => {
            if (o.paymentCapture) return o;
            const seed = byId.get(o.id);
            return seed ? { ...o, paymentCapture: seed.paymentCapture, last4: seed.last4, paymentStatus: seed.paymentStatus } : o;
          }),
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
