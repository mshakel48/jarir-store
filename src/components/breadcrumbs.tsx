import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  const { t } = useT();
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground">
        {t("common.home")}
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1">
          <ChevronLeft className="size-3.5 ltr:rotate-180" />
          {item.to ? (
            <a href={item.to} className="hover:text-foreground">
              {item.label}
            </a>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
