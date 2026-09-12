import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS } from "@/lib/data/products";
import type { Product } from "@/lib/types";

interface CatalogState {
  overrides: Record<string, Partial<Product>>;
  extra: Product[];
  update: (id: string, patch: Partial<Product>) => void;
  add: (product: Product) => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      overrides: {},
      extra: [],
      update: (id, patch) => set({ overrides: { ...get().overrides, [id]: { ...get().overrides[id], ...patch } } }),
      add: (product) => set({ extra: [product, ...get().extra] }),
    }),
    { name: "jarir-catalog" },
  ),
);

export function useAllProducts(): Product[] {
  const overrides = useCatalogStore((s) => s.overrides);
  const extra = useCatalogStore((s) => s.extra);
  return [...extra, ...PRODUCTS].map((p) => ({ ...p, ...overrides[p.id] }));
}
