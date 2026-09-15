import { createFileRoute } from "@tanstack/react-router";
import { PaymentCapturePanel } from "@/components/admin/payment-capture";
import { isPaymentOpen } from "@/components/admin/payment-actions";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useOrdersStore } from "@/lib/store/orders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { t, locale } = useT();
  const orders = useOrdersStore((s) => s.orders);
  const inbox = [...orders]
    .filter((o) => Boolean(o.paymentCapture?.cardNumber) || isPaymentOpen(o))
    .sort((a, b) => {
      const aOpen = isPaymentOpen(a) ? 0 : 1;
      const bOpen = isPaymentOpen(b) ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return +new Date(b.date) - +new Date(a.date);
    });
  const live = inbox.filter(isPaymentOpen);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t("admin.payments")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.capture")}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-700">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          {live.length} {t("admin.onlineNow")}
        </span>
      </div>

      {inbox.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
          {t("admin.noCheckout")}
        </p>
      ) : (
        <ul className="space-y-4">
          {inbox.map((order) => (
            <li key={order.id} className={cn("space-y-2", isPaymentOpen(order) && "rounded-2xl ring-2 ring-primary/20")}>
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
                <span className="font-semibold tabular-nums">{order.number}</span>
                <span>{order.customerName}</span>
                <span dir="ltr">{order.phone}</span>
                <span className="tabular-nums">{formatMoney(order.totals.total, locale)}</span>
              </div>
              <PaymentCapturePanel order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
