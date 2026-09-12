import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/shipping")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  return (
    <LegalPage
      title={t("footer.shipping")}
      actions={[
        { to: "/orders", label: t("header.orders") },
        { to: "/returns", label: t("footer.returns") },
        { to: "/help", label: t("footer.help") },
      ]}
    >
      <p>
        {ar
          ? "التوصيل السريع داخل المملكة خلال ٧ أيام مقابل ٤٩ ر.س. مجاني للطلبات فوق ٢٠٠ ر.س."
          : "Express delivery across Saudi Arabia within 7 days for 49 SAR. Free on orders over 200 SAR."}
      </p>
      <p>
        {ar
          ? "طرق الدفع المتاحة: تمارا وبطاقة."
          : "Accepted payments: Tamara and card."}
      </p>
    </LegalPage>
  );
}
