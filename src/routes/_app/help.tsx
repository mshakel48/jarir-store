import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  RotateCcw,
  ShieldCheck,
  Store,
  Truck,
  User,
} from "lucide-react";
import { LegalPage } from "@/components/legal-page";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/help")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  const cards = [
    { to: "/orders", icon: Package, title: t("header.orders"), desc: ar ? "تتبع شحنتك برقم الطلب." : "Track your shipment by order number." },
    { to: "/shipping", icon: Truck, title: t("footer.shipping"), desc: ar ? "التوصيل خلال ٧ أيام. مجاني فوق ٢٠٠ ر.س." : "Delivery within 7 days. Free over 200 SAR." },
    { to: "/returns", icon: RotateCcw, title: t("footer.returns"), desc: ar ? "إرجاع خلال ١٤ يوماً." : "Returns within 14 days." },
    { to: "/stores", icon: MapPin, title: t("header.locations"), desc: ar ? "ابحث عن أقرب فرع." : "Find the nearest branch." },
    { to: "/account/payment-methods", icon: CreditCard, title: t("account.payments"), desc: ar ? "بطاقة ائتمان." : "Credit card." },
    { to: "/account", icon: User, title: t("account.title"), desc: ar ? "طلباتك وعناوينك ومفضلتك." : "Orders, addresses and wishlist." },
    { to: "/contact", icon: HelpCircle, title: t("footer.contact"), desc: ar ? "واتساب وخدمة العملاء 00966570680272." : "WhatsApp and customer care 00966570680272." },
    { to: "/about", icon: ShieldCheck, title: t("footer.aboutUs"), desc: ar ? "ضمان رسمي وضريبة مشمولة." : "Official warranty, VAT included." },
    { to: "/corporate", icon: Store, title: t("header.services"), desc: ar ? "مبيعات الشركات والعروض." : "Corporate sales and quotes." },
  ] as const;

  return (
    <LegalPage
      title={t("footer.help")}
      actions={[
        { to: "/products", label: t("home.shopNow") },
        { to: "/category/$slug", label: t("nav.deals"), params: { slug: "deals" } },
        { to: "/login", label: t("header.signIn") },
      ]}
    >
      <p>
        {ar
          ? "مركز مساعدة متجر جرير: تتبع الطلب، الشحن، الإرجاع، الكوبونات، والدفع بالبطاقة الائتمانية."
          : "Jarir Store help: order tracking, shipping, returns, coupons, and credit-card payment."}
      </p>
      <p>
        {ar
          ? "حساب تجريبي للتسوق: demo@jarir.sa / demo123 — ولوحة الإدارة: info@jarir.world / admin123."
          : "Shop demo: demo@jarir.sa / demo123 — admin: info@jarir.world / admin123."}
      </p>
      <p>
        {ar
          ? "كوبونات العرض: JARRIR10 و JARIR10 و WELCOME15 و SCHOOL20."
          : "Demo coupons: JARRIR10, JARIR10, WELCOME15, SCHOOL20."}
      </p>
      <div className="grid gap-3 pt-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-foreground hover:border-primary"
          >
            <c.icon className="mt-0.5 size-5 text-primary" />
            <span>
              <span className="block font-semibold">{c.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{c.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </LegalPage>
  );
}
