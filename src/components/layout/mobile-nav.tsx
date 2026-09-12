import { Link, useRouterState } from "@tanstack/react-router";
import { Grid2x2, Heart, Home, ShoppingBag, User } from "lucide-react";
import { useHydrated } from "@/lib/hooks";
import { useT } from "@/lib/i18n";
import { useCurrentShopUser } from "@/lib/store/auth";
import { useCartCount } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { t } = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useCurrentShopUser();
  const count = useCartCount();
  const hydrated = useHydrated();
  const items = [
    { to: "/", icon: Home, label: t("common.home"), match: (p: string) => p === "/" },
    { to: "/products", icon: Grid2x2, label: t("header.shop"), match: (p: string) => p.startsWith("/category") || p.startsWith("/products") || p.startsWith("/search") },
    { to: "/wishlist", icon: Heart, label: t("header.wishlist"), match: (p: string) => p.startsWith("/wishlist") },
    { to: "/cart", icon: ShoppingBag, label: t("header.cart"), match: (p: string) => p.startsWith("/cart") },
    { to: user ? "/account" : "/login", icon: User, label: t("header.account"), match: (p: string) => p.startsWith("/account") || p.startsWith("/login") },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
                {item.to === "/cart" && hydrated && count > 0 ? (
                  <span className="absolute end-[18%] top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                    {count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
