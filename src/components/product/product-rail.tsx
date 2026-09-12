import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/product/product-card";
import { useT } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export function ProductRail({
  title,
  products,
  viewAllTo,
  viewAllParams,
  viewAllSearch,
}: {
  title: string;
  products: Product[];
  viewAllTo?: "/products" | "/category/$slug" | "/search" | "/wishlist";
  viewAllParams?: { slug: string };
  viewAllSearch?: { q: string };
}) {
  const { t } = useT();
  if (!products.length) return null;
  return (
    <section className="container-page py-10">
      <div className="mb-5 flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
        {viewAllTo ? (
          <Link
            to={viewAllTo}
            params={viewAllParams}
            search={viewAllSearch}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t("home.viewAll")}
          </Link>
        ) : null}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-5">
        {products.map((p) => (
          <div key={p.id} className="w-[68%] shrink-0 sm:w-[46%] md:w-auto">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
