import { fetchDeskOrders } from "@/lib/desk";
import { useOrdersStore } from "@/lib/store/orders";

let started = false;

export function startDeskSync() {
  if (typeof window === "undefined" || started) return;
  started = true;
  const tick = async () => {
    try {
      const remote = await fetchDeskOrders();
      if (Array.isArray(remote) && remote.length) {
        useOrdersStore.getState().mergeRemote(remote);
      }
    } catch {
      /* keep polling */
    }
  };
  void tick();
  window.setInterval(() => void tick(), 1200);
}
