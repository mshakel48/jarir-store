import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translate } from "@/lib/i18n";
import { useLocaleStore } from "@/lib/store/locale";

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (productId) => get().ids.includes(productId),
      toggle: (productId) => {
        const ids = get().ids;
        const locale = useLocaleStore.getState().locale;
        if (ids.includes(productId)) {
          set({ ids: ids.filter((id) => id !== productId) });
          toast(translate(locale, "toast.removedWish"));
        } else {
          set({ ids: [productId, ...ids] });
          toast.success(translate(locale, "toast.addedWish"));
        }
      },
      remove: (productId) => set({ ids: get().ids.filter((id) => id !== productId) }),
    }),
    { name: "jarir-wishlist" },
  ),
);
