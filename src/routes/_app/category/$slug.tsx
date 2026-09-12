import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getNavCategory } from "@/lib/data/categories";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { t, locale } = useT();
  const cat = getNavCategory(slug);
  const title = cat ? t(cat.navKey) : slug;
  const desc = cat ? (locale === "ar" ? cat.descriptionAr : cat.descriptionEn) : undefined;
  const subs = cat ? (locale === "ar" ? cat.subsAr : cat.subsEn) : [];

  return (
    <div>
      <div className="container-page pt-6">
        <Breadcrumbs items={[{ label: title }]} />
        {cat ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid md:grid-cols-[1.4fr_1fr]">
              <div className="p-6 md:p-8">
                <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">{desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {subs.map((s) => (
                    <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <img src={cat.image} alt="" className="hidden h-48 w-full object-cover md:block md:h-full" />
            </div>
          </div>
        ) : null}
      </div>
      <ProductGrid category={slug} title={title} />
    </div>
  );
}
