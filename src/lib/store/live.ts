import { PRODUCTS } from "@/lib/data/products";
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

const BOTS: Omit<LiveVisitor, "page" | "cartCount" | "cartValue" | "lastSeen" | "activity" | "real">[] = [
  { id: "live-fahad", name: "Fahad Al-Qahtani", nameAr: "فهد القحطاني", email: "fahad.q@gmail.com", phone: "+966 54 812 3301", city: "riyadh" },
  { id: "live-noura", name: "Noura Al-Shammari", nameAr: "نورة الشمري", email: "noura.s@outlook.com", phone: "+966 55 441 2290", city: "jeddah" },
  { id: "live-abdullah", name: "Abdullah Al-Ghamdi", nameAr: "عبدالله الغامدي", email: "a.ghamdi@gmail.com", phone: "+966 56 102 8844", city: "dammam" },
  { id: "live-layan", name: "Layan Al-Harbi", nameAr: "ليان الحربي", email: "layan.h@gmail.com", phone: "+966 53 778 1204", city: "riyadh" },
  { id: "live-mohammed", name: "Mohammed Al-Otaibi", nameAr: "محمد العتيبي", email: "m.otaibi@gmail.com", phone: "+966 50 933 6612", city: "mecca" },
  { id: "live-hind", name: "Hind Al-Subaie", nameAr: "هند السبيعي", email: "hind.s@icloud.com", phone: "+966 58 204 7719", city: "khobar" },
  { id: "live-yousef", name: "Yousef Al-Dosari", nameAr: "يوسف الدوسري", email: "y.dosari@gmail.com", phone: "+966 54 667 3088", city: "jeddah" },
  { id: "live-reem", name: "Reem Al-Mutairi", nameAr: "ريم المطيري", email: "reem.m@gmail.com", phone: "+966 55 019 4473", city: "medina" },
  { id: "live-sultan", name: "Sultan Al-Shehri", nameAr: "سلطان الشهري", email: "sultan.sh@gmail.com", phone: "+966 59 331 8056", city: "abha" },
  { id: "live-joud", name: "Joud Al-Anzi", nameAr: "جود العنزي", email: "joud.a@gmail.com", phone: "+966 57 882 1140", city: "tabuk" },
];

function productPage(): LivePage {
  const p = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]!;
  return { path: `/products/${p.id}`, labelEn: p.name, labelAr: p.arabicName };
}

function randomPage(): { page: LivePage; activity: LiveActivity } {
  const roll = Math.random();
  if (roll < 0.42) return { page: productPage(), activity: "browsing" };
  if (roll < 0.58) return { page: { path: "/", labelEn: "Home", labelAr: "الرئيسية" }, activity: "browsing" };
  if (roll < 0.7) return { page: { path: "/category/laptops", labelEn: "Laptops", labelAr: "أجهزة لابتوب" }, activity: "browsing" };
  if (roll < 0.82) return { page: { path: "/cart", labelEn: "Cart", labelAr: "السلة" }, activity: "cart" };
  if (roll < 0.92) return { page: { path: "/checkout", labelEn: "Checkout", labelAr: "إتمام الطلب" }, activity: "checkout" };
  return { page: { path: "/account", labelEn: "Account", labelAr: "الحساب" }, activity: "account" };
}

function seedBots(): LiveVisitor[] {
  return BOTS.map((bot) => {
    const { page, activity } = randomPage();
    return {
      ...bot,
      page,
      activity,
      cartCount: activity === "cart" || activity === "checkout" ? 1 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2),
      cartValue: Math.round((80 + Math.random() * 2400) * 100) / 100,
      lastSeen: Date.now(),
      real: false,
    };
  });
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
  const { visitors, pushEvent } = useLiveStore.getState();
  const bots = visitors.filter((v) => !v.real);
  const real = visitors.filter((v) => v.real && Date.now() - v.lastSeen < 15000);
  const nextBots = bots.map((bot) => {
    if (Math.random() > 0.35) return { ...bot, lastSeen: Date.now() };
    const { page, activity } = randomPage();
    const updated: LiveVisitor = {
      ...bot,
      page,
      activity,
      cartCount: activity === "cart" || activity === "checkout" ? Math.max(1, bot.cartCount || 1) : bot.cartCount,
      lastSeen: Date.now(),
    };
    if (Math.random() < 0.25) {
      pushEvent({
        type: activity === "cart" ? "cart" : "view",
        name: bot.name,
        nameAr: bot.nameAr,
        textEn: activity === "cart" ? `Added an item · ${page.labelEn}` : `Viewing ${page.labelEn}`,
        textAr: activity === "cart" ? `أضاف منتجاً · ${page.labelAr}` : `يتصفح ${page.labelAr}`,
      });
    }
    return updated;
  });
  useLiveStore.setState({ visitors: [...real, ...nextBots] });
}

export function startLiveEngine() {
  if (typeof window === "undefined") return;
  if (useLiveStore.getState().started) return;
  useLiveStore.setState({ started: true, visitors: seedBots() });
  timer = window.setInterval(tick, 2200);
  try {
    channel = new BroadcastChannel("jarir-live");
    channel.onmessage = (msg: MessageEvent) => {
      const data = msg.data as { kind: string; visitor?: LiveVisitor; id?: string; event?: LiveEvent };
      if (data.kind === "visitor" && data.visitor) {
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
