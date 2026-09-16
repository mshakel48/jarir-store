import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatAgo, formatDate, formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useAuthStore } from "@/lib/store/auth";
import { startLiveEngine, useLiveStore } from "@/lib/store/live";
import { useOrdersStore } from "@/lib/store/orders";
import { orderAmount } from "@/lib/order-amount";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const { t, locale } = useT();
  const users = useAuthStore((s) => s.users);
  const orders = useOrdersStore((s) => s.orders);
  const visitors = useLiveStore((s) => s.visitors);
  const [, tick] = useState(0);

  useEffect(() => {
    startLiveEngine();
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const customers = users.filter((u) => u.role !== "admin");
  const liveByEmail = new Map(visitors.map((v) => [v.email.toLowerCase(), v]));
  const unmatched = visitors.filter((v) => !v.email || !customers.some((c) => c.email.toLowerCase() === v.email.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t("admin.customers")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.liveUsers")}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-700">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          {visitors.length} {t("admin.onlineNow")}
        </span>
      </div>

      <div className="overflow-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[52rem] text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-start">{t("admin.live")}</th>
              <th className="p-3 text-start">{t("auth.name")}</th>
              <th className="p-3 text-start">{t("admin.contact")}</th>
              <th className="p-3 text-start">{t("admin.viewing")}</th>
              <th className="p-3">{t("account.orders")}</th>
              <th className="p-3">{t("cart.total")}</th>
              <th className="p-3">{t("order.date")}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((u) => {
              const live = liveByEmail.get(u.email.toLowerCase());
              const theirs = orders.filter((o) => o.email === u.email || o.userId === u.id);
              const spent = theirs.reduce((s, o) => s + (o.status === "cancelled" ? 0 : orderAmount(o)), 0);
              return (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3">
                    {live ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-500 opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                        {t("admin.live")} · {formatAgo(live.lastSeen, locale)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">
                    <p>{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.phone}</p>
                  </td>
                  <td className="p-3 text-xs">
                    {live ? (locale === "ar" ? live.page.labelAr : live.page.labelEn) : "—"}
                  </td>
                  <td className="p-3 tabular-nums">{theirs.length}</td>
                  <td className="p-3 tabular-nums">{formatMoney(spent, locale)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(u.createdAt, locale)}</td>
                </tr>
              );
            })}
            {unmatched.map((v) => (
              <tr key={v.id} className="border-t border-border bg-emerald-500/5">
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    {t("admin.live")} · {formatAgo(v.lastSeen, locale)}
                  </span>
                </td>
                <td className="p-3 font-medium">{locale === "ar" ? v.nameAr : v.name}</td>
                <td className="p-3">
                  <p>{v.email || t("admin.guest")}</p>
                  <p className="text-xs text-muted-foreground">{v.phone || t(`cities.${v.city}`)}</p>
                </td>
                <td className="p-3 text-xs">{locale === "ar" ? v.page.labelAr : v.page.labelEn}</td>
                <td className="p-3 tabular-nums">—</td>
                <td className="p-3 tabular-nums">{v.cartCount ? formatMoney(v.cartValue, locale) : "—"}</td>
                <td className="p-3 text-muted-foreground">{t("admin.guest")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
