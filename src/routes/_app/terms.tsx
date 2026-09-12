import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/terms")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  return (
    <LegalPage
      title={t("footer.terms")}
      actions={[
        { to: "/privacy", label: t("footer.privacy") },
        { to: "/shipping", label: t("footer.shipping") },
        { to: "/return-policy", label: t("footer.returnPolicy") },
      ]}
    >
      <p>
        {ar
          ? "باستخدام متجر جرير أنت توافق على أن الأسعار بالريال السعودي شاملة ضريبة القيمة المضافة ١٥٪، وعلى سياسة الشحن والإرجاع المعلنة في هذه الصفحات."
          : "By using Jarir Store you agree that prices are in Saudi riyals including 15% VAT, and that the published shipping and return policies apply."}
      </p>
      <p>
        {ar
          ? "هذا المتجر نسخة تجريبية للعرض. لا تُعالَج مدفوعات حقيقية، ولا تُخزَّن أرقام البطاقات. الطلبات التجريبية تُحفظ محلياً في متصفحك."
          : "This store is a demo. No real payments are processed and card numbers are never stored. Demo orders are saved locally in your browser."}
      </p>
    </LegalPage>
  );
}
