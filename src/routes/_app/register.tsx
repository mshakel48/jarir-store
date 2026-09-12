import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatSaudiPhone, isValidEmail, isValidSaudiPhone } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useAuthStore } from "@/lib/store/auth";

export const Route = createFileRoute("/_app/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) return setError(t("auth.needTerms"));
    if (form.password !== form.confirm) return setError(t("auth.mismatch"));
    if (!isValidEmail(form.email) || !isValidSaudiPhone(form.phone) || form.name.trim().length < 2) {
      return setError(t("checkout.required"));
    }
    const res = register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (!res.ok) return setError(t("auth.bad"));
    toast.success(t("toast.saved"));
    navigate({ to: "/account" });
  }

  return (
    <div className="container-page flex max-w-md flex-col py-12">
      <Logo />
      <h1 className="mt-8 text-2xl font-semibold">{t("auth.register")}</h1>
      <form className="mt-6 space-y-4" onSubmit={submit}>
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
        <div>
          <Label>{t("auth.password")}</Label>
          <Input className="mt-1" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <Label>{t("auth.confirm")}</Label>
          <Input className="mt-1" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          {t("auth.terms")}
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" type="submit">
          {t("auth.register")}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        {t("auth.hasAccount")}{" "}
        <Link to="/login" className="font-medium text-primary">
          {t("auth.login")}
        </Link>
      </p>
    </div>
  );
}
