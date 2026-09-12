import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-primary", className)} aria-label={`${value} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = value >= i + 1 ? 1 : value > i ? 0.5 : 0;
        return (
          <Star
            key={i}
            className={cn("size-3.5", fill === 1 ? "fill-primary" : fill === 0.5 ? "fill-primary/40" : "fill-transparent text-border")}
          />
        );
      })}
    </span>
  );
}
