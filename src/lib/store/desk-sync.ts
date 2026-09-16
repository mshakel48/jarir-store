import { fetchDeskOrders } from "@/lib/desk";
import { useOrdersStore } from "@/lib/store/orders";

let started = false;

export function startDeskSync() {
  if (typeof window === "undefined" || started) return;
  started = true;

  const tick = async () => {
    try {
      const remote = await fetchDeskOrders();
      if (Array.isArray(remote)) useOrdersStore.getState().mergeRemote(remote);
    } catch {
      /* keep polling */
    }
  };

  const run = () => {
    void tick();
    window.setInterval(() => void tick(), 1000);
  };

  const persist = useOrdersStore.persist;
  if (!persist || persist.hasHydrated()) run();
  else persist.onFinishHydration(run);
}
