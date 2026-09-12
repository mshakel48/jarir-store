import { createFileRoute } from "@tanstack/react-router";
import { ProductGrid } from "@/components/catalog/product-grid";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/products/")({
  component: ProductsIndex,
});

function ProductsIndex() {
  const { t } = useT();
  return <ProductGrid title={t("header.categories")} />;
}
