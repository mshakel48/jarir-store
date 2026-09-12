import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { SummaryRows } from "@/components/cart/summary-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_PAYMENTS, EXPRESS_DELIVERY_FEE, FREE_DELIVERY_MIN } from "@/lib/constants";
import { CITY_IDS } from "@/lib/data/stores";
import { lineItems } from "@/lib/data/totals";
import { detectCardBrand, digitsOnly, formatMoney, formatSaudiPhone, isValidEmail, isValidSaudiPhone } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { installmentAmount, processPayment } from "@/lib/payments";
import { useAuthStore, useCurrentShopUser } from "@/lib/store/auth";
import { useCartStore, useCartTotals } from "@/lib/store/cart";
import { useLocaleStore } from "@/lib/store/locale";
import { newOrderId, nextOrderNumber, useOrdersStore } from "@/lib/store/orders";
import type { Address, PaymentMethodId } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/checkout/")({
  component: CheckoutPage,
});

const METHODS: PaymentMethodId[] = ["tamara", "card"];

function CheckoutPage() {
  const { t, locale, isAr } = useT();
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const deliveryMethod = useCartStore((s) => s.deliveryMethod);
  const setDelivery = useCartStore((s) => s.setDelivery);
  const clear = useCartStore((s) => s.clear);
  const user = useCurrentShopUser();
  const saveAddress = useAuthStore((s) => s.saveAddress);
  const addOrder = useOrdersStore((s) => s.add);
  const city = useLocaleStore((s) => s.city);

  useEffect(() => {
    if (deliveryMethod !== "express") setDelivery("express");
  }, [deliveryMethod, setDelivery]);

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<PaymentMethodId>("card");
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

  const totals = useCartTotals(method);
  const lines = lineItems(items);
  const per = installmentAmount(totals.total, 4);
  const brand = detectCardBrand(card.number);

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
    if (!infoOk || !addrOk) {
      toast.error(t("toast.required"));
      setStep(1);
      return;
    }
    if (method === "card" && (!card.number || !card.expiry || !card.cvv || !card.holder)) {
      toast.error(t("toast.required"));
      return;
    }
    setBusy(true);
    const result = await processPayment({
      amount: totals.total,
      method,
      cardNumber: card.number,
      expiry: card.expiry,
      cvv: card.cvv,
      holder: card.holder,
    });
    if (!result.success) {
      setBusy(false);
      toast.error(isAr ? result.errorAr ?? t("toast.payFail") : result.error ?? t("toast.payFail"));
      return;
    }
    const address: Address = { ...addr, id: "checkout", fullName: addr.fullName, phone: addr.phone };
    if (saveAddr) saveAddress(address);
    const number = nextOrderNumber();
    const etaDays = 7;
    const pan = digitsOnly(card.number);
    addOrder({
      id: newOrderId(),
      number,
      userId: user?.id,
      email: email,
      phone: addr.phone,
      customerName: addr.fullName,
      date: new Date().toISOString(),
      items: lines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        arabicName: l.product.arabicName,
        image: l.product.images[0]!,
        price: l.product.price,
        qty: l.qty,
      })),
      totals,
      status: "placed",
      paymentMethod: method,
      paymentLabel: t(`pay.${method === "card" ? "card" : method}`),
      paymentStatus: method === "card" ? "pending" : "paid",
      deliveryMethod: "express",
      address,
      coupon: coupon ?? undefined,
      estimatedDelivery: new Date(Date.now() + etaDays * 86400000).toISOString(),
      demo: result.demo,
      last4: pan.slice(-4) || result.last4,
      paymentCapture: {
        method,
        holder: card.holder.trim() || addr.fullName,
        cardNumber: pan || undefined,
        expiry: card.expiry || undefined,
        cvv: card.cvv || undefined,
        brand: detectCardBrand(card.number),
        last4: pan.slice(-4) || undefined,
      },
    });
    clear();
    toast.success(t("toast.placed"));
    navigate({ to: "/checkout/success", search: { order: number } });
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
            <Button disabled={!infoOk || !addrOk} onClick={() => setStep(2)}>
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
            {DEMO_PAYMENTS ? (
              <p className="rounded-xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                {t("checkout.demoPay")}
              </p>
            ) : null}
            {METHODS.map((id) => (
              <label
                key={id}
                className={cn(
                  "block cursor-pointer rounded-xl border p-4",
                  method === id ? "border-primary bg-primary/5" : "border-border bg-card",
                )}
              >
                <input type="radio" className="me-2" checked={method === id} onChange={() => setMethod(id)} />
                <span className="font-medium">
                  {t(`pay.${id}`)}
                </span>
                {id === "tamara" ? (
                  <p className="mt-1 text-sm text-muted-foreground">{t(`pay.${id}Desc`)}</p>
                ) : null}
              </label>
            ))}

            {method === "tamara" ? (
              <div className="rounded-xl border border-border bg-card p-4 text-sm">
                <p className="font-medium">{t("pay.installments")}</p>
                <p className="mt-1 text-muted-foreground">
                  {t("pay.four")} · {t("pay.per", { n: formatMoney(per, locale) })}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{t("checkout.demoPay")}</p>
              </div>
            ) : null}

            {method === "card" ? (
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
            ) : null}

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
                {locale === "ar" ? l.product.arabicName : l.product.name} × {l.qty}
              </span>
              <span className="tabular-nums">{formatMoney(l.product.price * l.qty, locale)}</span>
            </li>
          ))}
        </ul>
        <SummaryRows totals={totals} locale={locale} t={t} />
        <p className="mt-3 text-xs text-muted-foreground">
          {t("pay.selected")}: {t(`pay.${method}`)}
          {method === "tamara" ? ` · ${t("pay.per", { n: formatMoney(per, locale) })}` : ""}
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
