import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/about")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  return (
    <LegalPage
      title={t("footer.aboutUs")}
      actions={[
        { to: "/stores", label: t("header.locations") },
        { to: "/careers", label: t("footer.careers") },
        { to: "/corporate", label: t("footer.corporate") },
        { to: "/products", label: t("home.shopNow") },
      ]}
    >
      <p>
        {ar
          ? "متجر جرير منصة تجارة إلكترونية سعودية للكتب والإلكترونيات والمستلزمات المدرسية والمكتبية. نخدم العملاء في أنحاء المملكة عبر المتجر الإلكتروني وفروع التحلية وغرناطة وجدة والظهران وغيرها."
          : "Jarir Store is a Saudi online shop for books, electronics, school and office supplies. We serve customers across the Kingdom through the store and branches in Tahlia, Granada, Jeddah, Dhahran and more."}
      </p>
      <p>
        {ar
          ? "نبيع أجهزة بضمان رسمي، وكتباً بالعربية والإنجليزية، ونوفّر الدفع بتمارا والبطاقة. الأسعار بالريال السعودي شاملة ضريبة القيمة المضافة ١٥٪."
          : "We sell devices with official warranty, Arabic and English books, and accept Tamara and card. Prices are in Saudi riyals and include 15% VAT."}
      </p>
    </LegalPage>
  );
}
