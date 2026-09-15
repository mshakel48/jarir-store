import { uid } from "@/lib/utils";
import { create } from "zustand";

export type LiveActivity = "browsing" | "cart" | "checkout" | "account";

export interface LivePage {
  path: string;
  labelEn: string;
  labelAr: string;
}

export interface LiveVisitor {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  city: string;
  page: LivePage;
  cartCount: number;
  cartValue: number;
  lastSeen: number;
  activity: LiveActivity;
  real: boolean;
}

export interface LiveEvent {
  id: string;
  at: number;
  type: "view" | "cart" | "order" | "join";
  name: string;
  nameAr: string;
  textEn: string;
  textAr: string;
  orderId?: string;
}

interface LiveState {
  visitors: LiveVisitor[];
  events: LiveEvent[];
  started: boolean;
  upsertVisitor: (visitor: LiveVisitor) => void;
  dropVisitor: (id: string) => void;
  pushEvent: (event: Omit<LiveEvent, "id" | "at">) => void;
}

let timer: number | undefined;
let channel: BroadcastChannel | null = null;

export const useLiveStore = create<LiveState>((set, get) => ({
  visitors: [],
  events: [],
  started: false,
  upsertVisitor: (visitor) => {
    const visitors = get().visitors.filter((v) => v.id !== visitor.id);
    set({ visitors: [visitor, ...visitors].slice(0, 40) });
    channel?.postMessage({ kind: "visitor", visitor });
  },
  dropVisitor: (id) => {
    set({ visitors: get().visitors.filter((v) => v.id !== id) });
    channel?.postMessage({ kind: "drop", id });
  },
  pushEvent: (event) => {
    const next: LiveEvent = { ...event, id: uid("evt"), at: Date.now() };
    set({ events: [next, ...get().events].slice(0, 40) });
    channel?.postMessage({ kind: "event", event: next });
  },
}));

function tick() {
  const visitors = useLiveStore.getState().visitors.filter((v) => v.real && Date.now() - v.lastSeen < 45000);
  useLiveStore.setState({ visitors });
}

export function startLiveEngine() {
  if (typeof window === "undefined") return;
  if (useLiveStore.getState().started) return;
  useLiveStore.setState({
    started: true,
    visitors: useLiveStore.getState().visitors.filter((v) => v.real),
    events: useLiveStore.getState().events.filter((e) => e.type === "order"),
  });
  timer = window.setInterval(tick, 2200);
  try {
    channel = new BroadcastChannel("jarir-live");
    channel.onmessage = (msg: MessageEvent) => {
      const data = msg.data as { kind: string; visitor?: LiveVisitor; id?: string; event?: LiveEvent };
      if (data.kind === "visitor" && data.visitor?.real) {
        const visitors = useLiveStore.getState().visitors.filter((v) => v.id !== data.visitor!.id);
        useLiveStore.setState({ visitors: [data.visitor, ...visitors].slice(0, 40) });
      }
      if (data.kind === "drop" && data.id) {
        useLiveStore.setState({ visitors: useLiveStore.getState().visitors.filter((v) => v.id !== data.id) });
      }
      if (data.kind === "event" && data.event) {
        const events = useLiveStore.getState().events.filter((e) => e.id !== data.event!.id);
        useLiveStore.setState({ events: [data.event, ...events].slice(0, 40) });
      }
    };
  } catch {
    channel = null;
  }
}

export function stopLiveEngine() {
  if (timer) window.clearInterval(timer);
  timer = undefined;
  channel?.close();
  channel = null;
}

export function pageFromPath(path: string, localeName?: { en: string; ar: string }): LivePage {
  if (path.startsWith("/cart")) return { path, labelEn: "Cart", labelAr: "السلة" };
  if (path.startsWith("/checkout")) return { path, labelEn: "Checkout", labelAr: "إتمام الطلب" };
  if (path.startsWith("/account")) return { path, labelEn: "Account", labelAr: "الحساب" };
  if (path.startsWith("/wishlist")) return { path, labelEn: "Wishlist", labelAr: "المفضلة" };
  if (path.startsWith("/products/") && localeName) return { path, labelEn: localeName.en, labelAr: localeName.ar };
  if (path.startsWith("/category/")) return { path, labelEn: "Category", labelAr: "تصنيف" };
  if (path === "/" || path === "") return { path: "/", labelEn: "Home", labelAr: "الرئيسية" };
  return { path, labelEn: path, labelAr: path };
}

export function activityFromPath(path: string): LiveActivity {
  if (path.startsWith("/cart")) return "cart";
  if (path.startsWith("/checkout")) return "checkout";
  if (path.startsWith("/account") || path.startsWith("/login")) return "account";
  return "browsing";
}

export function pushOrderLive(order: { customerName: string; number: string; id: string }) {
  useLiveStore.getState().pushEvent({
    type: "order",
    name: order.customerName,
    nameAr: order.customerName,
    textEn: `New order ${order.number}`,
    textAr: `طلب جديد ${order.number}`,
    orderId: order.id,
  });
}
