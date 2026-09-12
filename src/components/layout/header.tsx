import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Heart,
  HelpCircle,
  Info,
  LayoutGrid,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NAV_CATEGORIES } from "@/lib/data/categories";
import { searchProducts, uniqueBrandPairs } from "@/lib/data/catalog";
import { CITY_IDS } from "@/lib/data/stores";
import { POPULAR_SEARCHES, CONTACT_PHONE, CONTACT_PHONE_TEL, WHATSAPP_URL } from "@/lib/constants";
import { productName } from "@/lib/data/products";
import { useHydrated } from "@/lib/hooks";
import { useT } from "@/lib/i18n";
import { useCurrentShopUser } from "@/lib/store/auth";
import { useCartCount } from "@/lib/store/cart";
import { useLocaleStore } from "@/lib/store/locale";
import { useViewedStore } from "@/lib/store/viewed";
import { useWishlistStore } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const cartCount = useCartCount();
  const wishCount = useWishlistStore((s) => s.ids.length);
  const user = useCurrentShopUser();
  const city = useLocaleStore((s) => s.city);
  const setCity = useLocaleStore((s) => s.setCity);
  const toggleLocale = useLocaleStore((s) => s.toggleLocale);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const recent = useViewedStore((s) => s.searches);
  const addSearch = useViewedStore((s) => s.addSearch);
  const brands = useMemo(() => uniqueBrandPairs(), []);

  const suggestions = useMemo(() => (query.trim().length >= 2 ? searchProducts({ q: query }).slice(0, 6) : []), [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = e.target as Node;
      if (!box.current?.contains(el)) {
        setOpen(false);
        setCatsOpen(false);
        setBrandsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function goSearch(q: string) {
    const value = q.trim();
    if (!value) return;
    addSearch(value);
    setOpen(false);
    setMenu(false);
    navigate({ to: "/search", search: { q: value } });
  }

  const util = [
    { to: user ? "/account" : "/login", icon: User, label: t("header.login") },
    { to: "/wishlist", icon: Heart, label: t("header.wishlist"), count: wishCount },
    { to: "/orders", icon: Truck, label: t("header.orders") },
    { to: "/corporate", icon: LayoutGrid, label: t("header.services") },
    { to: "/help", icon: HelpCircle, label: t("header.help") },
    { to: "/stores", icon: MapPin, label: t("header.locations") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-card">
      <div className="border-b border-border bg-muted">
        <div className="container-page flex items-center gap-1 overflow-x-auto py-1.5 text-[11px] text-muted-foreground md:text-xs">
          {util.map((item) => (
            <Link
              key={item.to + item.label}
              to={item.to}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 hover:bg-card hover:text-foreground"
            >
              <item.icon className="size-3.5" />
              {item.label}
              {"count" in item && hydrated && item.count > 0 ? (
                <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{item.count}</span>
              ) : null}
            </Link>
          ))}
          <span className="ms-auto flex shrink-0 items-center gap-1">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-[#128C7E] hover:bg-card"
            >
              {t("footer.whatsapp")}
            </a>
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="hidden items-center gap-1 rounded-md px-2 py-1 hover:bg-card hover:text-foreground sm:flex"
              dir="ltr"
            >
              {CONTACT_PHONE}
            </a>
            <Link to="/stores" className="hidden items-center gap-1 rounded-md px-2 py-1 hover:bg-card hover:text-foreground sm:flex">
              <Info className="size-3.5" />
              {t("header.country")}
            </Link>
            <button type="button" onClick={toggleLocale} className="rounded-md px-2 py-1 hover:bg-card hover:text-foreground">
              {t("common.language")}
            </button>
          </span>
        </div>
      </div>

      <div className="border-b border-border">
        <div ref={box} className="container-page flex items-center gap-2 py-3 md:gap-3">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full hover:bg-muted lg:hidden"
            onClick={() => setMenu(true)}
            aria-label={t("header.menu")}
          >
            <Menu className="size-5" />
          </button>
          <Logo compact />

          <label className="relative hidden h-11 min-w-52 max-w-64 cursor-pointer items-center rounded-full border border-border bg-card px-4 text-sm text-muted-foreground xl:flex">
            <span className="truncate pe-4">{t("header.location")}</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label={t("header.location")}
            >
              {CITY_IDS.filter((c) => c !== "other").map((id) => (
                <option key={id} value={id}>
                  {t(`cities.${id}`)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 size-4" />
          </label>

          <form
            className="relative hidden min-w-0 flex-1 md:block"
            onSubmit={(e) => {
              e.preventDefault();
              goSearch(query);
            }}
          >
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setCatsOpen(false);
                setBrandsOpen(false);
              }}
              onFocus={() => setOpen(true)}
              placeholder={t("header.search")}
              className="h-11 rounded-full border-border bg-muted/60 ps-10 pe-4"
              aria-label={t("header.search")}
            />
            {open ? (
              <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-lift">
                {suggestions.length ? (
                  <ul className="py-2">
                    {suggestions.map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/products/$id"
                          params={{ id: p.id }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-muted"
                          onClick={() => setOpen(false)}
                        >
                          <img src={p.images[0]} alt="" className="size-10 rounded-md object-cover" />
                          <span className="min-w-0 flex-1 truncate text-sm">{productName(p, locale)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="grid gap-4 p-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("header.recent")}</p>
                      {recent.length ? (
                        recent.map((s) => (
                          <button key={s} type="button" className="block w-full rounded-md px-2 py-1.5 text-start text-sm hover:bg-muted" onClick={() => goSearch(s)}>
                            {s}
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">{t("header.noResults")}</p>
                      )}
                    </div>
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("header.popular")}</p>
                      {POPULAR_SEARCHES.map((s) => (
                        <button key={s} type="button" className="block w-full rounded-md px-2 py-1.5 text-start text-sm hover:bg-muted" onClick={() => goSearch(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </form>

          <div className="relative hidden lg:block">
            <button
              type="button"
              className="flex h-11 items-center gap-1 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
              onClick={() => {
                setCatsOpen((v) => !v);
                setBrandsOpen(false);
                setOpen(false);
              }}
            >
              {t("header.categories")}
              <ChevronDown className="size-4" />
            </button>
            {catsOpen ? (
              <div className="absolute end-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-xl border border-border bg-card py-2 shadow-lift">
                {NAV_CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="block px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setCatsOpen(false)}
                  >
                    {t(c.navKey)}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative hidden lg:block">
            <button
              type="button"
              className="flex h-11 items-center gap-1 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
              onClick={() => {
                setBrandsOpen((v) => !v);
                setCatsOpen(false);
                setOpen(false);
              }}
            >
              {t("header.brands")}
              <ChevronDown className="size-4" />
            </button>
            {brandsOpen ? (
              <div className="absolute end-0 top-[calc(100%+8px)] z-50 max-h-80 w-64 overflow-auto rounded-xl border border-border bg-card py-2 shadow-lift">
                {brands.map(([en, ar]) => (
                  <button
                    key={en}
                    type="button"
                    className="block w-full px-4 py-2 text-start text-sm hover:bg-muted"
                    onClick={() => {
                      setBrandsOpen(false);
                      goSearch(locale === "ar" ? ar : en);
                    }}
                  >
                    {locale === "ar" ? ar : en}
                  </button>
                ))}
                <Link
                  to="/brands"
                  className="block border-t border-border px-4 py-2 text-sm font-semibold text-primary"
                  onClick={() => setBrandsOpen(false)}
                >
                  {t("home.viewAll")}
                </Link>
              </div>
            ) : null}
          </div>

          <Link
            to="/cart"
            className="relative ms-auto flex size-11 items-center justify-center rounded-full border border-border hover:bg-muted"
            aria-label={t("header.cart")}
          >
            <ShoppingCart className="size-5" />
            {hydrated && cartCount > 0 ? (
              <span className="absolute -end-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>

        <form
          className="container-page pb-3 md:hidden"
          onSubmit={(e) => {
            e.preventDefault();
            goSearch(query);
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("header.search")}
              className="h-11 rounded-full bg-muted/60 ps-10"
            />
          </div>
        </form>
      </div>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent className="overflow-y-auto p-5 pt-14">
          <Logo />
          <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("header.categories")}</p>
          <div className="flex flex-col">
            {NAV_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="rounded-md px-2 py-3 text-sm font-medium hover:bg-muted"
                onClick={() => setMenu(false)}
              >
                {t(c.navKey)}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <Button asChild variant="secondary">
              <Link to={user ? "/account" : "/login"} onClick={() => setMenu(false)}>
                {user ? t("account.title") : t("header.signIn")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/orders" onClick={() => setMenu(false)}>
                {t("header.orders")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/brands" onClick={() => setMenu(false)}>
                {t("header.brands")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/stores" onClick={() => setMenu(false)}>
                {t("header.locations")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={() => setMenu(false)}>
                {t("footer.quickWhatsapp")}
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/help" onClick={() => setMenu(false)}>
                {t("header.help")}
              </Link>
            </Button>
            <Button variant="outline" onClick={toggleLocale}>
              {t("common.language")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
