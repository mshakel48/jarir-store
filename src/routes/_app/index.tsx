import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { CategoryPills } from "@/components/home/category-pills";
import { ProductRail } from "@/components/product/product-rail";
import { ProductCard } from "@/components/product/product-card";
import { DealCountdown } from "@/components/product/deal-offer";
import { Button } from "@/components/ui/button";
import { HOME_CATEGORIES } from "@/lib/data/categories";
import { uniqueBrandPairs } from "@/lib/data/catalog";
import { img } from "@/lib/data/images";
import { bestSellers, featuredProducts, flashDeals, newArrivals } from "@/lib/data/catalog";
import { getProduct, PRODUCTS } from "@/lib/data/products";
import { formatMoney } from "@/lib/format";
import { getDealEnd, useCountdown, useHydrated } from "@/lib/hooks";
import { useT } from "@/lib/i18n";
import { useViewedStore } from "@/lib/store/viewed";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

const TRUST = [
  { icon: Truck, key: "home.trustShip", to: "/shipping" as const },
  { icon: ShieldCheck, key: "home.trustWarranty", to: "/about" as const },
  { icon: Receipt, key: "home.trustVat", to: "/help" as const },
  { icon: RotateCcw, key: "home.trustReturns", to: "/returns" as const },
];

function HomePage() {
  const { t, locale } = useT();
  const hydrated = useHydrated();
  const viewedIds = useViewedStore((s) => s.ids);
  const viewed = viewedIds.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  const end = hydrated ? getDealEnd() : Date.now() + 8 * 3600_000;
  const cd = useCountdown(end);
  const pad = (n: number) => String(n).padStart(2, "0");
  const deal = getProduct("iphone-18");
  const brands = uniqueBrandPairs().slice(0, 12);

  return (
    <div>
      <section className="container-page py-5">
        <CategoryPills />
      </section>

      <section className="container-page pb-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-4 py-8 md:px-12 md:py-10">
          <div className="absolute start-0 top-0 bg-primary px-7 py-3 text-sm font-bold text-primary-foreground [clip-path:polygon(0_0,100%_0,100%_70%,14%_100%,0_100%)]">
            {t("home.greatPrice")}
          </div>
          <h1 className="text-center text-3xl font-extrabold tracking-tight md:text-5xl">{t("home.promoTitle")}</h1>
          {deal ? (
            <Link
              to="/products/$id"
              params={{ id: deal.id }}
              className="mt-8 mx-auto flex max-w-3xl flex-col items-center gap-5 md:flex-row md:items-center md:justify-center md:gap-10"
            >
              <img
                src={deal.images[0]}
                alt={locale === "ar" ? deal.arabicName : deal.name}
                className="h-56 w-56 rounded-2xl object-cover shadow-card md:h-72 md:w-72"
              />
              <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-start">
                <span className="rounded-md bg-muted px-4 py-1.5 text-sm font-semibold">{t("home.promoQuant")}</span>
                <p className="text-lg font-semibold">{locale === "ar" ? deal.arabicName : deal.name}</p>
                <p className="flex items-baseline gap-2 font-extrabold">
                  {deal.oldPrice ? (
                    <span className="text-xl text-muted-foreground line-through decoration-2">
                      {formatMoney(deal.oldPrice, locale)}
                    </span>
                  ) : null}
                  <span className="text-4xl text-primary md:text-5xl">{formatMoney(deal.price, locale)}</span>
                </p>
                <p className="text-sm text-muted-foreground">{t("home.promoVerbal")}</p>
                {deal.dealEndsAt ? <DealCountdown endAt={deal.dealEndsAt} /> : null}
              </div>
            </Link>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/products/$id" params={{ id: "iphone-18" }}>
                {t("home.shopNow")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/category/$slug" params={{ slug: "deals" }}>
                {t("nav.deals")}
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">{t("home.promoUntil")}</p>
        </div>
      </section>

      <section className="container-page pb-8">
        <Link to="/category/$slug" params={{ slug: "school" }} className="relative block overflow-hidden rounded-3xl">
          <img src={img.heroSchool} alt="" className="h-52 w-full object-cover md:h-64" />
          <div className="absolute inset-0 bg-charcoal/55" />
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-3 p-8 text-charcoal-foreground">
            <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
              {t("home.campaignKicker")}
            </span>
            <p className="max-w-md text-start text-3xl font-black leading-tight md:text-5xl">{t("home.campaignTitle")}</p>
            <span className="text-sm font-semibold underline-offset-4 hover:underline">{t("home.campaignCta")}</span>
          </div>
        </Link>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-page grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {TRUST.map(({ icon: Icon, key, to }) => (
            <Link key={key} to={to} className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <p className="text-sm font-medium leading-snug">{t(key)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold md:text-2xl">{t("home.categories")}</h2>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
            {t("home.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {HOME_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
            >
              <img src={c.image} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <p className="text-sm font-semibold">{t(c.labelKey)}</p>
                <span className="text-xs font-medium text-primary group-hover:underline">{t("home.shopNow")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-card">
        <div className="container-page py-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold md:text-2xl">{t("home.flash")}</h2>
              <p className="text-sm text-muted-foreground">{t("home.endsIn")}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 font-semibold tabular-nums">
                {[cd.hours, cd.minutes, cd.seconds].map((n, i) => (
                  <span key={i} className="rounded-md bg-primary px-2.5 py-1 text-sm text-primary-foreground">
                    {pad(n)}
                  </span>
                ))}
              </div>
              <Link to="/category/$slug" params={{ slug: "deals" }} className="text-sm font-semibold text-primary hover:underline">
                {t("home.viewAll")}
              </Link>
            </div>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-5">
            {flashDeals().map((p) => (
              <div key={p.id} className="w-[68%] shrink-0 sm:w-[46%] md:w-auto">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold md:text-2xl">{t("header.brands")}</h2>
          <Link to="/brands" className="text-sm font-semibold text-primary hover:underline">
            {t("home.viewAll")}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {brands.map(([en, ar]) => (
            <Link
              key={en}
              to="/search"
              search={{ q: locale === "ar" ? ar : en }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              {locale === "ar" ? ar : en}
            </Link>
          ))}
        </div>
      </section>

      <ProductRail title={t("home.featured")} products={featuredProducts().slice(0, 8)} viewAllTo="/products" />
      <ProductRail title={t("home.bestsellers")} products={bestSellers().slice(0, 8)} viewAllTo="/products" />
      <ProductRail title={t("home.newArrivals")} products={newArrivals().slice(0, 8)} viewAllTo="/search" viewAllSearch={{ q: "new" }} />
      <ProductRail
        title={t("home.school")}
        products={PRODUCTS.filter((p) => p.category === "school").slice(0, 8)}
        viewAllTo="/category/$slug"
        viewAllParams={{ slug: "school" }}
      />
      {viewed.length ? (
        <ProductRail title={t("home.recently")} products={viewed as typeof PRODUCTS} viewAllTo="/wishlist" />
      ) : null}

      <section className="container-page pb-12">
        <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-border bg-card p-5">
          <Button asChild>
            <Link to="/products">{t("home.shopNow")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/category/$slug" params={{ slug: "deals" }}>
              {t("nav.deals")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/stores">{t("header.locations")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/help">{t("header.help")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/orders">{t("header.orders")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">{t("footer.contact")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
