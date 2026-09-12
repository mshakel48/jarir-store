import { messages } from "@/lib/i18n/messages";
import { useLocaleStore } from "@/lib/store/locale";
import type { Locale } from "@/lib/types";

function lookup(dict: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (typeof cur !== "object" || cur === null || !(p in cur)) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>) {
  let text = lookup(messages[locale], key) ?? lookup(messages.en, key) ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  return {
    t,
    locale,
    dir: (locale === "ar" ? "rtl" : "ltr") as "rtl" | "ltr",
    isAr: locale === "ar",
  };
}
