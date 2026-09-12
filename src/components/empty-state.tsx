import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  actionTo = "/",
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: string;
  actionTo?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint ? <p className="mt-2 max-w-sm text-sm text-muted-foreground">{hint}</p> : null}
      {action ? (
        <Button asChild className="mt-6">
          <Link to={actionTo}>{action}</Link>
        </Button>
      ) : null}
    </div>
  );
}
