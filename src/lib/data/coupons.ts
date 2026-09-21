import { IPHONE_18_COUPON, IPHONE_18_COUPON_PCT } from "@/lib/constants";
import type { Coupon } from "@/lib/types";

export const COUPONS: Coupon[] = [
  {
    code: IPHONE_18_COUPON,
    type: "percent",
    value: IPHONE_18_COUPON_PCT,
    productIds: ["iphone-18"],
    labelEn: "25% off iPhone 18 Pro Max (1 TB), then Tamara 24 payments",
    labelAr: "خصم ٢٥٪ على آيفون 18 Pro Max (1 تيرا) ثم تقسيط تمارا على ٢٤ دفعة",
  },
  {
    code: "JARRIR10",
    type: "percent",
    value: 10,
    labelEn: "10% off your order",
    labelAr: "خصم ١٠٪ على طلبك",
  },
  {
    code: "JARIR10",
    type: "percent",
    value: 10,
    labelEn: "10% off your order",
    labelAr: "خصم ١٠٪ على طلبك",
  },
  {
    code: "WELCOME15",
    type: "percent",
    value: 15,
    minSubtotal: 150,
    labelEn: "15% off orders over 150 SAR",
    labelAr: "خصم ١٥٪ للطلبات فوق ١٥٠ ر.س",
  },
  {
    code: "SCHOOL20",
    type: "percent",
    value: 20,
    categories: ["school", "books"],
    labelEn: "20% off school supplies and books",
    labelAr: "خصم ٢٠٪ على المستلزمات المدرسية والكتب",
  },
];

export function findCoupon(code: string) {
  return COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
}
