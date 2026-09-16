import { Link } from "@tanstack/react-router";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Price } from "@/components/price";
import { DealCountdown, isDealLive } from "@/components/product/deal-offer";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { productBrand, productName } from "@/lib/data/products";
import { formatMoney } from "@/lib/format";
import { TAMARA_PARTS } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { installmentAmount } from "@/lib/payments";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { t, locale } = useT();
  const add = useCartStore((s) => s.add);
  const wished = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const [quick, setQuick] = useState(false);
  const out = product.stock <= 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to="/products/$id" params={{ id: product.id }} className="block size-full">
          <img
            src={product.images[0]}
            alt={productName(product, locale)}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>
        <div className="absolute start-2.5 top-2.5 flex flex-col gap-1">
          {product.discount ? <Badge>{t("product.off", { n: product.discount })}</Badge> : null}
          {product.newArrival ? <Badge variant="inverse">{t("product.new")}</Badge> : null}
          {isDealLive(product) ? <Badge variant="warning">{t("product.limited")}</Badge> : null}
        </div>
        <div className="absolute end-2.5 top-2.5 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleWish(product.id)}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm",
              wished && "text-primary",
            )}
            aria-label={t("product.wishlist")}
          >
            <Heart className={cn("size-4", wished && "fill-primary")} />
          </button>
          <button
            type="button"
            onClick={() => setQuick(true)}
            className="hidden size-10 items-center justify-center rounded-full border border-border bg-card/95 shadow-sm md:flex"
            aria-label={t("product.quickView")}
          >
            <Eye className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {productBrand(product, locale)}
        </p>
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug hover:text-primary"
        >
          {productName(product, locale)}
        </Link>
        <div className="flex items-center gap-1.5">
          <Stars value={product.rating} />
          <span className="text-xs tabular-nums text-muted-foreground">({product.reviewCount})</span>
        </div>
        <Price price={product.price} oldPrice={product.oldPrice} discount={product.discount} size="sm" />
        {product.installmentParts ? <TamaraLine product={product} /> : null}
        {isDealLive(product) && product.dealEndsAt ? (
          <DealCountdown endAt={product.dealEndsAt} compact />
        ) : null}
        <p className="text-xs text-muted-foreground">
          {out ? t("product.outOfStock") : product.stock < 8 ? t("product.left", { n: product.stock }) : t("product.inStock")}
        </p>
        <Button
          className="mt-auto w-full"
          disabled={out}
          onClick={() => add(product.id)}
        >
          <ShoppingBag className="size-4" />
          {t("product.addToCart")}
        </Button>
      </div>

      <Dialog open={quick} onOpenChange={setQuick}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">{productName(product, locale)}</DialogTitle>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="overflow-hidden rounded-xl bg-muted">
              <img src={product.images[0]} alt="" className="aspect-square w-full object-cover" />
            </div>
            <div className="flex flex-col gap-3 pe-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {productBrand(product, locale)}
              </p>
              <h3 className="text-xl font-semibold">{productName(product, locale)}</h3>
              <div className="flex items-center gap-2">
                <Stars value={product.rating} />
                <span className="text-sm text-muted-foreground">{t("product.reviews", { n: product.reviewCount })}</span>
              </div>
              <Price price={product.price} oldPrice={product.oldPrice} discount={product.discount} size="lg" />
              <p className="text-sm text-muted-foreground line-clamp-4">
                {locale === "ar" ? product.arabicDescription : product.description}
              </p>
              <div className="mt-auto flex gap-2">
                <Button className="flex-1" disabled={out} onClick={() => add(product.id)}>
                  {t("product.addToCart")}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/products/$id" params={{ id: product.id }} onClick={() => setQuick(false)}>
                    {t("product.quickView")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}

function TamaraLine({ product }: { product: Product }) {
  const { t, locale } = useT();
  const parts = product.installmentParts || TAMARA_PARTS;
  const per = installmentAmount(product.price, parts);
  return <p className="text-xs font-medium text-primary">{t("product.tamaraPlan", { n: formatMoney(per, locale) })}</p>;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-3.5">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
