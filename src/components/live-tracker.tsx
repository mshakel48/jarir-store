import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { getProduct } from "@/lib/data/products";
import { activityFromPath, pageFromPath, startLiveEngine, useLiveStore } from "@/lib/store/live";
import { useAuthStore, useCurrentShopUser } from "@/lib/store/auth";
import { useCartStore, useCartTotals } from "@/lib/store/cart";
import { useLocaleStore } from "@/lib/store/locale";

const SESSION_KEY = "jarir-live-session";

function sessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function LiveTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useCurrentShopUser();
  const city = useLocaleStore((s) => s.city);
  const items = useCartStore((s) => s.items);
  const totals = useCartTotals();
  const upsert = useLiveStore((s) => s.upsertVisitor);
  const drop = useLiveStore((s) => s.dropVisitor);

  useEffect(() => {
    startLiveEngine();
    const id = `real-${sessionId()}`;
    const productId = pathname.startsWith("/products/") ? pathname.split("/")[2] : undefined;
    const product = productId ? getProduct(productId) : undefined;
    const beat = () => {
      const guest = !user || user.role === "admin";
      upsert({
        id,
        name: guest ? "Store visitor" : user.name,
        nameAr: guest ? "زائر المتجر" : user.name,
        email: guest ? "" : user.email,
        phone: guest ? "" : user.phone,
        city,
        page: pageFromPath(pathname, product ? { en: product.name, ar: product.arabicName } : undefined),
        cartCount: items.filter((i) => !i.savedForLater).reduce((n, i) => n + i.qty, 0),
        cartValue: totals.total,
        lastSeen: Date.now(),
        activity: activityFromPath(pathname),
        real: true,
      });
    };
    beat();
    const timer = window.setInterval(beat, 2000);
    return () => {
      window.clearInterval(timer);
      drop(id);
    };
  }, [pathname, user, city, items, totals.total, upsert, drop]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "jarir-orders" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as { state?: { orders?: unknown } };
          if (parsed.state?.orders) {
            import("@/lib/store/orders").then(({ useOrdersStore }) => {
              useOrdersStore.setState({ orders: parsed.state!.orders as never });
            });
          }
        } catch {
          /* ignore */
        }
      }
      if (e.key === "jarir-auth" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as { state?: { users?: unknown; currentId?: string | null } };
          if (parsed.state?.users) {
            useAuthStore.setState({
              users: parsed.state.users as never,
              currentId: parsed.state.currentId ?? useAuthStore.getState().currentId,
            });
          }
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
