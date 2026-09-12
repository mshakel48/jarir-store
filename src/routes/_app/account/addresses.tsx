import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITY_IDS } from "@/lib/data/stores";
import { formatSaudiPhone } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useAuthStore } from "@/lib/store/auth";

export const Route = createFileRoute("/_app/account/addresses")({
  component: AddressesPage,
});

function AddressesPage() {
  const { t } = useT();
  const addresses = useAuthStore((s) => s.addresses);
  const saveAddress = useAuthStore((s) => s.saveAddress);
  const removeAddress = useAuthStore((s) => s.removeAddress);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "riyadh",
    district: "",
    street: "",
    building: "",
    apartment: "",
    postalCode: "",
    isDefault: true,
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("account.addresses")}</h1>
        <Button onClick={() => setOpen(true)}>{t("account.addAddress")}</Button>
      </div>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className="rounded-2xl border border-border bg-card p-4 text-sm">
            <p className="font-medium">{a.fullName}</p>
            <p className="mt-1 text-muted-foreground">
              {a.street} {a.building}, {a.district}, {t(`cities.${a.city}`)}
            </p>
            <p className="text-muted-foreground">{a.phone}</p>
            {a.isDefault ? <p className="mt-2 text-xs text-primary">{t("account.default")}</p> : null}
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => removeAddress(a.id)}>
              {t("common.delete")}
            </Button>
          </li>
        ))}
      </ul>
      {open ? (
        <form
          className="mt-6 grid max-w-lg gap-3 rounded-2xl border border-border bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveAddress({ ...form, phone: formatSaudiPhone(form.phone) });
            toast.success(t("toast.address"));
            setOpen(false);
          }}
        >
          <Label>{t("checkout.fullName")}</Label>
          <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Label>{t("checkout.phone")}</Label>
          <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: formatSaudiPhone(e.target.value) })} />
          <Label>{t("checkout.city")}</Label>
          <select className="h-11 rounded-md border border-input bg-card px-3" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
            {CITY_IDS.map((id) => (
              <option key={id} value={id}>
                {t(`cities.${id}`)}
              </option>
            ))}
          </select>
          <Label>{t("checkout.district")}</Label>
          <Input required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <Label>{t("checkout.street")}</Label>
          <Input required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          <Label>{t("checkout.building")}</Label>
          <Input required value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
          <Button type="submit">{t("common.save")}</Button>
        </form>
      ) : null}
    </div>
  );
}
