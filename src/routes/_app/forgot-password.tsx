import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/forgot-password")({
  component: ForgotPage,
});

function ForgotPage() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="container-page max-w-md py-12">
      <Logo />
      <h1 className="mt-8 text-2xl font-semibold">{t("auth.forgot")}</h1>
      {sent ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("auth.resetSent")}</p>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div>
            <Label>{t("checkout.email")}</Label>
            <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button className="w-full" type="submit">
            {t("auth.sendReset")}
          </Button>
        </form>
      )}
      <Link to="/login" className="mt-6 inline-block text-sm text-primary">
        {t("auth.login")}
      </Link>
    </div>
  );
}
