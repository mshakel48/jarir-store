import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatSaudiPhone } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useAuthStore, useCurrentShopUser } from "@/lib/store/auth";

export const Route = createFileRoute("/_app/account/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useT();
  const user = useCurrentShopUser();
  const update = useAuthStore((s) => s.updateProfile);
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" });
  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, phone: user.phone });
  }, [user]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">{t("account.profile")}</h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          update({ ...form, phone: formatSaudiPhone(form.phone) });
          toast.success(t("toast.saved"));
        }}
      >
        <div>
          <Label>{t("auth.name")}</Label>
          <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label>{t("checkout.email")}</Label>
          <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label>{t("checkout.phone")}</Label>
          <Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: formatSaudiPhone(e.target.value) })} />
        </div>
        <Button type="submit" disabled={!user}>
          {t("account.save")}
        </Button>
      </form>
    </div>
  );
}
