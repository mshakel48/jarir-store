import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductRail } from "@/components/product/product-rail";
import { getProduct } from "@/lib/data/products";
import { useT } from "@/lib/i18n";
import { useAuthStore, useCurrentShopUser } from "@/lib/store/auth";
import { useOrdersStore } from "@/lib/store/orders";
import { useViewedStore } from "@/lib/store/viewed";
import { useWishlistStore } from "@/lib/store/wishlist";

export const Route = createFileRoute("/_app/account/")({
  component: AccountHome,
});

function AccountHome() {
  const { t } = useT();
  const user = useCurrentShopUser();
  const addresses = useAuthStore((s) => s.addresses);
  const allOrders = useOrdersStore((s) => s.orders);
  const orders = allOrders.filter((o) => !user || o.userId === user.id || o.email === user.email);
  const wish = useWishlistStore((s) => s.ids.length);
  const viewedIds = useViewedStore((s) => s.ids);
  const viewed = viewedIds.map(getProduct).filter(Boolean);
  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;

  const cards = [
    { label: t("account.totalOrders"), value: orders.length },
    { label: t("account.active"), value: active },
    { label: t("account.wishItems"), value: wish },
    { label: t("account.savedAddr"), value: addresses.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t("account.overview")}</h1>
      {!user ? <p className="mt-2 text-sm text-muted-foreground">{t("account.guestHint")}</p> : null}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/orders" className="text-primary">
          {t("account.orders")}
        </Link>
        <Link to="/orders" className="text-primary">
          {t("account.track")}
        </Link>
      </div>
      {viewed.length ? <ProductRail title={t("account.recent")} products={viewed as NonNullable<(typeof viewed)[number]>[]} /> : null}
    </div>
  );
}
