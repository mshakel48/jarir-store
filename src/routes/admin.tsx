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
import { useAuthStore, useCurrentShopUser } from "@/lib/store/auth";
import { useLocaleStore } from "@/lib/store/locale";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

type NavLink = { to: string; key: string; end?: boolean };

const GROUPS: { label: string; links: NavLink[] }[] = [
  { label: "admin.groupMain", links: [{ to: "/admin", key: "admin.dashboard", end: true }] },
  { label: "admin.groupCatalog", links: [{ to: "/admin/products", key: "admin.products" }] },
  {
    label: "admin.groupOps",
    links: [
      { to: "/admin/categories", key: "admin.categories" },
      { to: "/admin/orders", key: "admin.orders" },
      { to: "/admin/customers", key: "admin.customers" },
      { to: "/admin/inventory", key: "admin.inventory" },
      { to: "/admin/coupons", key: "admin.coupons" },
      { to: "/admin/discounts", key: "admin.discounts" },
      { to: "/admin/reviews", key: "admin.reviews" },
      { to: "/admin/banners", key: "admin.banners" },
      { to: "/admin/stores", key: "admin.stores" },
    ],
  },
  { label: "admin.groupFinance", links: [{ to: "/admin/payments", key: "admin.payments" }] },
  { label: "admin.groupInsights", links: [{ to: "/admin/analytics", key: "admin.analytics" }] },
];

const LANGS: { id: Locale; label: string }[] = [
  { id: "ar", label: "العربية" },
  { id: "en", label: "English" },
  { id: "ka", label: "ქართული" },
];

function AdminLayout() {
  const { t, locale } = useT();
  const setLocale = useLocaleStore((s) => s.setLocale);
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
      <div className="admin-shell flex min-h-dvh items-center justify-center px-4">
        <form
          className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
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
          <Logo to="/" />
          <h1 className="text-lg font-semibold">{t("admin.title")}</h1>
          <p className="text-xs text-muted-foreground">{CONTACT_EMAIL}</p>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLocale(l.id)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-medium",
                  locale === l.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div>
            <Label>{t("checkout.email")}</Label>
            <Input className="mt-1" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>{t("auth.password")}</Label>
            <Input className="mt-1" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" type="submit">{t("auth.login")}</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 border-e border-border bg-card md:flex md:flex-col">
        <div className="p-4">
          <Logo compact to="/" />
        </div>
        <nav className="flex-1 space-y-3 overflow-y-auto px-2 pb-4">
          {GROUPS.map((group) => (
            <div key={group.label} className="rounded-xl bg-muted/70 p-1.5">
              <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t(group.label)}</p>
              {group.links.map((l) => {
                const active = l.end ? pathname === "/admin" : pathname.startsWith(l.to);
                return (
                  <Link key={l.to} to={l.to} className={cn("block rounded-lg px-3 py-2 text-sm transition-colors", active ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:bg-card/70")}>
                    {t(l.key)}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t("admin.language")}</p>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {LANGS.map((l) => (
              <button key={l.id} type="button" onClick={() => setLocale(l.id)} className={cn("flex-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium", locale === l.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {l.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { stopDeskSync(); clearDeskKey(); logout(); }}>
            {t("account.logout")}
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold">{t("admin.title")}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative flex size-2 rounded-full bg-emerald-500" />
              </span>
              {t("admin.live")} · {online}
            </span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">{t("admin.storefront")}</Link>
            </Button>
          </div>
        </header>
        <div className="flex min-w-0 flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
