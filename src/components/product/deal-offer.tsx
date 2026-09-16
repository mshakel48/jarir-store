import { Clock } from "lucide-react";
import { useCountdown, useHydrated } from "@/lib/hooks";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { installmentAmount } from "@/lib/payments";
import { TAMARA_PARTS } from "@/lib/constants";
import type { Product } from "@/lib/types";

export function isDealLive(product: Product) {
  if (!product.dealEndsAt) return false;
  return Date.parse(product.dealEndsAt) > Date.now();
}

export function DealCountdown({ endAt, compact }: { endAt: string; compact?: boolean }) {
  const { t } = useT();
  const hydrated = useHydrated();
  const cd = useCountdown(Date.parse(endAt));
  const pad = (n: number) => String(n).padStart(2, "0");
  if (!hydrated) return null;
  if (cd.done) return null;
  const units = [cd.hours, cd.minutes, cd.seconds];
  return (
    <div className={compact ? "flex items-center gap-1.5" : "flex flex-wrap items-center gap-2"}>
      <Clock className="size-3.5 text-primary" aria-hidden />
      <span className="text-xs font-medium text-muted-foreground">{t("product.endsIn")}</span>
      <span className="flex gap-1 font-semibold tabular-nums">
        {units.map((n, i) => (
          <span
            key={i}
            className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] text-primary-foreground"
          >
            {pad(n)}
          </span>
        ))}
      </span>
    </div>
  );
}

export function BnplOffer({ product }: { product: Product }) {
  const { t, locale } = useT();
  const parts = product.installmentParts || TAMARA_PARTS;
  const per = installmentAmount(product.price, parts);
  return (
    <div className="mt-4 space-y-2 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
      <p className="font-semibold text-primary">{t("pay.tamara")}</p>
      <p className="font-medium">{t("product.tamaraPlan", { n: formatMoney(per, locale) })}</p>
      <p className="text-xs text-muted-foreground">
        {parts} × {formatMoney(per, locale)} = {formatMoney(product.price, locale)}
      </p>
      {product.dealEndsAt ? <DealCountdown endAt={product.dealEndsAt} /> : null}
      <p className="text-muted-foreground">{t("product.orCard")}</p>
    </div>
  );
}
