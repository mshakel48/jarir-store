import { messages as catalog } from "@/lib/i18n/messages";
import { useLocaleStore } from "@/lib/store/locale";
import type { Locale } from "@/lib/types";

const kaAdmin: Record<string, string> = {
  title: "ჯარირის მაღაზიის ადმინი",
  dashboard: "მართვის პანელი",
  products: "პროდუქტები",
  categories: "კატეგორიები",
  orders: "შეკვეთები",
  customers: "კლიენტები",
  inventory: "მარაგი",
  coupons: "კუპონები",
  discounts: "ფასდაკლებები",
  reviews: "შეფასებები",
  banners: "ბანერები",
  stores: "ფილიალები",
  payments: "გადახდები",
  analytics: "ანალიტიკა",
  groupMain: "მთავარი",
  groupCatalog: "კატალოგი",
  groupOps: "მაღაზიის მართვა",
  groupFinance: "ფინანსები",
  groupInsights: "ანგარიშები",
  language: "ენა",
  revenue: "შემოსავალი",
  aov: "შეკვეთის საშუალო ღირებულება",
  inStock: "მარაგშია",
  low: "დაბალი",
  out: "ამოიწურა",
  pending: "მოლოდინში",
  processing: "მუშავდება",
  shipped: "გაგზავნილია",
  delivered: "მიწოდებულია",
  cancelled: "გაუქმებულია",
  enabled: "ჩართული",
  disabled: "გამორთული",
  configured: "მორგებული",
  demo: "დემო",
  storefront: "მაღაზია",
  live: "პირდაპირი",
  onlineNow: "ახლა ონლაინ",
  liveFeed: "ცოცხალი აქტივობა",
  liveUsers: "მომხმარებლები ახლა",
  liveCheckout: "გადახდის კლიენტები",
  noCheckout: "გადახდაში კლიენტი არ არის",
  enteringCard: "ბარათის შევსება",
  incomingOrders: "შემოსული შეკვეთები",
  orderDetails: "შეკვეთის დეტალები",
};

const groupLabels = {
  ar: {
    groupMain: "الرئيسية",
    groupCatalog: "الكتالوج",
    groupOps: "إدارة المتجر",
    groupFinance: "المالية",
    groupInsights: "التقارير",
    language: "اللغة",
  },
  en: {
    groupMain: "Overview",
    groupCatalog: "Catalog",
    groupOps: "Store management",
    groupFinance: "Finance",
    groupInsights: "Reports",
    language: "Language",
  },
};

export const messages = {
  ...catalog,
  ar: { ...catalog.ar, admin: { ...catalog.ar.admin, ...groupLabels.ar } },
  en: { ...catalog.en, admin: { ...catalog.en.admin, ...groupLabels.en } },
  ka: {
    ...catalog.en,
    admin: { ...catalog.en.admin, ...kaAdmin },
    common: { ...catalog.en.common, language: "ქართული" },
  },
};

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
    isKa: locale === "ka",
  };
}
