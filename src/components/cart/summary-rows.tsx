import { formatMoney } from "@/lib/format";
import { installmentAmount } from "@/lib/payments";
import { TAMARA_PARTS } from "@/lib/constants";
import type { Locale, OrderTotals } from "@/lib/types";

export function SummaryRows({
  totals,
  locale,
  t,
  showTamara,
}: {
  totals: OrderTotals;
  locale: Locale;
  t: (k: string, vars?: Record<string, string | number>) => string;
  showTamara?: boolean;
}) {
  const per = installmentAmount(totals.total, TAMARA_PARTS);
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt>{t("cart.subtotal")}</dt>
        <dd className="tabular-nums">{formatMoney(totals.subtotal, locale)}</dd>
      </div>
      <div className="flex justify-between text-success">
        <dt>{t("cart.discount")}</dt>
        <dd className="tabular-nums">{totals.discount ? `− ${formatMoney(totals.discount, locale)}` : "—"}</dd>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <dt>{t("cart.vat")}</dt>
        <dd className="tabular-nums">{formatMoney(totals.vat, locale)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>{t("cart.delivery")}</dt>
        <dd className="tabular-nums">{totals.delivery ? formatMoney(totals.delivery, locale) : t("common.free")}</dd>
      </div>
      {totals.fees ? (
        <div className="flex justify-between">
          <dt>{t("cart.fees")}</dt>
          <dd className="tabular-nums">{formatMoney(totals.fees, locale)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
        <dt>{t("cart.total")}</dt>
        <dd className="tabular-nums">{formatMoney(totals.total, locale)}</dd>
      </div>
      {showTamara ? (
        <div className="flex justify-between text-primary">
          <dt>{t("cart.tamaraPay", { n: TAMARA_PARTS })}</dt>
          <dd className="tabular-nums">{formatMoney(per, locale)}</dd>
        </div>
      ) : null}
    </dl>
  );
}
