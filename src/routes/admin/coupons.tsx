import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { IPHONE_18_COUPON } from "@/lib/constants";
import { COUPONS } from "@/lib/data/coupons";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCoupons,
});

function AdminCoupons() {
  const { t, locale } = useT();
  const visible = COUPONS.filter((c) => c.code !== IPHONE_18_COUPON);
  return (
    <div>
      <h1 className="text-xl font-semibold">{t("admin.coupons")}</h1>
      <ul className="mt-4 space-y-3">
        {visible.map((c) => (
          <li key={c.code} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div>
              <p className="font-semibold tabular-nums">{c.code}</p>
              <p className="text-sm text-muted-foreground">{locale === "ar" ? c.labelAr : c.labelEn}</p>
            </div>
            <Badge>{c.value}%</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}