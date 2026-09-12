import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { useAuthStore } from "@/lib/store/auth";

type Search = { redirect?: string };

export const Route = createFileRoute("/_app/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(email, password)) {
      setError(t("auth.bad"));
      return;
    }
    void remember;
    if (redirect) router.history.push(redirect);
    else void navigate({ to: "/account" });
  }

  return (
    <div className="container-page flex max-w-md flex-col py-12">
      <Logo />
      <h1 className="mt-8 text-2xl font-semibold">{t("auth.login")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("auth.demo")}</p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <Label>{t("auth.emailPhone")}</Label>
          <Input className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </div>
        <div>
          <Label>{t("auth.password")}</Label>
          <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          {t("auth.remember")}
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" type="submit">
          {t("auth.login")}
        </Button>
      </form>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <Link to="/forgot-password" className="text-primary">
          {t("auth.forgot")}
        </Link>
        <p>
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="font-medium text-primary">
            {t("auth.register")}
          </Link>
        </p>
        <Button variant="ghost" asChild>
          <Link to="/checkout">{t("auth.guest")}</Link>
        </Button>
      </div>
    </div>
  );
}
