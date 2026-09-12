import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/data/products";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/discounts")({
  component: AdminDiscounts,
});

function AdminDiscounts() {
  const { t, locale } = useT();
  const deals = PRODUCTS.filter((p) => p.discount > 0);
  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.discounts")}</h1>
      <ul className="mt-4 space-y-2">
        {deals.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span>{locale === "ar" ? p.arabicName : p.name}</span>
            <span className="tabular-nums text-primary">
              {p.discount}% · {formatMoney(p.price, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
