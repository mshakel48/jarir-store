import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useAllProducts, useCatalogStore } from "@/lib/store/catalog";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const { t, locale } = useT();
  const products = useAllProducts();
  const update = useCatalogStore((s) => s.update);
  const [q, setQ] = useState("");
  const list = products.filter((p) => `${p.name} ${p.arabicName} ${p.sku}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.products")}</h1>
      <Input className="mt-4 max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("header.search")} />
      <div className="mt-4 overflow-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-muted text-start text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">{t("admin.products")}</th>
              <th className="p-3">SKU</th>
              <th className="p-3">{t("search.price")}</th>
              <th className="p-3">{t("admin.inventory")}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{locale === "ar" ? p.arabicName : p.name}</td>
                <td className="p-3 tabular-nums text-muted-foreground">{p.sku}</td>
                <td className="p-3 tabular-nums">{formatMoney(p.price, locale)}</td>
                <td className="p-3">
                  <Input
                    className="h-9 w-20"
                    defaultValue={p.stock}
                    onBlur={(e) => update(p.id, { stock: Number(e.target.value) || 0 })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
