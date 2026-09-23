import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Price } from "@/components/price";
import { BnplOffer } from "@/components/product/deal-offer";
import { ProductRail } from "@/components/product/product-rail";
import { Qty } from "@/components/qty";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EXPRESS_DELIVERY_FEE, FREE_DELIVERY_MIN } from "@/lib/constants";
import { boughtTogether, relatedProducts } from "@/lib/data/catalog";
import { getNavCategory } from "@/lib/data/categories";
import { getProduct, productBrand, productName } from "@/lib/data/products";
import { reviewsFor } from "@/lib/data/reviews";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useCartStore } from "@/lib/store/cart";
import { useViewedStore } from "@/lib/store/viewed";
import { useWishlistStore } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";
import { PackageX } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const product = getProduct(id);
  const { t, locale } = useT();
  const navigate = useNavigate();
  const add = useCartStore((s) => s.add);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.ids.includes(id));
  const record = useViewedStore((s) => s.record);
  const viewedIds = useViewedStore((s) => s.ids);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews" | "ship">("desc");
  const [color, setColor] = useState<string>();

  useEffect(() => {
    if (product) record(product.id);
    setImg(0);
    setQty(1);
    setColor(undefined);
  }, [product, record]);

  if (!product) {
    return <EmptyState icon={PackageX} title={t("product.unavailable")} action={t("product.backToShop")} />;
  }

  const nav = getNavCategory(product.category) ?? getNavCategory(
    product.category === "laptops" || product.category === "tablets" ? "computers-tablets" : product.category,
  );
  const together = boughtTogether(product);
  const similar = relatedProducts(product);
  const reviews = reviewsFor(product);
  const viewed = viewedIds
    .filter((vid) => vid !== product.id)
    .map((vid) => getProduct(vid))
    .filter(Boolean);
  const out = product.stock <= 0;

  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[
          { label: nav ? t(nav.navKey) : product.category, to: `/category/${nav?.slug ?? product.category}` },
          { label: productName(product, locale) },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <img
              src={product.images[img] ?? product.images[0]}
              alt={productName(product, locale)}
              className={
                product.id === "iphone-18" && img === 0
                  ? "aspect-[21/9] w-full bg-white object-contain"
                  : "aspect-square w-full object-cover"
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            {product.images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setImg(i)}
                className={cn("size-16 overflow-hidden rounded-lg border", i === img ? "border-primary" : "border-border")}
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Link to="/search" search={{ q: productBrand(product, locale) }} className="text-xs font-medium uppercase tracking-wide text-primary hover:underline">
            {productBrand(product, locale)}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{productName(product, locale)}</h1>
          {locale === "en" ? <p className="mt-1 text-sm text-muted-foreground">{product.arabicName}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Stars value={product.rating} />
            <span className="text-sm text-muted-foreground">{t("product.reviews", { n: product.reviewCount })}</span>
            <span className="text-xs text-muted-foreground">{t("product.sku")}: {product.sku}</span>
          </div>
          <div className="mt-4">
            <Price price={product.price} oldPrice={product.oldPrice} discount={product.discount} size="lg" />
          </div>
          {product.installmentParts || product.dealEndsAt ? <BnplOffer product={product} /> : null}
          <p className="mt-3 text-sm">
            {out ? (
              <Badge variant="warning">{t("product.outOfStock")}</Badge>
            ) : product.stock < 8 ? (
              <span className="text-warning">{t("product.left", { n: product.stock })}</span>
            ) : (
              <span className="text-success">{t("product.inStock")}</span>
            )}
          </p>

          {product.colors?.length ? (
            <div className="mt-6">
              <p className="text-sm font-semibold">{t("product.chooseColor")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const selected = color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-3 py-2 text-sm",
                        selected ? "border-primary bg-primary/5 font-semibold" : "border-border bg-card",
                      )}
                    >
                      <span className="size-5 rounded-full border border-black/10" style={{ background: c.hex }} />
                      {locale === "ar" ? c.arabicName : c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Qty value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
            <Button
              className="min-w-40 flex-1"
              disabled={out}
              onClick={() => {
                if (product.colors?.length && !color) {
                  toast.error(t("product.colorRequired"));
                  return;
                }
                add(product.id, qty, color);
              }}
            >
              {t("product.addToCart")}
            </Button>
            <Button
              variant="inverse"
              className="min-w-32"
              disabled={out}
              onClick={() => {
                if (product.colors?.length && !color) {
                  toast.error(t("product.colorRequired"));
                  return;
                }
                add(product.id, qty, color);
                navigate({ to: "/checkout" });
              }}
            >
              {t("product.buyNow")}
            </Button>
            <Button variant="outline" size="icon" onClick={() => toggleWish(product.id)} aria-label={t("product.wishlist")}>
              <Heart className={cn("size-4", wished && "fill-primary text-primary")} />
            </Button>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <p className="font-semibold">{t("product.deliveryTitle")}</p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Truck className="size-4" />
              <Link to="/shipping" className="hover:text-foreground hover:underline">
                {t("product.eta", { n: "7" })}
              </Link>
            </p>
            <p className="text-muted-foreground">
              {t("product.fee")}: {formatMoney(EXPRESS_DELIVERY_FEE, locale)} · {t("product.freeOver", { n: FREE_DELIVERY_MIN })}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex gap-1 overflow-x-auto border-b border-border">
          {(
            [
              ["desc", "product.tabsDesc"],
              ["specs", "product.tabsSpecs"],
              ["reviews", "product.tabsReviews"],
              ["ship", "product.tabsShip"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "whitespace-nowrap px-4 py-3 text-sm font-medium",
                tab === key ? "border-b-2 border-primary text-foreground" : "text-muted-foreground",
              )}
            >
              {t(label)}
            </button>
          ))}
        </div>
        <div className="py-6 text-sm leading-relaxed">
          {tab === "desc" ? <p>{locale === "ar" ? product.arabicDescription : product.description}</p> : null}
          {tab === "specs" ? (
            <table className="w-full max-w-xl text-start">
              <tbody>
                {product.specifications.map((s) => (
                  <tr key={s.label} className="border-b border-border">
                    <th className="py-2 pe-4 font-medium">{locale === "ar" ? s.arabicLabel : s.label}</th>
                    <td className="py-2 text-muted-foreground">{locale === "ar" ? s.arabicValue : s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {tab === "reviews" ? (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{locale === "ar" ? r.arabicAuthor : r.author}</p>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-1 text-sm font-semibold">{locale === "ar" ? r.arabicTitle : r.title}</p>
                  <p className="mt-1 text-muted-foreground">{locale === "ar" ? r.arabicComment : r.comment}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {tab === "ship" ? (
            <div className="max-w-2xl space-y-3 text-muted-foreground">
              <p>{t("product.deliveryTitle")}</p>
              <p>{locale === "ar" ? "إرجاع خلال ١٤ يوماً للمنتجات غير المستخدمة في تغليفها الأصلي." : "Returns within 14 days for unused items in original packaging."}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/shipping">{t("footer.shipping")}</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/returns">{t("footer.returns")}</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/stores">{t("header.locations")}</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {together.length ? (
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">{t("product.together")}</h2>
          <div className="flex flex-wrap items-center gap-3">
            {[product, ...together].map((p, i) => (
              <span key={p.id} className="flex items-center gap-3">
                {i > 0 ? <span className="text-xl text-muted-foreground">+</span> : null}
                <Link to="/products/$id" params={{ id: p.id }} className="flex items-center gap-2">
                  <img src={p.images[0]} alt="" className="size-16 rounded-lg object-cover" />
                  <span className="max-w-36 text-sm">{productName(p, locale)}</span>
                </Link>
              </span>
            ))}
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              if (product.colors?.length && !color) {
                toast.error(t("product.colorRequired"));
                return;
              }
              add(product.id, qty, color);
              together.forEach((p) => add(p.id));
            }}
          >
            {t("product.addBundle")}
          </Button>
        </section>
      ) : null}

      <ProductRail title={t("product.similar")} products={similar} />
      {viewed.length ? <ProductRail title={t("product.recently")} products={viewed as NonNullable<typeof product>[]} /> : null}
    </div>
  );
}
