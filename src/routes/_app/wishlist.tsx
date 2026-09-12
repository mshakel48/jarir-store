import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product/product-card";
import { getProduct } from "@/lib/data/products";
import { useT } from "@/lib/i18n";
import { useWishlistStore } from "@/lib/store/wishlist";

export const Route = createFileRoute("/_app/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { t } = useT();
  const ids = useWishlistStore((s) => s.ids);
  const products = ids.map(getProduct).filter(Boolean);
  if (!products.length) {
    return <EmptyState icon={Heart} title={t("wishlist.empty")} action={t("cart.continue")} />;
  }
  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-semibold">{t("wishlist.title")}</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p!.id} product={p!} />
        ))}
      </div>
    </div>
  );
}
