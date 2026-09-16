import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { findCoupon } from "@/lib/data/coupons";
import { getProduct } from "@/lib/data/products";
import { calcTotals } from "@/lib/data/totals";
import { translate } from "@/lib/i18n";
import { useLocaleStore } from "@/lib/store/locale";
import type { CartItem, DeliveryMethodId, PaymentMethodId } from "@/lib/types";

interface CartState {
  items: CartItem[];
  coupon: string | null;
  deliveryMethod: DeliveryMethodId;
  pickupStoreId?: string;
  add: (productId: string, qty?: number, color?: string) => void;
  remove: (productId: string, color?: string) => void;
  setQty: (productId: string, qty: number, color?: string) => void;
  saveForLater: (productId: string, color?: string) => void;
  moveToCart: (productId: string, color?: string) => void;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  setDelivery: (method: DeliveryMethodId, storeId?: string) => void;
  clear: () => void;
}

function sameLine(item: CartItem, productId: string, color?: string) {
  return item.productId === productId && (item.color || "") === (color || "");
}

function tToast(key: string) {
  return translate(useLocaleStore.getState().locale, key);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      deliveryMethod: "express",
      add: (productId, qty = 1, color) => {
        const product = getProduct(productId);
        if (!product || product.stock <= 0) return;
        if (product.colors?.length && !color) return;
        const items = get().items.slice();
        const existing = items.find((i) => sameLine(i, productId, color));
        if (existing) {
          existing.qty = Math.min(product.stock, existing.qty + qty);
          existing.savedForLater = false;
        } else {
          items.push({ productId, qty: Math.min(product.stock, qty), color });
        }
        set({ items });
        toast.success(tToast("toast.added"));
      },
      remove: (productId, color) =>
        set({ items: get().items.filter((i) => !sameLine(i, productId, color)) }),
      setQty: (productId, qty, color) => {
        const product = getProduct(productId);
        const next = Math.max(0, Math.min(product?.stock ?? qty, qty));
        if (next <= 0) {
          set({ items: get().items.filter((i) => !sameLine(i, productId, color)) });
          return;
        }
        set({
          items: get().items.map((i) => (sameLine(i, productId, color) ? { ...i, qty: next } : i)),
        });
      },
      saveForLater: (productId, color) =>
        set({
          items: get().items.map((i) => (sameLine(i, productId, color) ? { ...i, savedForLater: true } : i)),
        }),
      moveToCart: (productId, color) =>
        set({
          items: get().items.map((i) => (sameLine(i, productId, color) ? { ...i, savedForLater: false } : i)),
        }),
      applyCoupon: (code) => {
        const coupon = findCoupon(code);
        if (!coupon) {
          toast.error(tToast("cart.couponBad"));
          return false;
        }
        set({ coupon: coupon.code });
        toast.success(tToast("toast.coupon"));
        return true;
      },
      clearCoupon: () => set({ coupon: null }),
      setDelivery: (method, storeId) => set({ deliveryMethod: method, pickupStoreId: storeId }),
      clear: () => set({ items: [], coupon: null, deliveryMethod: "express", pickupStoreId: undefined }),
    }),
    {
      name: "jarir-cart",
      version: 3,
      migrate: (persisted) => {
        const s = persisted as CartState;
        if (s?.deliveryMethod !== "express") {
          return { ...s, deliveryMethod: "express" as const, pickupStoreId: undefined };
        }
        return s;
      },
    },
  ),
);

export function useCartCount() {
  return useCartStore((s) => s.items.filter((i) => !i.savedForLater).reduce((n, i) => n + i.qty, 0));
}

export function useCartTotals(paymentMethod?: PaymentMethodId | null) {
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const deliveryMethod = useCartStore((s) => s.deliveryMethod);
  return calcTotals({ items, coupon, deliveryMethod, paymentMethod });
}
