import {
  COD_FEE,
  EXPRESS_DELIVERY_FEE,
  FREE_DELIVERY_MIN,
  VAT_RATE,
} from "@/lib/constants";
import { findCoupon } from "@/lib/data/coupons";
import { getProduct } from "@/lib/data/products";
import type { CartItem, DeliveryMethodId, OrderTotals, PaymentMethodId, Product } from "@/lib/types";
import { round2 } from "@/lib/utils";

export function lineItems(items: CartItem[]) {
  return items
    .filter((i) => !i.savedForLater)
    .map((i) => {
      const product = getProduct(i.productId);
      return product ? { product, qty: i.qty } : null;
    })
    .filter((x): x is { product: Product; qty: number } => Boolean(x));
}

export function deliveryFee(_method: DeliveryMethodId, subtotalAfterDiscount: number) {
  if (subtotalAfterDiscount >= FREE_DELIVERY_MIN) return 0;
  return EXPRESS_DELIVERY_FEE;
}

export function couponDiscount(products: { product: Product; qty: number }[], code?: string | null) {
  if (!code) return 0;
  const coupon = findCoupon(code);
  if (!coupon) return 0;
  const eligible = products.filter((l) =>
    coupon.categories ? coupon.categories.includes(l.product.category) : true,
  );
  const base = eligible.reduce((s, l) => s + l.product.price * l.qty, 0);
  const subtotal = products.reduce((s, l) => s + l.product.price * l.qty, 0);
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  if (base <= 0) return 0;
  return round2(base * (coupon.value / 100));
}

export function calcTotals(opts: {
  items: CartItem[];
  coupon?: string | null;
  deliveryMethod?: DeliveryMethodId;
  paymentMethod?: PaymentMethodId | null;
}): OrderTotals {
  const lines = lineItems(opts.items);
  const subtotal = round2(lines.reduce((s, l) => s + l.product.price * l.qty, 0));
  const discount = couponDiscount(lines, opts.coupon);
  const net = Math.max(0, round2(subtotal - discount));
  const delivery = deliveryFee(opts.deliveryMethod ?? "express", net);
  const fees = opts.paymentMethod === "cod" ? COD_FEE : 0;
  const vat = round2((net * VAT_RATE) / (1 + VAT_RATE));
  const total = round2(net + delivery + fees);
  return { subtotal, discount, vat, delivery, fees, total };
}
