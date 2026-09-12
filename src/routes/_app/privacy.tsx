import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/privacy")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  return (
    <LegalPage
      title={t("footer.privacy")}
      actions={[
        { to: "/terms", label: t("footer.terms") },
        { to: "/help", label: t("footer.help") },
        { to: "/contact", label: t("footer.contact") },
      ]}
    >
      <p>
        {ar
          ? "نجمع اسمك وبريدك ورقم جوالك وعنوان التوصيل لتشغيل الطلب فقط. لا نخزّن أرقام البطاقات ولا رمز CVV، ولا نبيع بياناتك لأطراف ثالثة."
          : "We collect your name, email, mobile number and delivery address only to run your order. We never store card numbers or CVV, and we do not sell your data."}
      </p>
      <p>
        {ar
          ? "في هذه النسخة التجريبية تُحفظ السلة والحساب والطلبات في LocalStorage على جهازك. يمكنك مسح بيانات الموقع من المتصفح في أي وقت."
          : "In this demo, cart, account and orders are saved in LocalStorage on your device. You can clear site data from the browser at any time."}
      </p>
    </LegalPage>
  );
}
