import { Link } from "@tanstack/react-router";
import { BRAND_NAME, BRAND_NAME_EN } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex size-11 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="size-6" fill="none">
        <path
          d="M7 10.5c0-1.4 1.1-2.5 2.5-2.5H16v16H9.5A2.5 2.5 0 0 1 7 21.5v-11Z"
          fill="currentColor"
          opacity="0.35"
        />
        <path
          d="M16 8h6.5A2.5 2.5 0 0 1 25 10.5v11a2.5 2.5 0 0 1-2.5 2.5H16V8Z"
          fill="currentColor"
        />
        <circle cx="20.2" cy="14.2" r="1.15" fill="var(--color-primary)" />
      </svg>
    </span>
  );
}

export function Logo({
  compact = false,
  inverse = false,
  to = "/" as const,
}: {
  compact?: boolean;
  inverse?: boolean;
  to?: "/" | "/admin";
}) {
  return (
    <Link
      to={to}
      className={cn("flex items-center gap-2", inverse ? "text-primary-foreground" : "text-primary")}
      aria-label={`${BRAND_NAME} · ${BRAND_NAME_EN}`}
    >
      <BrandMark className={compact ? "size-10" : "size-11"} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={cn("font-extrabold tracking-tight", compact ? "text-lg" : "text-xl")}>{BRAND_NAME}</span>
        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em]">{BRAND_NAME_EN}</span>
      </span>
    </Link>
  );
}
