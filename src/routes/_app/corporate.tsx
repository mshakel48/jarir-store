import { CONTACT_EMAIL } from "@/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/corporate")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  return (
    <LegalPage
      title={t("footer.corporate")}
      actions={[
        { to: "/contact", label: t("footer.contact") },
        { to: "/products", label: t("home.shopNow") },
        { to: "/about", label: t("footer.aboutUs") },
      ]}
    >
      <p>
        {ar
          ? "مبيعات الشركات والمؤسسات في متجر جرير: أجهزة محمولة، تراخيص برمجيات، وكتب تعليمية مع فواتير ضريبية وعروض كميات."
          : "Jarir Store corporate sales: laptops, software licences and educational books with tax invoices and volume quotes."}
      </p>
      <p>{ar ? `البريد: ${CONTACT_EMAIL}` : `Email: ${CONTACT_EMAIL}`}</p>
      <Button asChild className="mt-2">
        <a href={`mailto:${CONTACT_EMAIL}`}>{ar ? "تواصل مع المبيعات" : "Contact sales"}</a>
      </Button>
    </LegalPage>
  );
}
