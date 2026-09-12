import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PAGE_SIZE } from "@/lib/constants";
import { searchProducts, uniqueBrands, type SortKey } from "@/lib/data/catalog";
import { useT } from "@/lib/i18n";

const SORTS: SortKey[] = ["relevance", "popularity", "newest", "price-asc", "price-desc", "rating"];

export function ProductGrid({
  category,
  query = "",
  title,
  description,
}: {
  category?: string;
  query?: string;
  title: string;
  description?: string;
}) {
  const { t } = useT();
  const [sort, setSort] = useState<SortKey>(query ? "relevance" : "popularity");
  const [brand, setBrand] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 180);
    return () => window.clearTimeout(id);
  }, [category, query, sort, brand, minPrice, maxPrice, minRating, inStock, onSale]);

  const base = searchProducts({ category, q: query });
  const brands = uniqueBrands(base);
  const results = searchProducts({
    category,
    q: query,
    brand,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minRating: minRating || undefined,
    inStock: inStock || undefined,
    onSale: onSale || undefined,
    sort,
  });
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const slice = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function reset() {
    setBrand([]);
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setInStock(false);
    setOnSale(false);
    setPage(1);
  }

  const filters = (
    <div className="space-y-6 text-sm">
      <div>
        <p className="mb-2 font-semibold">{t("search.brand")}</p>
        <div className="flex max-h-48 flex-col gap-1.5 overflow-auto">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={brand.includes(b)}
                onChange={() => {
                  setBrand((cur) => (cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b]));
                  setPage(1);
                }}
              />
              {b}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-semibold">{t("search.price")}</p>
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            placeholder="0"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-md border border-input bg-card px-2"
          />
          <input
            inputMode="numeric"
            placeholder="—"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-md border border-input bg-card px-2"
          />
        </div>
      </div>
      <div>
        <p className="mb-2 font-semibold">{t("search.rating")}</p>
        {[4, 3, 2].map((n) => (
          <label key={n} className="flex items-center gap-2 py-1">
            <input
              type="radio"
              name="rating"
              checked={minRating === n}
              onChange={() => {
                setMinRating(n);
                setPage(1);
              }}
            />
            {n}+ 
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setPage(1); }} />
        {t("search.inStock")}
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={onSale} onChange={(e) => { setOnSale(e.target.checked); setPage(1); }} />
        {t("search.onSale")}
      </label>
      <Button variant="outline" className="w-full" onClick={reset}>
        {t("search.clear")}
      </Button>
    </div>
  );

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
          <p className="mt-2 text-sm text-muted-foreground">{t("search.results", { n: results.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="lg:hidden" onClick={() => setDrawer(true)}>
            <SlidersHorizontal className="size-4" />
            {t("search.filters")}
          </Button>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("search.sort")}</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                setPage(1);
              }}
              className="h-11 rounded-md border border-input bg-card px-3"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(
                    s === "price-asc"
                      ? "search.priceAsc"
                      : s === "price-desc"
                        ? "search.priceDesc"
                        : `search.${s}`,
                  )}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">{filters}</aside>
        <div>
          {!ready ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : slice.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {slice.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Search} title={t("search.empty")} hint={t("search.emptyHint")} action={t("cart.continue")} />
          )}
          {pages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t("checkout.back")}
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {t("common.page")} {page} {t("common.of")} {pages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                {t("checkout.next")}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="end" className="overflow-y-auto p-5 pt-14">
          <h2 className="mb-4 text-lg font-semibold">{t("search.filters")}</h2>
          {filters}
          <Button className="mt-4 w-full" onClick={() => setDrawer(false)}>
            {t("search.apply")}
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
