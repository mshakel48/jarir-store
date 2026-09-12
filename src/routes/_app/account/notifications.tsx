import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { useAuthStore } from "@/lib/store/auth";

export const Route = createFileRoute("/_app/account/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t } = useT();
  const on = useAuthStore((s) => s.notificationsEnabled);
  const set = useAuthStore((s) => s.setNotifications);
  return (
    <div>
      <h1 className="text-2xl font-semibold">{t("account.notifications")}</h1>
      <label className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => {
            set(e.target.checked);
            toast.success(t("toast.saved"));
          }}
        />
        <span className="text-sm">{t("header.announce")}</span>
      </label>
    </div>
  );
}
