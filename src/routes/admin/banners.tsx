import { createFileRoute } from "@tanstack/react-router";
import { HERO_BANNERS } from "@/lib/data/banners";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

function AdminBanners() {
  const { t, locale } = useT();
  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.banners")}</h1>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {HERO_BANNERS.map((b) => (
          <li key={b.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img src={b.image} alt="" className="h-32 w-full object-cover" />
            <div className="p-3">
              <p className="font-medium">{locale === "ar" ? b.titleAr : b.titleEn}</p>
              <Badge className="mt-2">{locale === "ar" ? b.discountAr : b.discountEn}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
