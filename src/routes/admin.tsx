import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTACT_EMAIL } from "@/lib/constants";
import { clearDeskKey, getDeskKey, setDeskKey } from "@/lib/desk";
import { useT } from "@/lib/i18n";
import { startDeskSync, stopDeskSync } from "@/lib/store/desk-sync";
import { startLiveEngine, useLiveStore } from "@/lib/store/live";
import { useLocaleStore } from "@/lib/store/locale";
import { useAuthStore, useCurrentShopUser } from "@/lib/store/auth";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const DASH = { to: "/admin", key: "admin.dashboard" } as const;

const OPS = [
  { to: "/admin/products", key: "admin.products" },
  { to: "/admin/categories", key: "admin.categories" },
  { to: "/admin/orders", key: "admin.orders" },
  { to: "/admin/customers", key: "admin.customers" },
  { to: "/admin/inventory", key: "admin.inventory" },
  { to: "/admin/coupons", key: "admin.coupons" },
  { to: "/admin/discounts", key: "admin.discounts" },
  { to: "/admin/reviews", key: "admin.reviews" },
  { to: "/admin/banners", key: "admin.banners" },
  { to: "/admin/stores", key: "admin.stores" },
] as const;

const FINANCE = [
  { to: "/admin/payments", key: "admin.payments" },
  { to: "/admin/analytics", key: "admin.analytics" },
] as const;

const LANGS: { id: Locale; label: string }[] = [
  { id: "ar", label: "عربي" },
  { id: "en", label: "EN" },
  { id: "ka", label: "ქარ" },
];

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "block rounded-lg px-3 py-1.5 text-sm transition-colors",
        active ? "bg-primary/10 font-semibold text-primary" : "text-foreground/70 hover:bg-black/5 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function AdminLangSwitch() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  return (
    <div className="flex rounded-lg border border-black/10 bg-white/70 p-0.5 text-xs font-semibold">
      {LANGS.map((lang) => (
        <button
          key={lang.id}
          type="button"
          onClick={() => setLocale(lang.id)}
          className={cn(
            "rounded-md px-2 py-1",
            locale === lang.id ? "bg-charcoal text-charcoal-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

function AdminLayout() {
  const { t } = useT();
  const user = useCurrentShopUser();
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const online = useLiveStore((s) => s.visitors.length);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const unlocked = Boolean(user && user.role === "admin" && getDeskKey());

  useEffect(() => {
    if (!unlocked) return;
    startLiveEngine();
    startDeskSync();
  }, [unlocked]);

  if (!unlocked) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#e4dfd8] px-4">
        <form
          className="w-full max-w-sm space-y-4 rounded-2xl border border-black/10 bg-[#f7f3ee] p-6 shadow-[var(--shadow-card)]"
          onSubmit={(e) => {
            e.preventDefault();
            const ok = login(email, password);
            const role = useAuthStore.getState().users.find((u) => u.email === email.trim().toLowerCase())?.role;
            if (!ok || role !== "admin") {
              setError(t("auth.bad"));
              return;
            }
            setDeskKey(password);
            startDeskSync();
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <Logo to="/" />
            <AdminLangSwitch />
          </div>
          <h1 className="text-lg font-semibold">{t("admin.title")}</h1>
          <p className="text-xs text-muted-foreground">{CONTACT_EMAIL}</p>
          <div>
            <Label>{t("checkout.email")}</Label>
            <Input className="mt-1 bg-white" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>{t("auth.password")}</Label>
            <Input className="mt-1 bg-white" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" type="submit">
            {t("auth.login")}
          </Button>
        </form>
      </div>
    );
  }

  const isDash = pathname === "/admin";

  return (
    <div className="flex min-h-dvh bg-[#e4dfd8]">
      <aside className="hidden w-60 shrink-0 border-e border-black/10 bg-[#f3eee8] md:flex md:flex-col">
        <div className="p-4">
          <Logo compact to="/" />
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <NavLink to={DASH.to} label={t(DASH.key)} active={isDash} />
          <p className="mt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("admin.groupOps")}
          </p>
          <div className="rounded-xl bg-black/[0.035] p-1">
            {OPS.map((l) => (
              <NavLink key={l.to} to={l.to} label={t(l.key)} active={pathname.startsWith(l.to)} />
            ))}
          </div>
          <div className="mt-3 space-y-0.5">
            {FINANCE.map((l) => (
              <NavLink key={l.to} to={l.to} label={t(l.key)} active={pathname.startsWith(l.to)} />
            ))}
          </div>
        </nav>
        <div className="space-y-2 border-t border-black/10 p-3">
          <AdminLangSwitch />
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              stopDeskSync();
              clearDeskKey();
              logout();
            }}
          >
            {t("account.logout")}
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-[#f3eee8]/90 px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold">{t("admin.title")}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative flex size-2 rounded-full bg-emerald-600" />
              </span>
              {t("admin.live")} · {online}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminLangSwitch />
            <Button asChild variant="outline" size="sm">
              <Link to="/">{t("admin.storefront")}</Link>
            </Button>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-black/10 bg-[#f3eee8] px-2 py-2 md:hidden">
          <NavLink to={DASH.to} label={t(DASH.key)} active={isDash} />
          {[...OPS, ...FINANCE].map((l) => (
            <NavLink key={l.to} to={l.to} label={t(l.key)} active={pathname.startsWith(l.to)} />
          ))}
        </nav>
        <div className="min-w-0 flex-1 overflow-auto p-4 md:p-6">
          <div className="rounded-2xl border border-black/5 bg-[#f7f3ee] p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
