import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewedState {
  ids: string[];
  searches: string[];
  record: (productId: string) => void;
  addSearch: (q: string) => void;
  clearSearches: () => void;
}

export const useViewedStore = create<ViewedState>()(
  persist(
    (set, get) => ({
      ids: [],
      searches: [],
      record: (productId) =>
        set({ ids: [productId, ...get().ids.filter((id) => id !== productId)].slice(0, 16) }),
      addSearch: (q) => {
        const query = q.trim();
        if (!query) return;
        set({
          searches: [query, ...get().searches.filter((s) => s.toLowerCase() !== query.toLowerCase())].slice(0, 8),
        });
      },
      clearSearches: () => set({ searches: [] }),
    }),
    { name: "jarir-viewed" },
  ),
);
