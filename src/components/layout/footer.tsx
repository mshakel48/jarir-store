import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { BRAND_NAME, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, WHATSAPP_URL } from "@/lib/constants";
import { NAV_CATEGORIES } from "@/lib/data/categories";
import { useT } from "@/lib/i18n";

function PayMark({ label, to }: { label: string; to: "/help" | "/account/payment-methods" | "/shipping" }) {
  return (
    <Link
      to={to}
      className="inline-flex h-8 min-w-12 items-center justify-center rounded-md border border-border bg-card px-2 text-[10px] font-semibold tracking-wide text-foreground hover:border-primary"
    >
      {label}
    </Link>
  );
}

export function Footer() {
  const { t } = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-border bg-charcoal text-charcoal-foreground">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <Logo inverse />
          <p className="mt-4 max-w-xs text-sm text-charcoal-foreground/70">{t("brand.tagline")}</p>
          <div className="mt-4 space-y-2 text-sm">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-semibold text-[#25D366] hover:underline">
              {t("footer.quickWhatsapp")}
            </a>
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="block tabular-nums hover:underline" dir="ltr">
              {CONTACT_PHONE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="block hover:underline">
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/login" className="text-sm underline-offset-4 hover:underline">{t("header.signIn")}</Link>
            <span className="text-charcoal-foreground/30">·</span>
            <Link to="/register" className="text-sm underline-offset-4 hover:underline">{t("auth.register")}</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("header.shop")}</h3>
          <ul className="space-y-2 text-sm text-charcoal-foreground/75">
            {NAV_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-charcoal-foreground">
                  {t(c.navKey)}
                </Link>
              </li>
            ))}
            <li><Link to="/brands" className="hover:text-charcoal-foreground">{t("header.brands")}</Link></li>
            <li><Link to="/products" className="hover:text-charcoal-foreground">{t("home.viewAll")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("footer.customer")}</h3>
          <ul className="space-y-2 text-sm text-charcoal-foreground/75">
            <li><Link to="/contact" className="hover:text-charcoal-foreground">{t("footer.contact")}</Link></li>
            <li><Link to="/help" className="hover:text-charcoal-foreground">{t("footer.help")}</Link></li>
            <li><Link to="/shipping" className="hover:text-charcoal-foreground">{t("footer.shipping")}</Link></li>
            <li><Link to="/returns" className="hover:text-charcoal-foreground">{t("footer.returns")}</Link></li>
            <li><Link to="/orders" className="hover:text-charcoal-foreground">{t("footer.track")}</Link></li>
            <li><Link to="/wishlist" className="hover:text-charcoal-foreground">{t("header.wishlist")}</Link></li>
            <li><Link to="/cart" className="hover:text-charcoal-foreground">{t("header.cart")}</Link></li>
            <li><Link to="/account" className="hover:text-charcoal-foreground">{t("account.title")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("footer.about")}</h3>
          <ul className="space-y-2 text-sm text-charcoal-foreground/75">
            <li><Link to="/about" className="hover:text-charcoal-foreground">{t("footer.aboutUs")}</Link></li>
            <li><Link to="/stores" className="hover:text-charcoal-foreground">{t("footer.stores")}</Link></li>
            <li><Link to="/careers" className="hover:text-charcoal-foreground">{t("footer.careers")}</Link></li>
            <li><Link to="/corporate" className="hover:text-charcoal-foreground">{t("footer.corporate")}</Link></li>
            <li><Link to="/brands" className="hover:text-charcoal-foreground">{t("header.brands")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("footer.policies")}</h3>
          <ul className="space-y-2 text-sm text-charcoal-foreground/75">
            <li><Link to="/privacy" className="hover:text-charcoal-foreground">{t("footer.privacy")}</Link></li>
            <li><Link to="/terms" className="hover:text-charcoal-foreground">{t("footer.terms")}</Link></li>
            <li><Link to="/return-policy" className="hover:text-charcoal-foreground">{t("footer.returnPolicy")}</Link></li>
          </ul>
          <p className="mt-5 text-xs text-charcoal-foreground/60">{t("footer.social")}</p>
          <div className="mt-2 flex flex-col gap-2 text-sm">
            <Link to="/contact" className="hover:underline">Instagram</Link>
            <Link to="/contact" className="hover:underline">X</Link>
            <Link to="/contact" className="hover:underline">Facebook</Link>
            <Link to="/contact" className="hover:underline">YouTube</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-charcoal-foreground/60">{t("footer.copy", { year })}</p>
          <div className="flex flex-wrap items-center gap-2">
            <PayMark label="Visa" to="/account/payment-methods" />
            <PayMark label="Mastercard" to="/account/payment-methods" />
          </div>
        </div>
        <p className="container-page pb-6 text-[11px] text-charcoal-foreground/45">
          {t("brand.vat")} · {BRAND_NAME}
        </p>
      </div>
    </footer>
  );
}
