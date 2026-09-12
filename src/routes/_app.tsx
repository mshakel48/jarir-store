import { createFileRoute } from "@tanstack/react-router";
import { StoreShell } from "@/components/layout/store-shell";

export const Route = createFileRoute("/_app")({
  component: StoreShell,
});
