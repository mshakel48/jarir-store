import { fetchDeskOrders, getDeskKey } from "@/lib/desk";
import { useOrdersStore } from "@/lib/store/orders";

let timer: number | null = null;

export function startDeskSync() {
  if (typeof window === "undefined" || timer != null) return;
  if (!getDeskKey()) return;

  const tick = async () => {
    if (!getDeskKey()) return;
    try {
      const remote = await fetchDeskOrders();
      if (Array.isArray(remote)) useOrdersStore.getState().mergeRemote(remote);
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
