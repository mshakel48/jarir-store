import { useEffect } from "react";
import { startDeskSync } from "@/lib/store/desk-sync";

export function DeskSync() {
  useEffect(() => {
    startDeskSync();
  }, []);
  return null;
}
