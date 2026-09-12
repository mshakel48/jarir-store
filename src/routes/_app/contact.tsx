import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, WHATSAPP_URL } from "@/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/contact")({
  component: Page,
});

function Page() {
  const { t, locale } = useT();
  const ar = locale === "ar";
  return (
    <LegalPage
      title={t("footer.contact")}
      actions={[
        { to: "/help", label: t("footer.help") },
        { to: "/stores", label: t("header.locations") },
        { to: "/orders", label: t("header.orders") },
        { to: "/account", label: t("account.title") },
      ]}
    >
      <p>
        {ar
          ? `خدمة عملاء متجر جرير · ${CONTACT_PHONE} · يومياً من ٩ صباحاً حتى ١٠ مساءً.`
          : `Jarir Store customer care · ${CONTACT_PHONE} · daily 9:00–22:00.`}
      </p>
      <p>{ar ? `البريد: ${CONTACT_EMAIL}` : `Email: ${CONTACT_EMAIL}`}</p>
      <p>
        {ar
          ? "للتواصل السريع اضغط واتساب في الأسفل، أو استخدم تتبع الطلب من حسابك."
          : "For a quick reply, tap WhatsApp below, or track your order from your account."}
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button asChild>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            {t("footer.quickWhatsapp")}
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={`tel:${CONTACT_PHONE_TEL}`}>{ar ? "اتصال" : "Call"}</a>
        </Button>
        <Button asChild variant="outline">
          <a href={`mailto:${CONTACT_EMAIL}`}>{ar ? "أرسل بريداً" : "Email us"}</a>
        </Button>
      </div>
    </LegalPage>
  );
}
