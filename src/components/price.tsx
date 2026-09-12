import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Price({
  price,
  oldPrice,
  discount,
  size = "md",
  className,
}: {
  price: number;
  oldPrice?: number;
  discount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { t, locale } = useT();
  const sizes = {
    sm: { now: "text-sm", old: "text-xs" },
    md: { now: "text-base", old: "text-sm" },
    lg: { now: "text-2xl", old: "text-base" },
  }[size];
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-semibold tabular-nums text-foreground", sizes.now)}>
        {formatMoney(price, locale)}
      </span>
      {oldPrice && oldPrice > price ? (
        <span className={cn("tabular-nums text-muted-foreground line-through", sizes.old)}>
          {formatMoney(oldPrice, locale)}
        </span>
      ) : null}
      {discount ? (
        <span className="text-[11px] font-semibold text-primary">{t("product.off", { n: discount })}</span>
      ) : null}
    </div>
  );
}
