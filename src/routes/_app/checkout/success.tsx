import { CustomerOtpPanel } from "@/components/order/otp-panel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useOrdersStore } from "@/lib/store/orders";

type Search = { order?: string };

export const Route = createFileRoute("/_app/checkout/success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    order: typeof s.order === "string" ? s.order : undefined,
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { order: number } = Route.useSearch();
  const { t, locale } = useT();
  const order = useOrdersStore((s) => s.orders.find((o) => o.number === number || o.id === number));

  const rejected = order?.paymentStatus === "rejected" || order?.paymentStatus === "failed";
  const confirmed = order?.paymentStatus === "paid";
  const Icon = confirmed ? CheckCircle2 : Clock;

  return (
    <div className="container-page max-w-2xl py-12 text-center">
      <Icon className={confirmed ? "mx-auto size-14 text-success" : "mx-auto size-14 text-amber-600"} />
      <h1 className="mt-4 text-3xl font-semibold">
        {confirmed ? t("order.confirmed") : rejected ? t("order.cancelled") : t("order.waitingReview")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("order.thanks")}</p>
      {order ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-start text-sm">
          <p className="text-muted-foreground">{t("order.number")}</p>
          <p className="text-lg font-semibold tabular-nums">{order.number}</p>
          <div className="mt-4">
            <CustomerOtpPanel order={order} />
          </div>
          <dl className="mt-4 grid gap-2">
            <div className="flex justify-between">
              <dt>{t("order.date")}</dt>
              <dd>{formatDate(order.date, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t("cart.total")}</dt>
              <dd className="font-semibold tabular-nums">{formatMoney(order.totals.total, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t("pay.selected")}</dt>
              <dd>{order.paymentLabel}</dd>
            </div>
          </dl>
          <ul className="mt-4 space-y-2">
            {order.items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3">
                <img src={i.image} alt="" className="size-12 rounded-md object-cover" />
                <span className="flex-1 truncate">{locale === "ar" ? i.arabicName : i.name}</span>
                <span className="tabular-nums">× {i.qty}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">{t("order.demoNote")}</p>
        </div>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order ? (
          <Button asChild>
            <Link to="/orders/$id" params={{ id: order.id }}>
              {t("order.track")}
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/orders">{t("order.track")}</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link to="/">{t("order.shop")}</Link>
        </Button>
      </div>
    </div>
  );
}
