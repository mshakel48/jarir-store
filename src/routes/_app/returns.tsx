import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/returns")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  return (
    <LegalPage
      title={t("footer.returns")}
      actions={[
        { to: "/orders", label: t("header.orders") },
        { to: "/return-policy", label: t("footer.returnPolicy") },
        { to: "/stores", label: t("header.locations") },
        { to: "/help", label: t("footer.help") },
      ]}
    >
      <p>
        {ar
          ? "إرجاع خلال ١٤ يوماً للمنتجات غير المستخدمة في تغليفها الأصلي. الكتب غير المغلفة تُقبل إذا بقيت بحالة البيع."
          : "Returns within 14 days for unused items in original packaging. Unwrapped books are accepted if they remain in saleable condition."}
      </p>
      <p>
        {ar
          ? "ابدأ الطلب من صفحة الطلبات في حسابك، أو سلّم المنتج في أقرب فرع متجر جرير."
          : "Start from Orders in your account, or hand the item in at the nearest Jarir Store branch."}
      </p>
    </LegalPage>
  );
}
