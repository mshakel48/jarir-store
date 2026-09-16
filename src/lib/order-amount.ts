import type { Order, OrderTotals } from "@/lib/types";

export const EMPTY_TOTALS: OrderTotals = {
  subtotal: 0,
  discount: 0,
  vat: 0,
  delivery: 0,
  fees: 0,
  total: 0,
};

export function orderTotals(order?: Pick<Order, "totals"> | null): OrderTotals {
  const t = order?.totals;
  if (!t || typeof t.total !== "number") return EMPTY_TOTALS;
  return t;
}

export function orderAmount(order?: Pick<Order, "totals"> | null): number {
  return orderTotals(order).total;
}
