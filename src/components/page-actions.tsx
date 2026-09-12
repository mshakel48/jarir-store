import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function PageActions({
  items,
}: {
  items: { to: string; label: string; params?: { slug?: string; id?: string }; search?: { q?: string } }[];
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {items.map((item) => (
        <Button key={`${item.to}-${item.label}`} asChild variant="outline" size="sm">
          <Link to={item.to as "/"} params={item.params as never} search={item.search as never}>
            {item.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
