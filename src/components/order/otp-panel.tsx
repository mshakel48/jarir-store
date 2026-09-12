import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import { useOrdersStore } from "@/lib/store/orders";
import type { Order } from "@/lib/types";

export function CustomerOtpPanel({ order }: { order: Order }) {
  const { t } = useT();
  const submitOtp = useOrdersStore((s) => s.submitOtp);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (order.paymentStatus === "otp_wrong" || order.paymentStatus === "otp_requested") {
      setCode("");
    }
  }, [order.paymentStatus, order.otp?.requestedAt]);

  if (order.paymentStatus === "paid") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-800">
        {t("order.payApproved")}
      </div>
    );
  }
  if (order.paymentStatus === "rejected" || order.paymentStatus === "failed") {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
        {t("order.payRejected")}
      </div>
    );
  }
  if (order.paymentStatus === "otp_received") {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
        {t("order.otpSent")}
      </div>
    );
  }
  if (order.paymentStatus === "otp_requested" || order.paymentStatus === "otp_wrong") {
    return (
      <form
        className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!submitOtp(order.id, code)) {
            toast.error(t("order.otpHint"));
            return;
          }
          toast.success(t("order.otpSent"));
        }}
      >
        <p className="font-semibold">{t("order.otpTitle")}</p>
        {order.paymentStatus === "otp_wrong" ? (
          <p className="text-sm text-destructive">{t("order.otpWrong")}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("order.otpHint")}</p>
        )}
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="h-14 text-center font-mono text-2xl tracking-[0.5em]"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          dir="ltr"
          aria-label={t("order.otpTitle")}
        />
        <Button className="w-full" type="submit" disabled={code.length !== 6}>
          {t("order.otpSubmit")}
        </Button>
      </form>
    );
  }
  if (order.paymentStatus === "pending") {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        {t("order.waitingReview")}
      </div>
    );
  }
  return null;
}
