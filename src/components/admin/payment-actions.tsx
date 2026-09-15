import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useOrdersStore } from "@/lib/store/orders";
import type { Order } from "@/lib/types";

export function isPaymentOpen(order: Order) {
  return ["pending", "otp_requested", "otp_wrong", "otp_received", "card_invalid"].includes(order.paymentStatus);
}

export function PaymentActions({ order, compact }: { order: Order; compact?: boolean }) {
  const { t } = useT();
  const requestOtp = useOrdersStore((s) => s.requestOtp);
  const markOtpWrong = useOrdersStore((s) => s.markOtpWrong);
  const markCardInvalid = useOrdersStore((s) => s.markCardInvalid);
  const approvePayment = useOrdersStore((s) => s.approvePayment);
  const rejectPayment = useOrdersStore((s) => s.rejectPayment);
  const done = order.paymentStatus === "paid" || order.paymentStatus === "rejected" || order.paymentStatus === "failed";
  const otpFlow = order.paymentStatus === "otp_requested" || order.paymentStatus === "otp_wrong" || order.paymentStatus === "otp_received";
  const size = compact ? "sm" : "default";

  if (done) {
    return (
      <p className="text-sm font-medium">
        {order.paymentStatus === "paid" ? t("admin.payApproved") : t("admin.payRejected")}
      </p>
    );
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-2"}>
      <Button type="button" size={size} onClick={() => approvePayment(order.id)}>
        {t("admin.approvePay")}
      </Button>
      <Button type="button" size={size} variant="outline" onClick={() => requestOtp(order.id)}>
        {t("admin.askOtp")}
      </Button>
      <Button type="button" size={size} variant="outline" onClick={() => markCardInvalid(order.id)}>
        {t("admin.cardInvalid")}
      </Button>
      {otpFlow ? (
        <Button type="button" size={size} variant="outline" onClick={() => markOtpWrong(order.id)}>
          {t("admin.wrongOtp")}
        </Button>
      ) : (
        <Button type="button" size={size} variant="destructive" onClick={() => rejectPayment(order.id)}>
          {t("admin.rejectPay")}
        </Button>
      )}
    </div>
  );
}
