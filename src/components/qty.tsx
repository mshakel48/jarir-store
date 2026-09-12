import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Qty({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex h-11 items-center rounded-md border border-border bg-card", className)}>
      <button
        type="button"
        className="flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        className="flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
