import { CustomerOtpPanel } from "@/components/order/otp-panel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SummaryRows } from "@/components/cart/summary-rows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { STATUS_FLOW, statusIndex, useOrdersStore } from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/orders/$id")({
  component: OrderTrackPage,
});

const STATUS_KEYS: Record<OrderStatus, string> = {
  placed: "order.placed",
  confirmed: "order.confirmedS",
  preparing: "order.preparing",
  shipped: "order.shipped",
  out_for_delivery: "order.out",
  delivered: "order.delivered",
  cancelled: "order.cancelled",
};

function OrderTrackPage() {
  const { id } = Route.useParams();
  const { t, locale } = useT();
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id || o.number === id));
  if (!order) {
    return <EmptyState icon={PackageX} title={t("order.notFound")} action={t("account.orders")} actionTo="/orders" />;
  }
  const idx = statusIndex(order.status);

  return (
    <div className="container-page max-w-3xl py-8">
      <p className="text-sm text-muted-foreground">{t("order.number")}</p>
      <h1 className="text-2xl font-semibold tabular-nums">{order.number}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge>{t(STATUS_KEYS[order.status])}</Badge>
        <span className="text-sm text-muted-foreground">{formatDate(order.date, locale)}</span>
      </div>

      <ol className="mt-8 space-y-0">
        {STATUS_FLOW.map((s, i) => {
          const done = idx >= 0 && i <= idx;
          const current = idx === i;
          return (
            <li key={s} className="flex gap-3">
              <span className="flex flex-col items-center">
                <span className={cn("size-3 rounded-full", done ? "bg-primary" : "bg-border", current && "ring-4 ring-primary/20")} />
                {i < STATUS_FLOW.length - 1 ? <span className={cn("h-8 w-px", done && i < idx ? "bg-primary" : "bg-border")} /> : null}
              </span>
              <span className={cn("pb-6 text-sm", current ? "font-semibold" : "text-muted-foreground")}>{t(STATUS_KEYS[s])}</span>
            </li>
          );
        })}
      </ol>
      {order.status === "cancelled" ? <p className="mb-6 text-warning">{t("order.cancelled")}</p> : null}

      <div className="mb-6">
        <CustomerOtpPanel order={order} />
      </div>

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("order.address")}</p>
          <p className="mt-1 text-sm">
            {order.address.fullName}
            <br />
            {order.address.street} {order.address.building}
            <br />
            {t(`cities.${order.address.city}`)} · {order.address.phone}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("order.eta")}</p>
          <p className="mt-1 text-sm">{formatDate(order.estimatedDelivery, locale)}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("order.payment")}</p>
          <p className="mt-1 text-sm">
            {order.paymentLabel} · {order.paymentStatus}
            {order.last4 ? ` · ••${order.last4}` : ""}
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3">
            <img src={item.image} alt="" className="size-14 rounded-lg object-cover" />
            <Link to="/products/$id" params={{ id: item.productId }} className="flex-1 text-sm font-medium hover:text-primary">
              {locale === "ar" ? item.arabicName : item.name}
            </Link>
            <span className="text-sm tabular-nums">
              {item.qty} × {formatMoney(item.price, locale)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 max-w-sm">
        <SummaryRows totals={order.totals} locale={locale} t={t} />
      </div>
      <Button asChild variant="outline" className="mt-8">
        <Link to="/orders">{t("account.orders")}</Link>
      </Button>
    </div>
  );
}
