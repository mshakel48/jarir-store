import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/types";

interface LocaleState {
  locale: Locale;
  city: string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  setCity: (city: string) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "ar",
      city: "riyadh",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => {
        const order: Locale[] = ["ar", "en", "ka"];
        const i = order.indexOf(get().locale);
        set({ locale: order[(i + 1) % order.length] });
      },
      setCity: (city) => set({ city }),
    }),
    { name: "jarir-locale" },
  ),
);
