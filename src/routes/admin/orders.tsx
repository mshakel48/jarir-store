import { PaymentCapturePanel } from "@/components/admin/payment-capture";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatDateTime, formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { STATUS_FLOW, useOrdersStore } from "@/lib/store/orders";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
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

function AdminOrders() {
  const { t, locale } = useT();
  const orders = useOrdersStore((s) => s.orders);
  const setStatus = useOrdersStore((s) => s.setStatus);
  const sorted = useMemo(
    () => [...orders].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [orders],
  );
  const [selectedId, setSelectedId] = useState(sorted[0]?.id);
  const selected = sorted.find((o) => o.id === selectedId) ?? sorted[0];
  const counts = {
    pending: orders.filter((o) => o.status === "placed").length,
    processing: orders.filter((o) => ["confirmed", "preparing"].includes(o.status)).length,
    shipped: orders.filter((o) => ["shipped", "out_for_delivery"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.orders")}</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {Object.entries(counts).map(([k, v]) => (
          <span key={k} className="rounded-full bg-muted px-3 py-1 font-medium">
            {t(`admin.${k}`)}: {v}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[22rem_1fr]">
        <ul className="max-h-[70vh] overflow-auto rounded-2xl border border-border bg-card">
          {sorted.map((o) => {
            const fresh = Date.now() - +new Date(o.date) < 120000;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(o.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-start",
                    selected?.id === o.id ? "bg-primary/5" : "hover:bg-muted/60",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold tabular-nums">{o.number}</span>
                    {fresh ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        {t("admin.newOrder")}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm">{o.customerName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatMoney(o.totals.total, locale)} · {t(STATUS_KEYS[o.status])}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {selected ? <OrderDetail order={selected} onStatus={(s) => setStatus(selected.id, s)} /> : (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("admin.selectOrder")}
          </p>
        )}
      </div>
    </div>
  );
}

function OrderDetail({ order, onStatus }: { order: Order; onStatus: (s: OrderStatus) => void }) {
  const { t, locale } = useT();
  return (
    <article className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{t("order.number")}</p>
          <h2 className="text-lg font-semibold tabular-nums">{order.number}</h2>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.date, locale)}</p>
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={order.status}
          onChange={(e) => onStatus(e.target.value as OrderStatus)}
        >
          {STATUS_FLOW.concat("cancelled").map((s) => (
            <option key={s} value={s}>
              {t(STATUS_KEYS[s])}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Info label={t("admin.customer")} value={order.customerName} />
        <Info label={t("checkout.email")} value={order.email} />
        <Info label={t("checkout.phone")} value={order.phone} />
        <Info label={t("admin.paymentMethod")} value={`${order.paymentLabel}${order.last4 ? ` · ••${order.last4}` : ""} · ${order.paymentStatus}`} />
        <Info label={t("admin.delivery")} value={t("checkout.express")} />
        <Info
          label={t("order.eta")}
          value={formatDateTime(order.estimatedDelivery, locale)}
        />
      </div>

      <PaymentCapturePanel order={order} />

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("order.address")}</p>
        <p className="mt-1 text-sm leading-relaxed">
          {order.address.fullName}
          <br />
          {order.address.street} {order.address.building}
          {order.address.apartment ? ` · ${order.address.apartment}` : ""}
          <br />
          {order.address.district} · {t(`cities.${order.address.city}`)}
          {order.address.postalCode ? ` · ${order.address.postalCode}` : ""}
          <br />
          {order.address.phone}
          {order.address.instructions ? (
            <>
              <br />
              {order.address.instructions}
            </>
          ) : null}
        </p>
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3 p-3">
            <img src={item.image} alt="" className="size-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{locale === "ar" ? item.arabicName : item.name}</p>
              <p className="text-xs text-muted-foreground">{item.productId}</p>
            </div>
            <p className="text-sm tabular-nums">
              {item.qty} × {formatMoney(item.price, locale)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="space-y-1 text-sm">
        <Row label={t("cart.subtotal")} value={formatMoney(order.totals.subtotal, locale)} />
        {order.totals.discount > 0 ? <Row label={t("cart.discount")} value={`− ${formatMoney(order.totals.discount, locale)}`} /> : null}
        {order.coupon ? <Row label={t("cart.coupon")} value={order.coupon} /> : null}
        <Row label={t("cart.delivery")} value={formatMoney(order.totals.delivery, locale)} />
        <Row label={t("cart.vat")} value={formatMoney(order.totals.vat, locale)} />
        {order.totals.fees > 0 ? <Row label={t("cart.fees")} value={formatMoney(order.totals.fees, locale)} /> : null}
        <Row label={t("cart.total")} value={formatMoney(order.totals.total, locale)} strong />
      </dl>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium break-all">{value}</p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular-nums", strong && "font-semibold")}>{value}</span>
    </div>
  );
}
