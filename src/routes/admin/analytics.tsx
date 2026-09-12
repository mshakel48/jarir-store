import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PRODUCTS } from "@/lib/data/products";
import { useT } from "@/lib/i18n";
import { useOrdersStore } from "@/lib/store/orders";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

const COLORS = ["var(--color-primary)", "var(--color-charcoal)", "#78716c", "#a8a29e", "#d6d3d1"];

function AdminAnalytics() {
  const { t } = useT();
  const orders = useOrdersStore((s) => s.orders);
  const byCat: Record<string, number> = {};
  for (const o of orders) {
    for (const item of o.items) {
      const p = PRODUCTS.find((x) => x.id === item.productId);
      const cat = p?.category ?? "other";
      byCat[cat] = (byCat[cat] ?? 0) + item.price * item.qty;
    }
  }
  const pie = Object.entries(byCat).map(([name, value]) => ({ name, value }));
  const top = PRODUCTS.slice()
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6)
    .map((p) => ({ name: p.brand, v: p.reviewCount }));
  const orderBars = [
    { n: t("admin.pending"), v: orders.filter((o) => o.status === "placed").length },
    { n: t("admin.processing"), v: orders.filter((o) => ["confirmed", "preparing"].includes(o.status)).length },
    { n: t("admin.shipped"), v: orders.filter((o) => ["shipped", "out_for_delivery"].includes(o.status)).length },
    { n: t("admin.delivered"), v: orders.filter((o) => o.status === "delivered").length },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.analytics")}</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-medium">{t("admin.orders")}</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={orderBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="n" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="v" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-medium">{t("search.category")}</p>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                {pie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-4 h-64 rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 text-sm font-medium">{t("home.bestsellers")}</p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={top} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={80} fontSize={11} />
            <Tooltip />
            <Bar dataKey="v" fill="var(--color-charcoal)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
