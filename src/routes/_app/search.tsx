import { createFileRoute } from "@tanstack/react-router";
import { ProductGrid } from "@/components/catalog/product-grid";
import { useT } from "@/lib/i18n";
import { useViewedStore } from "@/lib/store/viewed";
import { useEffect } from "react";

type Search = { q?: string };

export const Route = createFileRoute("/_app/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const { t } = useT();
  const addSearch = useViewedStore((s) => s.addSearch);
  useEffect(() => {
    if (q) addSearch(q);
  }, [q, addSearch]);
  return <ProductGrid query={q} title={`${t("search.resultsFor")} “${q}”`} />;
}
