import { useEffect } from "react";
import { useLocaleStore } from "@/lib/store/locale";

export function LocaleSync() {
  const locale = useLocaleStore((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale === "ar" ? "ar" : "en";
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.add("antialiased");
  }, [locale]);
  return null;
}
