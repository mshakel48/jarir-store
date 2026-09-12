import { createFileRoute } from "@tanstack/react-router";
import { STORES } from "@/lib/data/stores";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/stores")({
  component: AdminStores,
});

function AdminStores() {
  const { t, locale } = useT();
  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.stores")}</h1>
      <ul className="mt-4 space-y-2">
        {STORES.map((s) => (
          <li key={s.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <p className="font-medium">{locale === "ar" ? s.arabicName : s.name}</p>
            <p className="text-muted-foreground">{locale === "ar" ? s.arabicAddress : s.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
