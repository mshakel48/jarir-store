import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { livePaymentOrders, LiveCheckoutQueue } from "@/components/admin/live-checkout";
import { formatAgo, formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { startLiveEngine, useLiveStore } from "@/lib/store/live";
import { useOrdersStore } from "@/lib/store/orders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { t, locale } = useT();
  const orders = useOrdersStore((s) => s.orders);
  const events = useLiveStore((s) => s.events);
  const queue = livePaymentOrders(orders);
  const [, tick] = useState(0);

  useEffect(() => {
    startLiveEngine();
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totals.total, 0);
  const paid = orders.filter((o) => o.status !== "cancelled");
  const aov = paid.length ? revenue / paid.length : 0;
  const newest = [...orders].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const chart = useMemo(() => {
    const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    return days.map((d, i) => ({
      d,
      v: Math.round(revenue * (0.08 + (i + 1) * 0.03)),
    }));
  }, [revenue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t("admin.dashboard")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.liveFeed")}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-700">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          {queue.length} {t("admin.onlineNow")}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("admin.revenue")} value={formatMoney(revenue, locale)} />
        <Stat label={t("admin.orders")} value={String(orders.length)} />
        <Stat label={t("admin.onlineNow")} value={String(queue.length)} live />
        <Stat label={t("admin.aov")} value={formatMoney(aov, locale)} />
      </div>

      <LiveCheckoutQueue />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">{t("admin.incomingOrders")}</h2>
            <Link to="/admin/orders" className="text-xs font-medium text-primary">
              {t("admin.orders")}
            </Link>
          </header>
          <ul className="max-h-64 divide-y divide-border overflow-auto">
            {newest.slice(0, 6).map((o) => {
              const fresh = Date.now() - +new Date(o.date) < 120000;
              return (
                <li key={o.id} className={cn("px-4 py-3", fresh && "bg-primary/5")}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium tabular-nums">{o.number}</p>
                    {fresh ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        {t("admin.newOrder")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.email} · {o.phone}
                  </p>
                  <p className="mt-1 text-xs tabular-nums">
                    {formatMoney(o.totals.total, locale)} · {o.paymentLabel} · {t(`order.${statusKey(o.status)}`)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">{t("admin.liveFeed")}</h2>
          </header>
          <ul className="max-h-56 divide-y divide-border overflow-auto">
            {events.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-muted-foreground">{t("admin.noLive")}</li>
            ) : (
              events.slice(0, 12).map((e) => (
                <li key={e.id} className="px-4 py-2.5 text-sm">
                  <p>
                    <span className="font-medium">{locale === "ar" ? e.nameAr : e.name}</span>
                    <span className="text-muted-foreground"> · {locale === "ar" ? e.textAr : e.textEn}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">{formatAgo(e.at, locale)}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="h-56 rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-medium">{t("admin.revenue")}</p>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
            <Tooltip />
            <Area type="monotone" dataKey="v" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function statusKey(status: string) {
  if (status === "confirmed") return "confirmedS";
  if (status === "out_for_delivery") return "out";
  return status;
}

function Stat({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular-nums", live && "text-emerald-700")}>{value}</p>
    </div>
  );
}
