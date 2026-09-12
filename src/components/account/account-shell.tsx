import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { useAuthStore, useCurrentShopUser } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/account", key: "account.overview", end: true },
  { to: "/orders", key: "account.orders" },
  { to: "/wishlist", key: "account.wishlist" },
  { to: "/account/profile", key: "account.profile" },
  { to: "/account/addresses", key: "account.addresses" },
  { to: "/account/payment-methods", key: "account.payments" },
  { to: "/account/notifications", key: "account.notifications" },
] as const;

export function AccountShell() {
  const { t, isAr } = useT();
  const user = useCurrentShopUser();
  const logout = useAuthStore((s) => s.logout);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[14rem_1fr]">
      <aside className="h-fit rounded-2xl border border-border bg-card p-4">
        <p className="px-2 text-sm font-semibold">
          {user ? `${t("account.hello")}${isAr ? "،" : ","} ${user.name}` : t("account.title")}
        </p>
        <nav className="mt-3 flex flex-col">
          {LINKS.map((l) => {
            const active = "end" in l && l.end ? pathname === l.to : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn("rounded-md px-2 py-2.5 text-sm", active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted")}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>
        {user ? (
          <Button variant="ghost" className="mt-3 w-full justify-start" onClick={() => logout()}>
            {t("account.logout")}
          </Button>
        ) : (
          <Button asChild className="mt-3 w-full">
            <Link to="/login">{t("auth.login")}</Link>
          </Button>
        )}
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
