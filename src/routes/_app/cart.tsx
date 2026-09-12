import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { SummaryRows } from "@/components/cart/summary-rows";
import { Price } from "@/components/price";
import { Qty } from "@/components/qty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FREE_DELIVERY_MIN } from "@/lib/constants";
import { lineItems } from "@/lib/data/totals";
import { getProduct, productName } from "@/lib/data/products";
import { useT } from "@/lib/i18n";
import { useCartStore, useCartTotals } from "@/lib/store/cart";

export const Route = createFileRoute("/_app/cart")({
  component: CartPage,
});

function CartPage() {
  const { t, locale } = useT();
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const moveToCart = useCartStore((s) => s.moveToCart);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const coupon = useCartStore((s) => s.coupon);
  const totals = useCartTotals();
  const [code, setCode] = useState("");
  const active = items.filter((i) => !i.savedForLater);
  const saved = items.filter((i) => i.savedForLater);
  const remain = Math.max(0, FREE_DELIVERY_MIN - (totals.subtotal - totals.discount));

  if (!items.length) {
    return <EmptyState icon={ShoppingBag} title={t("cart.empty")} hint={t("cart.emptyHint")} action={t("cart.continue")} />;
  }

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_22rem]">
      <div>
        <h1 className="mb-5 text-2xl font-semibold">{t("cart.title")}</h1>
        <ul className="space-y-4">
          {active.map((item) => {
            const p = getProduct(item.productId);
            if (!p) return null;
            return (
              <li key={p.id} className="flex gap-4 rounded-2xl border border-border bg-card p-3">
                <Link to="/products/$id" params={{ id: p.id }} className="size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img src={p.images[0]} alt="" className="size-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to="/products/$id" params={{ id: p.id }} className="font-semibold hover:text-primary">
                    {productName(p, locale)}
                  </Link>
                  <Price price={p.price} oldPrice={p.oldPrice} discount={p.discount} size="sm" className="mt-1" />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Qty value={item.qty} onChange={(n) => setQty(p.id, n)} max={p.stock} />
                    <Button variant="ghost" size="sm" onClick={() => saveForLater(p.id)}>
                      {t("cart.later")}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(p.id)}>
                      {t("cart.remove")}
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {saved.length ? (
          <div className="mt-10">
            <h2 className="mb-3 font-semibold">{t("cart.saved")}</h2>
            <ul className="space-y-3">
              {saved.map((item) => {
                const p = getProduct(item.productId);
                if (!p) return null;
                return (
                  <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <img src={p.images[0]} alt="" className="size-16 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{productName(p, locale)}</p>
                      <Price price={p.price} size="sm" />
                    </div>
                    <Button size="sm" onClick={() => moveToCart(p.id)}>
                      {t("cart.moveCart")}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28">
        <h2 className="mb-4 font-semibold">{t("checkout.summary")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {remain > 0 ? t("cart.freeShip", { n: Math.ceil(remain) }) : t("cart.freeUnlocked")}
        </p>
        <SummaryRows totals={totals} locale={locale} t={t} />
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyCoupon(code);
          }}
        >
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("cart.coupon")} />
          <Button type="submit" variant="outline">
            {t("cart.apply")}
          </Button>
        </form>
        {coupon ? <p className="mt-2 text-xs text-success">{t("cart.couponOk")} — {coupon}</p> : null}
        <Button asChild className="mt-5 w-full" disabled={!lineItems(items).length}>
          <Link to="/checkout">{t("cart.checkout")}</Link>
        </Button>
      </aside>
    </div>
  );
}

