import { createFileRoute } from "@tanstack/react-router";
import { NAV_CATEGORIES } from "@/lib/data/categories";
import { PRODUCTS } from "@/lib/data/products";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const { t } = useT();
  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.categories")}</h1>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {NAV_CATEGORIES.map((c) => (
          <li key={c.slug} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <img src={c.image} alt="" className="size-16 rounded-lg object-cover" />
            <div>
              <p className="font-medium">{t(c.navKey)}</p>
              <p className="text-xs text-muted-foreground">
                {PRODUCTS.filter((p) => c.productCategories.includes(p.category) || (c.slug === "deals" && p.discount > 0)).length}{" "}
                {t("search.results").replace("{n} ", "")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
