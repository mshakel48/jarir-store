import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detectCardBrand, digitsOnly } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useAuthStore } from "@/lib/store/auth";

export const Route = createFileRoute("/_app/account/payment-methods")({
  component: PaymentMethodsPage,
});

function PaymentMethodsPage() {
  const { t } = useT();
  const methods = useAuthStore((s) => s.paymentMethods);
  const add = useAuthStore((s) => s.addPaymentMethod);
  const remove = useAuthStore((s) => s.removePaymentMethod);
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [holder, setHolder] = useState("");

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">{t("account.payments")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("pay.neverStore")}</p>
      <ul className="mt-6 space-y-3">
        {methods.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <span className="text-sm font-medium uppercase">
              {m.brand} · ••{m.last4}
            </span>
            <Button variant="ghost" size="sm" onClick={() => remove(m.id)}>
              {t("common.delete")}
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const last4 = digitsOnly(number).slice(-4);
          if (last4.length < 4) return;
          const brand = detectCardBrand(number);
          add({
            brand: brand === "unknown" ? "visa" : brand,
            last4,
            expiry,
            holder,
          });
          setNumber("");
          setExpiry("");
          setHolder("");
          toast.success(t("toast.saved"));
        }}
      >
        <Label>{t("pay.cardNumber")}</Label>
        <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="••••" />
        <Label>{t("pay.expiry")}</Label>
        <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
        <Label>{t("pay.holder")}</Label>
        <Input value={holder} onChange={(e) => setHolder(e.target.value)} />
        <Button type="submit">{t("common.save")}</Button>
      </form>
    </div>
  );
}
