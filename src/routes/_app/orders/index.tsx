import { createFileRoute, Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useCurrentShopUser } from "@/lib/store/auth";
import { useOrdersStore } from "@/lib/store/orders";

export const Route = createFileRoute("/_app/orders/")({
  component: OrdersPage,
});

function OrdersPage() {
  const { t, locale } = useT();
  const user = useCurrentShopUser();
  const allOrders = useOrdersStore((s) => s.orders);
  const orders = user
    ? allOrders.filter((o) => o.userId === user.id || o.email === user.email)
    : allOrders.slice(0, 4);

  if (!orders.length) {
    return <EmptyState icon={Package} title={t("account.noOrders")} action={t("cart.continue")} />;
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-semibold">{t("account.orders")}</h1>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              to="/orders/$id"
              params={{ id: o.id }}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 hover:border-primary md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold tabular-nums">{o.number}</p>
                <p className="text-sm text-muted-foreground">{formatDate(o.date, locale)}</p>
              </div>
              <Badge variant={o.status === "cancelled" ? "warning" : "muted"}>{t(`order.${statusKey(o.status)}`)}</Badge>
              <p className="font-semibold tabular-nums">{formatMoney(o.totals.total, locale)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function statusKey(status: string) {
  if (status === "confirmed") return "confirmedS";
  if (status === "out_for_delivery") return "out";
  return status;
}
