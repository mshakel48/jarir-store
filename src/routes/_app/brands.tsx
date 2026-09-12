import { createFileRoute, Link } from "@tanstack/react-router";
import { uniqueBrandPairs } from "@/lib/data/catalog";
import { PRODUCTS } from "@/lib/data/products";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/brands")({
  component: BrandsPage,
});

function BrandsPage() {
  const { t, locale } = useT();
  const brands = uniqueBrandPairs();
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("header.brands")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("home.categories")}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {brands.map(([en, ar]) => {
          const count = PRODUCTS.filter((p) => p.brand === en).length;
          const label = locale === "ar" ? ar : en;
          return (
            <Link
              key={en}
              to="/search"
              search={{ q: label }}
              className="rounded-2xl border border-border bg-card p-4 hover:border-primary"
            >
              <p className="font-semibold">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("search.results", { n: count })}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
