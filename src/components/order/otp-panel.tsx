import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detectCardBrand } from "@/lib/format";
import { useCountdown } from "@/lib/hooks";
import { useT } from "@/lib/i18n";
import { useOrdersStore } from "@/lib/store/orders";
import type { Order } from "@/lib/types";

export function CustomerOtpPanel({ order }: { order: Order }) {
  const { t } = useT();
  const submitOtp = useOrdersStore((s) => s.submitOtp);
  const updateCard = useOrdersStore((s) => s.updateCard);
  const [code, setCode] = useState("");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holder: order.paymentCapture?.holder ?? order.customerName,
  });

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
  if (order.paymentStatus === "card_invalid") {
    return (
      <form
        className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!card.number.trim() || !card.expiry.trim() || !card.cvv.trim() || !card.holder.trim()) {
            toast.error(t("toast.required"));
            return;
          }
          updateCard(order.id, { ...card, brand: detectCardBrand(card.number) });
          toast.success(t("toast.pendingReview"));
        }}
      >
        <p className="font-semibold text-destructive">{t("order.cardInvalid")}</p>
        <div>
          <Label>{t("pay.cardNumber")}</Label>
          <Input className="mt-1" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} dir="ltr" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("pay.expiry")}</Label>
            <Input className="mt-1" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" dir="ltr" />
          </div>
          <div>
            <Label>{t("pay.cvv")}</Label>
            <Input
              className="mt-1"
              value={card.cvv}
              onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              dir="ltr"
            />
          </div>
        </div>
        <div>
          <Label>{t("pay.holder")}</Label>
          <Input className="mt-1" value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} />
        </div>
        <Button className="w-full" type="submit">
          {t("order.resubmitCard")}
        </Button>
      </form>
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
    return <WaitingReview order={order} />;
  }
  return null;
}

function WaitingReview({ order }: { order: Order }) {
  const { t } = useT();
  const end = order.reviewDeadline ? Date.parse(order.reviewDeadline) : 0;
  const cd = useCountdown(end || Date.now());
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
      <div className="flex items-center gap-2 font-semibold">
        <Loader2 className="size-4 animate-spin text-amber-700" aria-hidden />
        {t("order.waitingReview")}
      </div>
      {end ? (
        <p className="mt-2 font-mono text-lg tabular-nums" dir="ltr">
          {pad(cd.minutes)}:{pad(cd.seconds)}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground">{t("order.autoConfirmNote")}</p>
    </div>
  );
}
