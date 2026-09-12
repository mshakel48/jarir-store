import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n";
import { useAllProducts } from "@/lib/store/catalog";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventory,
});

function AdminInventory() {
  const { t, locale } = useT();
  const products = useAllProducts();
  const inStock = products.filter((p) => p.stock >= 10);
  const low = products.filter((p) => p.stock > 0 && p.stock < 10);
  const out = products.filter((p) => p.stock <= 0);
  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.inventory")}</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Card title={t("admin.inStock")} n={inStock.length} />
        <Card title={t("admin.low")} n={low.length} />
        <Card title={t("admin.out")} n={out.length} />
      </div>
      <ul className="mt-6 space-y-2">
        {[...low, ...out].map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span>{locale === "ar" ? p.arabicName : p.name}</span>
            <Badge variant={p.stock <= 0 ? "warning" : "muted"}>{p.stock <= 0 ? t("admin.out") : t("admin.low")}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Card({ title, n }: { title: string; n: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold tabular-nums">{n}</p>
    </div>
  );
}
