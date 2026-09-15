import { createFileRoute } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

function AdminReviews() {
  const { t } = useT();
  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.reviews")}</h1>
      <p className="mt-8 rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {t("admin.noReviews")}
      </p>
    </div>
  );
}