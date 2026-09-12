import { createFileRoute } from "@tanstack/react-router";
import { Stars } from "@/components/stars";
import { PRODUCTS } from "@/lib/data/products";
import { reviewsFor } from "@/lib/data/reviews";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

function AdminReviews() {
  const { t, locale } = useT();
  const list = PRODUCTS.slice(0, 8).flatMap((p) => reviewsFor(p, 2).map((r) => ({ ...r, product: p })));
  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.reviews")}</h1>
      <ul className="mt-4 space-y-3">
        {list.map((r) => (
          <li key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{locale === "ar" ? r.product.arabicName : r.product.name}</p>
              <Stars value={r.rating} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{locale === "ar" ? r.arabicComment : r.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
