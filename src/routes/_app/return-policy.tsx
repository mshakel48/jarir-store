import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/return-policy")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  return (
    <LegalPage
      title={t("footer.returnPolicy")}
      actions={[
        { to: "/returns", label: t("footer.returns") },
        { to: "/orders", label: t("header.orders") },
        { to: "/help", label: t("footer.help") },
      ]}
    >
      <p>
        {ar
          ? "اطلب الإرجاع من الحساب أو من الفرع خلال ١٤ يوماً. يُراجع الطلب خلال ٣ أيام عمل ويُعاد المبلغ بنفس طريقة الدفع التجريبية."
          : "Request a return from your account or a branch within 14 days. We review within 3 business days and refund via the same demo payment method."}
      </p>
      <p>
        {ar
          ? "الإلكترونيات تحتاج الفاتورة والرقم التسلسلي والتغليف الأصلي غير المفتوح للأختام الأمنية."
          : "Electronics need the invoice, serial number, and original packaging with security seals intact."}
      </p>
    </LegalPage>
  );
}
