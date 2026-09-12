import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Folder,
  Gamepad2,
  Headphones,
  Laptop,
  Library,
  Luggage,
  Palette,
  Pencil,
  Puzzle,
  Smartphone,
  Tv,
} from "lucide-react";
import { useRef } from "react";
import { ICON_PILLS, type PillIcon } from "@/lib/data/categories";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ICONS: Record<PillIcon, typeof BookOpen> = {
  luggage: Luggage,
  smartphone: Smartphone,
  laptop: Laptop,
  tv: Tv,
  pencil: Pencil,
  puzzle: Puzzle,
  folder: Folder,
  palette: Palette,
  book: BookOpen,
  library: Library,
  headphones: Headphones,
  gamepad: Gamepad2,
};

export function CategoryPills() {
  const { t, isAr } = useT();
  const scroller = useRef<HTMLDivElement>(null);

  function slide(dir: number) {
    scroller.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="absolute start-0 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-sm md:flex"
        onClick={() => slide(isAr ? 1 : -1)}
        aria-label="Previous"
      >
        {isAr ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>
      <div ref={scroller} className="no-scrollbar flex gap-3 overflow-x-auto px-11 py-1 md:px-14">
        {ICON_PILLS.map((pill) => {
          const Icon = ICONS[pill.icon];
          const inner = (
            <>
              <span
                className={cn(
                  "flex size-[4.5rem] items-center justify-center rounded-2xl transition-transform group-hover:-translate-y-0.5",
                  pill.tint,
                )}
              >
                <Icon className="size-7 text-foreground/70" strokeWidth={1.4} />
              </span>
              <span className="line-clamp-2 text-center text-[11px] font-medium leading-snug text-foreground/80">
                {t(pill.labelKey)}
              </span>
            </>
          );
          return pill.query ? (
            <Link key={pill.id} to="/search" search={{ q: pill.query }} className="group flex w-[5.75rem] shrink-0 flex-col items-center gap-2">
              {inner}
            </Link>
          ) : (
            <Link
              key={pill.id}
              to="/category/$slug"
              params={{ slug: pill.slug }}
              className="group flex w-[5.75rem] shrink-0 flex-col items-center gap-2"
            >
              {inner}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        className="absolute end-0 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-sm md:flex"
        onClick={() => slide(isAr ? -1 : 1)}
        aria-label="Next"
      >
        {isAr ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
    </div>
  );
}
