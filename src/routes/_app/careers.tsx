import { CONTACT_EMAIL } from "@/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/careers")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  return (
    <LegalPage
      title={t("footer.careers")}
      actions={[
        { to: "/about", label: t("footer.aboutUs") },
        { to: "/contact", label: t("footer.contact") },
        { to: "/stores", label: t("header.locations") },
      ]}
    >
      <p>
        {ar
          ? "نبحث عن زملاء في البيع، الخدمات اللوجستية، الدعم الفني، والمحتوى في فروع متجر جرير والمتجر الإلكتروني."
          : "We hire for sales, logistics, tech support and content across Jarir Store branches and the online shop."}
      </p>
      <p>{ar ? `أرسل سيرتك إلى ${CONTACT_EMAIL}` : `Send your CV to ${CONTACT_EMAIL}`}</p>
      <Button asChild className="mt-2">
        <a href={`mailto:${CONTACT_EMAIL}`}>{ar ? "أرسل سيرتك" : "Send your CV"}</a>
      </Button>
    </LegalPage>
  );
}
